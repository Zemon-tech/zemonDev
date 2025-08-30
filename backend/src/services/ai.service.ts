import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

import { ICrucibleProblem } from '../models';

import { performWebSearch, searchNews, searchScholar, getAnswerBox } from './serpapi.service';

// --- INTERFACES ---

export interface ISolutionAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
  meetsRequirements: boolean;
}

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatResponse {
  message: string;
  error?: string;
}

export interface IStreamingChatResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

export interface IEnhancedChatResponse {
  message: string;
  webSearchResults?: any;
  newsResults?: any;
  scholarResults?: any;
  answerBox?: any;
  error?: string;
}

// --- INITIALIZATION ---

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set. AI-powered features will be disabled.");
}

const genAI = new GoogleGenerativeAI(geminiApiKey || '');
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 4096,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig,
  safetySettings,
});

// --- HELPER FUNCTIONS ---

const safeJsonParse = <T>(text: string): T | null => {
  const cleanedText = text.replace(/``````/g, '').trim();
  try {
    return JSON.parse(cleanedText) as T;
  } catch (e) {
    console.error("AI Service: Failed to parse JSON response.", {
      error: e,
      response: cleanedText,
    });
    return null;
  }
};

// Format chat history for Gemini
const formatChatHistory = (messages: IChatMessage[]): string => {
  return messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
};

// Intelligent web search detection
const shouldUseWebSearch = (userMessage: string): boolean => {
  const searchKeywords = [
    'search', 'find', 'latest', 'news', 'research', 'current', 'recent',
    'today', 'yesterday', 'this week', 'this month', 'this year',
    'update', 'trend', 'trending', 'popular', 'new', 'recently',
    'what is', 'how to', 'where to', 'when did', 'who is',
    'latest version', 'current status', 'recent developments',
    'breaking news', 'latest research', 'current events',
    'recent changes', 'latest updates', 'current trends'
  ];

  const message = userMessage.toLowerCase();

  // Check for explicit search requests
  if (searchKeywords.some(keyword => message.includes(keyword))) {
    return true;
  }

  // Check for time-sensitive queries
  const timeIndicators = ['now', 'today', 'current', 'latest', 'recent'];
  if (timeIndicators.some(indicator => message.includes(indicator))) {
    return true;
  }

  // Check for factual queries that might need current information
  const factualPatterns = [
    /\bwhat (is|are)\b/i,
    /\bhow (does|do|can|should)\b/i,
    /\bwhen (did|does|will)\b/i,
    /\bwhere (is|are|can|should)\b/i,
    /\bwho (is|are|can|should)\b/i
  ];

  if (factualPatterns.some(pattern => pattern.test(message))) {
    return true;
  }

  return false;
};

// Perform intelligent web search based on user query
const performIntelligentWebSearch = async (userMessage: string) => {
  try {
    // Extract the most relevant search terms from the user message
    const searchQuery = userMessage
      .replace(/\b(what|how|when|where|who|is|are|can|should|does|do|will|did)\b/gi, '')
      .replace(/\b(search|find|look|get|tell|show)\b/gi, '')
      .trim();

    if (!searchQuery || searchQuery.length < 3) {
      return null;
    }

    console.log(`🔍 Performing intelligent web search for: "${searchQuery}"`);

    // Perform multiple types of searches for comprehensive results
    const [webSearch, newsSearch, scholarSearch, answerBoxData] = await Promise.allSettled([
      performWebSearch(searchQuery, 5),
      searchNews(searchQuery, 3),
      searchScholar(searchQuery, 3),
      getAnswerBox(searchQuery)
    ]);

    const results = {
      query: searchQuery,
      webSearch: webSearch.status === 'fulfilled' ? webSearch.value : null,
      newsSearch: newsSearch.status === 'fulfilled' ? newsSearch.value : null,
      scholarSearch: scholarSearch.status === 'fulfilled' ? scholarSearch.value : null,
      answerBox: answerBoxData.status === 'fulfilled' ? answerBoxData.value : null,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Web search completed for "${searchQuery}"`);
    return results;
  } catch (error) {
    console.warn('Web search failed:', error);
    return null;
  }
};

// --- CORE AI SERVICES ---

/**
 * Generates a chat response using Gemini AI with intelligent web search integration.
 * @param messages Array of previous chat messages
 * @param problemContext Optional problem context to help guide responses
 * @param solutionDraftContent Optional solution draft content to provide context
 * @returns A promise resolving to the AI's response
 */
export const generateChatResponse = async (
  messages: IChatMessage[],
  problemContext?: ICrucibleProblem,
  solutionDraftContent?: string
): Promise<IChatResponse> => {
  if (!geminiApiKey) {
    return {
      message: "AI chat is disabled. No API key was provided.",
      error: "MISSING_API_KEY"
    };
  }

  try {
    // Get the last user message to determine if web search is needed
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    const shouldSearch = lastUserMessage && shouldUseWebSearch(lastUserMessage.content);
    let webSearchResults = null;

    // Perform intelligent web search if needed
    if (shouldSearch) {
      console.log(`🌐 User query suggests web search is needed: "${lastUserMessage.content}"`);
      webSearchResults = await performIntelligentWebSearch(lastUserMessage.content);
    }

    // Enhanced system prompt with intelligent web search integration and proper Markdown formatting
    let prompt = `# 🤖 QUILD AI Assistant

You are **QUILD**, an intelligent AI assistant designed to help engineering students with coding and problem-solving. You adapt your responses based on the context and complexity of each query.

## 🎯 Core Principles

| Principle | Description |
|-----------|-------------|
| **Helpful & Educational** | Guide learning rather than just giving answers |
| **Context-Aware** | Match response style to user's needs and query complexity |
| **Current Information** | Use web search results when available for up-to-date information |
| **Conversational** | Be human-friendly and engaging |
| **Structured** | Use proper Markdown formatting, tables, and visual elements when appropriate |

## 🧠 Response Intelligence

Analyze each query and respond appropriately:

### **For Simple Questions** 
*(e.g., "explain the problem", basic concepts)*
- Give direct, clear explanations
- Use natural, conversational tone
- Keep it concise but complete
- Use basic Markdown formatting for readability

### **For Complex Technical Problems**
*(e.g., algorithm design, architecture decisions)*

Use this structured approach when it adds value:

| Component | Description |
|-----------|-------------|
| 🎯 **Focus** | What we're addressing |
| 💡 **Strategy** | High-level approach |
| 🔍 **Key Questions** | Important considerations |
| 📚 **Concepts** | Relevant topics to explore |
| ⚠️ **Challenges** | Potential issues |
| ✅ **Next Steps** | Actionable recommendations |

### **For Casual Conversation**
- Be friendly and natural
- Keep responses brief and engaging
- Use appropriate emojis sparingly

## 🌐 Web Search Integration

${webSearchResults ? `
### **Current Web Search Results**
**Query**: "${lastUserMessage?.content}"

| Search Type | Results Count |
|-------------|---------------|
| **Web Results** | ${webSearchResults.webSearch?.totalResults || 0} |
| **News Articles** | ${webSearchResults.newsSearch?.totalResults || 0} |
| **Academic Papers** | ${webSearchResults.scholarSearch?.totalResults || 0} |

${webSearchResults.webSearch?.results ? `
### **Key Information Found**

${webSearchResults.webSearch.results.slice(0, 3).map((result: any, i: number) => 
  `#### ${i+1}. ${result.title}
**Source**: ${result.source || 'Unknown'}  
**Snippet**: ${result.snippet || 'No description available'}

---`
).join('\n\n')}

**Instructions**: Use this information naturally in your response to provide current, accurate details. Cite sources when appropriate.
` : 'No detailed web results available.'}
` : `
### **No Web Search Performed**
Working with existing knowledge base.
`}

## 📋 Response Guidelines

| Guideline | Description |
|-----------|-------------|
| **Markdown Formatting** | Use headers, lists, tables, code blocks, and emphasis for clarity |
| **Tables** | Use tables to organize information, comparisons, or structured data |
| **Code Blocks** | Use \`\`\` for code examples with language specification |
| **Emphasis** | Use **bold** and *italic* for important points |
| **Lists** | Use numbered lists for steps, bullet points for features |
| **Web Integration** | Reference web search results when they add value |
| **Educational Focus** | Encourage critical thinking and exploration |
| **Supportive Tone** | Maintain encouraging and helpful demeanor |

## 📚 Current Context

${problemContext ? `
### **Problem Details**

| Field | Value |
|-------|-------|
| **Title** | ${problemContext.title} |
| **Difficulty** | ${problemContext.difficulty} |
| **Description** | ${problemContext.description} |
${problemContext.requirements?.functional ? `**Functional Requirements** | ${problemContext.requirements.functional.map(req => req.requirement).join(', ')}` : ''}
${problemContext.constraints ? `**Constraints** | ${problemContext.constraints.join(', ')}` : ''}

${problemContext.tags && problemContext.tags.length > 0 ? `
### **Problem Tags**
${problemContext.tags.map(tag => `\`${tag}\``).join(' ')}
` : ''}
` : 'No problem context available.'}

${solutionDraftContent ? `
### **User's Current Work**

\`\`\`text
${solutionDraftContent}
\`\`\`
` : ''}

## 💬 Conversation History

${formatChatHistory(messages)}

---

**Respond to the user's latest message in a helpful, appropriate way. Use your judgment to determine the right level of detail and structure. Always use proper Markdown formatting to enhance readability.**`;

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error("Invalid message history");
    }

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response.text()) {
      throw new Error("Empty response from AI");
    }

    return {
      message: response.text()
    };
  } catch (error) {
    console.error("AI Service: Error in generateChatResponse", error);
    return {
      message: "An error occurred while generating the response. Please try again.",
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    };
  }
};

/**
 * Generates a streaming chat response using Gemini AI.
 * @param messages Array of chat messages
 * @param problemContext Optional problem context to help guide responses
 * @param solutionDraftContent Optional solution draft content to provide context
 * @returns An async generator that yields streaming response chunks
 */
export const generateStreamingChatResponse = async function* (
  messages: IChatMessage[],
  problemContext?: ICrucibleProblem,
  solutionDraftContent?: string
): AsyncGenerator<IStreamingChatResponse> {
  if (!geminiApiKey) {
    yield {
      content: "AI chat is disabled. No API key was provided.",
      isComplete: true,
      error: "MISSING_API_KEY"
    };
    return;
  }

  try {
    // Get the last user message to determine if web search is needed
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    const shouldSearch = lastUserMessage && shouldUseWebSearch(lastUserMessage.content);
    let webSearchResults = null;

    // Perform intelligent web search if needed
    if (shouldSearch) {
      console.log(`🌐 User query suggests web search is needed: "${lastUserMessage.content}"`);
      webSearchResults = await performIntelligentWebSearch(lastUserMessage.content);
    }

    // Enhanced system prompt for streaming with proper Markdown formatting
    let prompt = `# 🤖 QUILD AI Assistant - Streaming Mode

You are **QUILD**, an intelligent AI assistant for engineering students. Provide helpful, contextually appropriate responses with proper Markdown formatting.

## 🎯 Guidelines

| Guideline | Description |
|-----------|-------------|
| **Conversational** | Be human-friendly and engaging |
| **Context-Aware** | Match response complexity to the query |
| **Web-Enhanced** | Use web search results when available |
| **Educational** | Focus on learning and understanding |
| **Structured** | Use Markdown formatting, tables, and visual elements when appropriate |

## 🌐 Web Search Integration

${webSearchResults ? `
### **Current Web Search Results**
**Query**: "${lastUserMessage?.content}"

| Search Type | Results Count |
|-------------|---------------|
| **Web Results** | ${webSearchResults.webSearch?.totalResults || 0} |
| **News Articles** | ${webSearchResults.newsSearch?.totalResults || 0} |
| **Academic Papers** | ${webSearchResults.scholarSearch?.totalResults || 0} |

${webSearchResults.webSearch?.results?.slice(0, 2).map((result: any, i: number) => 
  `#### ${i+1}. ${result.title}
**Source**: ${result.source || 'Unknown'}  
**Snippet**: ${result.snippet || 'No description available'}

---`
).join('\n\n') || ''}

**Instructions**: Integrate this information naturally into your response. Cite sources when appropriate.
` : '### **No Web Search Performed**\nWorking with existing knowledge base.'}

## 📚 Problem Context

${problemContext ? `
### **Problem Details**

| Field | Value |
|-------|-------|
| **Title** | ${problemContext.title} |
| **Difficulty** | ${problemContext.difficulty} |
| **Description** | ${problemContext.description} |

${problemContext.tags && problemContext.tags.length > 0 ? `
### **Problem Tags**
${problemContext.tags.map(tag => `\`${tag}\``).join(' ')}
` : ''}
` : 'No problem context available.'}

${solutionDraftContent ? `
### **User's Current Work**

\`\`\`text
${solutionDraftContent}
\`\`\`
` : ''}

## 💬 Conversation History

${formatChatHistory(messages)}

---

**Respond helpfully to the user's latest message. Be natural, educational, and use proper Markdown formatting to enhance readability.**`;

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error("Invalid message history");
    }

    // Generate streaming response
    const result = await model.generateContentStream(prompt);
    let fullResponse = '';
    let buffer = '';
    let lastChunkTime = Date.now();

    // Enhanced chunking strategy
    const MAX_WORDS_PER_CHUNK = 6;
    const MAX_WAIT_TIME = 50;
    const NATURAL_BREAKS = /[.!?,;:]\s+/;

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        buffer += chunkText;

        const timeSinceLastChunk = Date.now() - lastChunkTime;
        const words = buffer.trim().split(/\s+/);
        const hasNaturalBreak = NATURAL_BREAKS.test(chunkText);
        const hasEnoughWords = words.length >= MAX_WORDS_PER_CHUNK;
        const hasWaitedTooLong = timeSinceLastChunk >= MAX_WAIT_TIME;

        if (hasEnoughWords || hasNaturalBreak || hasWaitedTooLong) {
          if (buffer.length > 0) {
            yield {
              content: buffer,
              isComplete: false
            };

            lastChunkTime = Date.now();
            buffer = '';
          }
        }
      }
    }

    // Send any remaining buffer content
    if (buffer.length > 0) {
      yield {
        content: buffer,
        isComplete: false
      };
    }

    // Signal completion
    yield {
      content: '',
      isComplete: true
    };
  } catch (error) {
    console.error("AI Service: Error in generateStreamingChatResponse", error);
    yield {
      content: "An error occurred while generating the response. Please try again.",
      isComplete: true,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
    };
  }
};

/**
 * Analyzes a user's solution for a given problem using Gemini AI.
 * @param content The code or text content of the solution.
 * @param problem The crucible problem the solution is for.
 * @returns An object containing the analysis results.
 */
export const analyzeSolution = async (
  content: string,
  problem: ICrucibleProblem
): Promise<ISolutionAnalysis> => {
  if (!geminiApiKey) {
    return {
      score: 0,
      feedback: "AI analysis is disabled. No API key was provided.",
      suggestions: [],
      meetsRequirements: false,
    };
  }

  const prompt = `# 🔍 Solution Analysis

You are an **expert code reviewer** analyzing a student's solution. Provide constructive feedback that helps them improve.

## 📋 Problem Context

| Field | Value |
|-------|-------|
| **Title** | ${problem.title} |
| **Description** | ${problem.description} |
| **Difficulty** | ${problem.difficulty} |
| **Expected Outcome** | ${problem.expectedOutcome} |

### **Requirements**
${problem.requirements.functional.map((req, i) => `${i+1}. ${req.requirement}`).join('\n')}

### **Constraints**
${problem.constraints.map((constraint, i) => `${i+1}. ${constraint}`).join('\n')}

## 💻 Student's Solution

\`\`\`text
${content}
\`\`\`

## 📊 Analysis Framework

Evaluate the solution using the following criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Correctness & Logic** | 30% | Does it solve the problem correctly? |
| **Efficiency** | 25% | Is the approach optimal? |
| **Code Quality** | 20% | Is it readable and well-structured? |
| **Best Practices** | 15% | Does it follow good coding standards? |
| **Requirements Compliance** | 10% | Does it meet all requirements? |

## 📝 Required Response Format

Return **ONLY** a JSON object with this structure:

\`\`\`json
{
  "score": [number 1-100],
  "feedback": "[detailed constructive feedback]",
  "suggestions": ["[specific improvement suggestion 1]", "[suggestion 2]", "[suggestion 3]"],
  "meetsRequirements": [true/false]
}
\`\`\`

**Provide specific, actionable feedback that helps the student learn and improve.**`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const analysis = safeJsonParse<ISolutionAnalysis>(responseText);

    if (!analysis) {
      throw new Error("Failed to parse the analysis from AI response.");
    }

    return analysis;
  } catch (error) {
    console.error("AI Service: Error in analyzeSolution", error);
    return {
      score: 0,
      feedback: "An error occurred while communicating with the AI service. Please try again later.",
      suggestions: [],
      meetsRequirements: false,
    };
  }
};

/**
 * Generates helpful hints for a given problem.
 * @param problem The problem to generate hints for.
 * @returns An array of string hints.
 */
export const generateHints = async (problem: ICrucibleProblem): Promise<string[]> => {
  if (!geminiApiKey) {
    return ["AI hint generation is disabled as no API key was provided."];
  }

  const prompt = `# 💡 Hint Generation

Generate **3 progressive hints** for this programming problem. Each hint should guide thinking without giving away the solution.

## 📋 Problem Details

| Field | Value |
|-------|-------|
| **Title** | ${problem.title} |
| **Description** | ${problem.description} |
| **Difficulty** | ${problem.difficulty} |

### **Requirements**
${problem.requirements.functional.map((req, i) => `${i+1}. ${req.requirement}`).join('\n')}

### **Constraints**
${problem.constraints.map((constraint, i) => `${i+1}. ${constraint}`).join('\n')}

## 🎯 Hint Structure

| Level | Type | Focus |
|-------|------|-------|
| **1** | **Conceptual Hint** | Key concepts or problem type |
| **2** | **Strategic Hint** | Approach or algorithm category |
| **3** | **Implementation Hint** | Specific guidance on execution |

## 📝 Requirements

- ✅ **Guide thinking**, don't solve the problem
- ✅ **Be helpful** but not prescriptive
- ✅ **Encourage exploration** and learning
- ✅ **Match the problem difficulty** level

## 📄 Required Response Format

Return **ONLY** a JSON array of 3 hint strings:

\`\`\`json
["hint 1", "hint 2", "hint 3"]
\`\`\``;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const hints = safeJsonParse<string[]>(responseText);

    if (!hints || !Array.isArray(hints)) {
      throw new Error("Failed to parse hints from AI response.");
    }

    return hints;
  } catch (error) {
    console.error("AI Service: Error in generateHints", error);
    return ["An error occurred while generating hints. Please try again later."];
  }
};

/**
 * Generates an enhanced chat response with web search capabilities
 * @param messages Array of previous chat messages
 * @param problemContext Optional problem context
 * @param solutionDraftContent Optional solution draft content
 * @param enableWebSearch Whether to enable web search for relevant queries
 * @returns Enhanced chat response with web search results
 */
export const generateEnhancedChatResponse = async (
  messages: IChatMessage[],
  problemContext?: ICrucibleProblem,
  solutionDraftContent?: string,
  enableWebSearch: boolean = false
): Promise<IEnhancedChatResponse> => {
  if (!geminiApiKey) {
    return {
      message: "AI chat is disabled. No API key was provided.",
      error: "MISSING_API_KEY"
    };
  }

  try {
    // Get the last user message to determine if web search is needed
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    const shouldPerformWebSearch = enableWebSearch && lastUserMessage &&
      (lastUserMessage.content.toLowerCase().includes('search') ||
       lastUserMessage.content.toLowerCase().includes('find') ||
       lastUserMessage.content.toLowerCase().includes('latest') ||
       lastUserMessage.content.toLowerCase().includes('news') ||
       lastUserMessage.content.toLowerCase().includes('research') ||
       lastUserMessage.content.toLowerCase().includes('current') ||
       lastUserMessage.content.toLowerCase().includes('recent'));

    let webSearchResults = null;
    let newsResults = null;
    let scholarResults = null;
    let answerBox = null;

    // Perform web search if enabled and relevant
    if (shouldPerformWebSearch) {
      try {
        const searchQuery = lastUserMessage!.content;
        
        // Perform multiple types of searches
        const [webSearch, newsSearch, scholarSearch, answerBoxData] = await Promise.allSettled([
          performWebSearch(searchQuery, 5),
          searchNews(searchQuery, 5),
          searchScholar(searchQuery, 5),
          getAnswerBox(searchQuery)
        ]);

        if (webSearch.status === 'fulfilled') webSearchResults = webSearch.value;
        if (newsSearch.status === 'fulfilled') newsResults = newsSearch.value;
        if (scholarSearch.status === 'fulfilled') scholarResults = scholarSearch.value;
        if (answerBoxData.status === 'fulfilled') answerBox = answerBoxData.value;
      } catch (searchError) {
        console.warn('Web search failed, continuing with AI response only:', searchError);
      }
    }

    // Generate AI response with web search context and proper Markdown formatting
    let enhancedPrompt = `# 🤖 QUILD AI Assistant - Enhanced Mode

You are **QUILD**, an intelligent AI assistant for engineering students. Provide helpful responses using available context and web search results with proper Markdown formatting.

## 🌐 Web Search Integration

${webSearchResults ? `
### **Current Web Search Results**
**Query**: "${lastUserMessage?.content}"

| Search Type | Results Count |
|-------------|---------------|
| **Web Results** | ${webSearchResults.totalResults || 0} |
| **News Articles** | ${newsResults?.totalResults || 0} |
| **Academic Papers** | ${scholarResults?.totalResults || 0} |

### **Key Information Found**

${webSearchResults.results?.slice(0, 3).map((result: any, i: number) => 
  `#### ${i+1}. ${result.title}
**Source**: ${result.source || 'Unknown'}  
**Snippet**: ${result.snippet || 'No description available'}

---`
).join('\n\n')}

**Instructions**: Use this current information to enhance your response naturally. Cite sources when appropriate.
` : '### **No Web Search Results Available**\nWorking with existing knowledge base.'}

## 📚 Problem Context

${problemContext ? `
### **Problem Details**

| Field | Value |
|-------|-------|
| **Title** | ${problemContext.title} |
| **Difficulty** | ${problemContext.difficulty} |
| **Description** | ${problemContext.description} |

${problemContext.requirements?.functional ? `
### **Functional Requirements**
${problemContext.requirements.functional.map((req, i) => `${i+1}. ${req.requirement}`).join('\n')}
` : ''}

${problemContext.constraints ? `
### **Constraints**
${problemContext.constraints.map((constraint, i) => `${i+1}. ${constraint}`).join('\n')}
` : ''}

${problemContext.tags && problemContext.tags.length > 0 ? `
### **Problem Tags**
${problemContext.tags.map(tag => `\`${tag}\``).join(' ')}
` : ''}
` : 'No problem context available.'}

${solutionDraftContent ? `
### **User's Current Work**

\`\`\`text
${solutionDraftContent}
\`\`\`
` : ''}

## 💬 Conversation History

${formatChatHistory(messages)}

---

**Provide a helpful, comprehensive response that addresses the user's query while incorporating available web search results naturally. Use proper Markdown formatting to enhance readability.**`;

    const result = await model.generateContent(enhancedPrompt);
    const responseText = result.response.text();

    return {
      message: responseText,
      webSearchResults,
      newsResults,
      scholarResults,
      answerBox
    };
  } catch (error) {
    console.error("AI Service: Error in generateEnhancedChatResponse", error);
    return {
      message: "An error occurred while generating the enhanced response. Please try again later.",
      error: "AI_SERVICE_ERROR"
    };
  }
};
