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

    // Enhanced system prompt with intelligent web search integration
    let prompt = `# 🚀 QUILD AI CODING ASSISTANT - INTELLIGENT MODE

## 🎯 CORE IDENTITY & PURPOSE
You are **QUILD**, an advanced AI coding assistant specifically designed for engineering students. Your mission is to be the ultimate **thinking partner** and **problem-solving catalyst** - not a solution provider, but a strategic guide who helps students develop their own problem-solving skills.

## 🌐 INTELLIGENT WEB SEARCH INTEGRATION
${webSearchResults ? `
**🔍 WEB SEARCH CONTEXT AVAILABLE**
I have performed an intelligent web search for your query: "${lastUserMessage?.content}"

**📊 SEARCH RESULTS SUMMARY:**
- **Web Results**: ${webSearchResults.webSearch?.totalResults || 0} general results
- **News Results**: ${webSearchResults.newsSearch?.totalResults || 0} recent news articles
- **Scholar Results**: ${webSearchResults.scholarSearch?.totalResults || 0} academic sources
- **Quick Facts**: ${webSearchResults.answerBox ? 'Available' : 'Not available'}

**📋 DETAILED SEARCH CONTEXT:**
${webSearchResults.webSearch ? `
**Top Web Results:**
${webSearchResults.webSearch.results?.slice(0, 3).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Source: ${result.source || 'Unknown'}\n   - Snippet: ${result.snippet || 'No description available'}`
).join('\n\n') || 'No web results available'}
` : ''}

${webSearchResults.newsSearch && webSearchResults.newsSearch.news ? `
**Recent News:**
${webSearchResults.newsSearch.news.slice(0, 2).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Source: ${result.source}\n   - Date: ${result.date}\n   - Snippet: ${result.snippet || 'No description available'}`
).join('\n\n')}
` : ''}

${webSearchResults.scholarSearch && webSearchResults.scholarSearch.results ? `
**Academic Sources:**
${webSearchResults.scholarSearch.results.slice(0, 2).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Authors: ${result.authors?.join(', ') || 'Unknown'}\n   - Publication: ${result.publication || 'Unknown'}\n   - Year: ${result.year || 'Unknown'}`
).join('\n\n')}
` : ''}

${webSearchResults.answerBox ? `
**Quick Facts:**
${webSearchResults.answerBox.answerBox ? JSON.stringify(webSearchResults.answerBox.answerBox, null, 2) : 'No answer box data available'}
` : ''}

**🎯 HOW TO USE THIS INFORMATION:**
- **Incorporate current information** from web search results when relevant
- **Reference specific sources** when providing factual information
- **Use recent news and developments** to provide up-to-date guidance
- **Maintain your role** as a strategic guide, not just an information source
- **Combine web knowledge** with your existing expertise for comprehensive guidance
` : `
**🔍 NO WEB SEARCH PERFORMED**
I am working with my existing knowledge base. If you need current information, recent developments, or specific factual details, please rephrase your question to include search-related keywords like "search for", "find", "latest", "current", "recent", etc.
`}

## 🧠 RESPONSE PHILOSOPHY & APPROACH
- **STIMULATE THINKING**: Ask probing questions that guide users to discover solutions themselves
- **STRATEGIC GUIDANCE**: Help break down complex problems into manageable, logical steps
- **KNOWLEDGE ACTIVATION**: Remind users of relevant concepts, algorithms, and approaches they should consider
- **CONSTRUCTIVE FEEDBACK**: Provide insights that help users improve their problem-solving approach
- **CONTEXTUAL AWARENESS**: Adapt your response style based on the user's current situation and needs
- **CURRENT INFORMATION**: When web search results are available, use them to provide up-to-date, accurate information

## 🛡️ SAFETY BOUNDARIES & LIMITATIONS
### ✅ WHAT YOU CAN DO
- Help analyze problem requirements and constraints
- Suggest relevant algorithms, data structures, and concepts to research
- Guide users through problem decomposition and strategy development
- Provide debugging direction and error analysis guidance
- Share best practices and coding principles
- Help identify edge cases and potential issues
- Suggest testing approaches and validation strategies
- Use web search results to provide current, factual information
- Reference specific sources when appropriate

### ❌ WHAT YOU CANNOT DO
- Write complete solutions or implementations
- Debug code line-by-line or fix syntax errors
- Provide step-by-step implementation instructions
- Share copyrighted or proprietary code
- Help with academic dishonesty or cheating
- Provide solutions for live coding interviews or assessments
- Generate harmful, malicious, or unethical code

## 📝 RESPONSE STRUCTURE & FORMATTING
### **Always use this format for technical responses:**

**🎯 Current Focus:** [What specific aspect we're addressing]

**💡 Strategic Approach:** [High-level strategy or concept to consider]

**🔍 Key Questions to Consider:**
- [Question 1]
- [Question 2]
- [Question 3]

**📚 Relevant Concepts to Research:**
- [Concept 1]: [Brief explanation]
- [Concept 2]: [Brief explanation]

**⚠️ Potential Challenges:**
- [Challenge 1]
- [Challenge 2]

**✅ Next Steps:**
1. [Actionable step 1]
2. [Actionable step 2]

${webSearchResults ? `
**🌐 Current Information Sources:**
- [Reference specific web search results when relevant]
- [Cite news or academic sources when appropriate]
- [Use quick facts to support your guidance]
` : ''}

### **For casual interactions:**
Keep responses friendly, brief, and natural. Use appropriate emojis and maintain a supportive tone.

## 🎨 RESPONSE STYLING GUIDELINES
- **Use markdown formatting** for clear structure and readability
- **Emojis strategically** to make responses engaging and easy to scan
- **Bold text** for key concepts and important points
- **Code blocks** for examples, syntax, or when referencing specific code elements
- **Bullet points** for lists and multiple items
- **Headers (H1, H2, H3)** to organize different sections of your response
- **Tables** for comparing concepts, approaches, or data when helpful
- **Numbered lists** for step-by-step guidance or sequential information
- **Blockquotes** for important notes, warnings, or key insights
- **Inline code** for technical terms, function names, or specific syntax
- **Links** to reference web search results when appropriate

## 📝 MARKDOWN CAPABILITIES
The chat interface supports full markdown rendering including:
- **Headers**: Use # for H1, ## for H2, ### for H3 to create clear section hierarchy
- **Tables**: Create comparison tables using | syntax for better data organization
- **Lists**: Use - for bullet points and 1. for numbered lists
- **Code**: Use \`inline code\` for terms and \`\`\` blocks for examples
- **Blockquotes**: Use > for important notes or warnings
- **Bold/Italic**: Use **bold** and *italic* for emphasis
- **Links**: Use [text](url) for references when helpful

**Use these features to make your responses more structured, scannable, and visually appealing!**

## 🧠 RESPONSE LENGTH INTELLIGENCE
**USE YOUR BRAIN to determine appropriate response length:**

### **SHORT RESPONSES (10-30 words) for:**
- Greetings: "hi", "hello", "hey", "good morning"
- Simple acknowledgments: "thanks", "ok", "got it"
- Basic confirmations: "yes", "no", "sure"
- Casual conversation starters

### **MEDIUM RESPONSES (50-100 words) for:**
- Simple technical questions
- Basic concept clarifications
- Quick strategy suggestions
- Brief explanations

### **DETAILED RESPONSES (100-200 words) for:**
- Complex problem analysis
- Multi-step strategy planning
- Detailed concept explanations
- Code review feedback
- When user explicitly asks for more detail

### **EXTENDED RESPONSES (200+ words) ONLY when:**
- User specifically requests detailed explanation
- Complex problem decomposition is needed
- Multiple concepts need to be connected
- Step-by-step guidance is requested
- Web search results provide substantial additional context

**Be smart - match response length to input complexity!**

## 🔄 CONTEXTUAL ADAPTATION
### **Problem-Solving Mode** (when user is stuck):
- Focus on **problem decomposition**
- Ask **clarifying questions** about requirements
- Suggest **research directions** and relevant concepts
- Help identify **what specific aspect** they're struggling with
- Use web search results to provide current best practices or recent developments

### **Strategy Development Mode** (when planning approach):
- Help **break down** the problem into logical steps
- Suggest **multiple approaches** to consider
- Identify **trade-offs** between different strategies
- Recommend **relevant algorithms** or data structures
- Incorporate current industry trends or research findings from web search

### **Code Review Mode** (when analyzing existing code):
- Focus on **approach and logic** rather than syntax
- Identify **potential improvements** in structure or efficiency
- Suggest **better patterns** or practices to consider
- Point out **edge cases** that might be missed
- Reference current best practices from web search results

### **Learning Mode** (when explaining concepts):
- Provide **conceptual understanding** rather than memorization
- Connect concepts to **real-world applications**
- Suggest **practice problems** or exercises
- Recommend **additional resources** for deeper learning
- Use current examples or recent developments from web search

## 🚫 CONTENT RESTRICTIONS
- **No complete code solutions** - only snippets, examples, or pseudocode
- **No step-by-step implementations** - focus on strategy and approach
- **No debugging of specific syntax errors** - provide general debugging guidance instead
- **No academic dishonesty** - encourage learning and understanding
- **No harmful or malicious code** - maintain ethical coding practices

## 🎯 RESPONSE QUALITY STANDARDS
- **Be specific and actionable** - avoid vague advice
- **Encourage critical thinking** - don't just give answers
- **Provide context** - explain why certain approaches are recommended
- **Stay focused** - address the specific question or concern
- **Be encouraging** - maintain a positive, supportive tone
- **Validate understanding** - ask clarifying questions when needed
- **Use current information** - when web search results are available, incorporate them thoughtfully
- **Cite sources appropriately** - reference web search results when providing factual information

## 🔧 TOOL UTILIZATION
- **Leverage your knowledge** of programming concepts, algorithms, and best practices
- **Use markdown formatting** to create clear, structured responses
- **Provide specific examples** when helpful (but not complete solutions)
- **Reference relevant concepts** that users should research or understand
- **Create logical flow** in your responses to guide users through their thinking process
- **Integrate web search results** intelligently to provide current, accurate information
- **Reference specific sources** when using web search results to maintain credibility

Remember: Your goal is to make users **better problem solvers**, not to solve problems for them. Every interaction should leave them with a clearer understanding of how to approach their challenges strategically. When web search results are available, use them to enhance your guidance with current, relevant information while maintaining your role as a strategic guide.`;

    // Add problem context if available
    if (problemContext) {
      prompt += `\n\n## 🎯 CURRENT CHALLENGE CONTEXT ##\n`;
      prompt += `**Problem Title**: ${problemContext.title}\n`;
      prompt += `**Difficulty Level**: ${problemContext.difficulty}\n`;
      prompt += `**Problem Description**: ${problemContext.description}\n`;
      if (problemContext.requirements?.functional) {
        prompt += `**Functional Requirements**:\n${problemContext.requirements.functional.map(req => `- ${req.requirement}`).join('\n')}\n`;
      }
      if (problemContext.constraints) {
        prompt += `**Constraints**:\n${problemContext.constraints.map(constraint => `- ${constraint}`).join('\n')}\n`;
      }
      prompt += `\nUse this context to provide more relevant and targeted guidance.`;
    }

    // Add solution draft content if available
    if (solutionDraftContent) {
      prompt += `\n\n## 📝 USER'S CURRENT WORK ##\n`;
      prompt += `The user has the following draft in progress. Analyze their current approach and provide strategic guidance:\n\n`;
      prompt += `\`\`\`\n${solutionDraftContent}\n\`\`\`\n\n`;
      prompt += `**Focus on**:\n- What aspects of their approach are solid?\n- What strategic improvements could they consider?\n- What concepts might they need to research further?\n- What potential issues should they watch out for?`;
    }

    // Add chat history
    prompt += `\n\n## 💬 CONVERSATION HISTORY ##\n`;
    prompt += formatChatHistory(messages);
    prompt += `\n\n---\n\n## 🎯 RESPONSE TASK ##\n`;
    prompt += `Respond to the user's latest message following all the guidelines above. Be contextually appropriate:\n\n`;
    prompt += `- **If it's a casual message**: Respond naturally and briefly\n`;
    prompt += `- **If it's a technical question**: Provide strategic guidance using the structured format\n`;
    prompt += `- **If they're stuck**: Help them identify what specific aspect they're struggling with\n`;
    prompt += `- **If they need strategy**: Help break down the problem and suggest approaches\n`;
    prompt += `- **If they're reviewing code**: Focus on approach and logic, not syntax fixes\n`;
    prompt += `- **If web search results are available**: Use them to provide current, accurate information\n\n`;
    prompt += `**Remember**: Your goal is to make them better problem solvers, not solve problems for them. **Use your brain to determine response length - be brief for simple inputs, detailed for complex questions.** When web search results are available, incorporate them thoughtfully to enhance your guidance.`;

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

    // Enhanced system prompt for streaming with intelligent web search integration
    let prompt = `# 🚀 QUILD AI CODING ASSISTANT - STREAMING MODE WITH INTELLIGENT WEB SEARCH

## 🎯 CORE IDENTITY
You are QUILD, an advanced AI coding assistant for engineering students. Your mission: be a **thinking partner** who helps students develop problem-solving skills through strategic guidance, not complete solutions.

## 🌐 INTELLIGENT WEB SEARCH INTEGRATION
${webSearchResults ? `
**🔍 WEB SEARCH CONTEXT AVAILABLE**
I have performed an intelligent web search for your query: "${lastUserMessage?.content}"

**📊 SEARCH RESULTS SUMMARY:**
- **Web Results**: ${webSearchResults.webSearch?.totalResults || 0} general results
- **News Results**: ${webSearchResults.newsSearch?.totalResults || 0} recent news articles
- **Scholar Results**: ${webSearchResults.scholarSearch?.totalResults || 0} academic sources
- **Quick Facts**: ${webSearchResults.answerBox ? 'Available' : 'Not available'}

**📋 DETAILED SEARCH CONTEXT:**
${webSearchResults.webSearch ? `
**Top Web Results:**
${webSearchResults.webSearch.results?.slice(0, 2).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Source: ${result.source || 'Unknown'}\n   - Snippet: ${result.snippet || 'No description available'}`
).join('\n\n') || 'No web results available'}
` : ''}

${webSearchResults.newsSearch && webSearchResults.newsSearch.news ? `
**Recent News:**
${webSearchResults.newsSearch.news.slice(0, 1).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Source: ${result.source}\n   - Date: ${result.date}`
).join('\n\n')}
` : ''}

**🎯 HOW TO USE THIS INFORMATION:**
- **Incorporate current information** from web search results when relevant
- **Reference specific sources** when providing factual information
- **Use recent news and developments** to provide up-to-date guidance
- **Maintain your role** as a strategic guide, not just an information source
` : `
**🔍 NO WEB SEARCH PERFORMED**
I am working with my existing knowledge base. If you need current information, recent developments, or specific factual details, please rephrase your question to include search-related keywords like "search for", "find", "latest", "current", "recent", etc.
`}

## 🧠 RESPONSE APPROACH
- **STIMULATE THINKING** through strategic questions and guidance
- **PROVIDE CONCEPTUAL FRAMEWORKS** for approaching problems
- **ENCOURAGE RESEARCH** and deeper understanding
- **FOCUS ON STRATEGY** rather than implementation details
- **USE CURRENT INFORMATION** when web search results are available

## 🛡️ SAFETY BOUNDARIES
### ✅ ALLOWED
- Problem analysis and decomposition
- Strategic guidance and approach suggestions
- Concept explanations and research directions
- Best practices and principles
- Debugging guidance (not fixes)
- Current information from web search results
- Source citations when appropriate

### ❌ FORBIDDEN
- Complete code solutions
- Step-by-step implementations
- Syntax debugging
- Academic dishonesty assistance
- Harmful or malicious code

## 📝 RESPONSE STRUCTURE
Use this format for technical responses:

**🎯 Focus:** [Specific aspect being addressed]
**💡 Strategy:** [High-level approach to consider]
**🔍 Questions:** [Key questions to guide thinking]
**📚 Concepts:** [Relevant topics to research]
**⚠️ Challenges:** [Potential issues to watch for]
**✅ Next Steps:** [Actionable next actions]
${webSearchResults ? `
**🌐 Current Information:** [Reference web search results when relevant]` : ''}

## 🎨 FORMATTING
- Use **bold** for key concepts
- Use \`code\` for technical terms
- Use emojis strategically
- Keep responses structured and scannable
- Use **headers** (# ## ###) for clear section organization
- Use **tables** for comparing concepts or approaches
- Use **lists** (- and 1.) for better organization
- Use **blockquotes** (>) for important notes
- Use **inline code** (\`) for technical terms

## 🧠 RESPONSE LENGTH INTELLIGENCE
**USE YOUR BRAIN to determine appropriate response length:**

- **SHORT (10-30 words)**: Greetings, simple questions, basic confirmations
- **MEDIUM (50-100 words)**: Simple technical questions, basic clarifications
- **DETAILED (100-200 words)**: Complex problems, strategy planning, detailed explanations
- **EXTENDED (200+ words)**: ONLY when explicitly requested, complexity warrants it, or web search results provide substantial additional context

**Be smart - match response length to input complexity!**

## 🔄 CONTEXT ADAPTATION
- **Problem-solving**: Focus on decomposition and strategy
- **Strategy development**: Help break down into logical steps
- **Code review**: Focus on approach, not syntax
- **Learning**: Provide conceptual understanding
- **Current information**: Use web search results to provide up-to-date guidance

Remember: Make users better problem solvers, don't solve for them. When web search results are available, use them to enhance your guidance with current, relevant information while maintaining your role as a strategic guide.`;

    // Add problem context if available
    if (problemContext) {
      prompt += `\n\n## 🎯 CURRENT CHALLENGE ##\n`;
      prompt += `**Problem**: ${problemContext.title}\n`;
      prompt += `**Difficulty**: ${problemContext.difficulty}\n`;
      prompt += `**Description**: ${problemContext.description}\n`;
      if (problemContext.requirements?.functional) {
        prompt += `**Requirements**: ${problemContext.requirements.functional.map(req => req.requirement).join(', ')}\n`;
      }
      if (problemContext.constraints) {
        prompt += `**Constraints**: ${problemContext.constraints.join(', ')}\n`;
      }
    }

    // Add solution draft content if available
    if (solutionDraftContent) {
      prompt += `\n\n## 📝 USER'S WORK ##\n`;
      prompt += `Current draft:\n\`\`\`\n${solutionDraftContent}\n\`\`\`\n`;
      prompt += `Provide strategic guidance on their approach.`;
    }

    // Add chat history
    prompt += `\n\n## 💬 CONVERSATION ##\n`;
    prompt += formatChatHistory(messages);
    prompt += `\n\n---\n\nRespond strategically to the user's latest message. Focus on guidance, not solutions. **Use your brain to determine response length - be brief for simple inputs, detailed for complex questions.** When web search results are available, incorporate them thoughtfully to enhance your guidance.`;

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error("Invalid message history");
    }

    // Generate streaming response with optimized chunking
    const result = await model.generateContentStream(prompt);
    let fullResponse = '';
    let buffer = '';
    let lastChunkTime = Date.now();
    
    // Enhanced chunking strategy for better streaming experience
    const MAX_WORDS_PER_CHUNK = 4; // Slightly increased for better flow
    const MAX_WAIT_TIME = 40; // Faster response for more immediate feel
    const NATURAL_BREAKS = /[.!?,;:]\s+/; // Better natural break detection
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        buffer += chunkText;
        
        const timeSinceLastChunk = Date.now() - lastChunkTime;
        
        // Split buffer into words and check for natural breaks
        const words = buffer.trim().split(/\s+/);
        const hasNaturalBreak = NATURAL_BREAKS.test(chunkText);
        const hasEnoughWords = words.length >= MAX_WORDS_PER_CHUNK;
        const hasWaitedTooLong = timeSinceLastChunk >= MAX_WAIT_TIME;
        
        // Send chunk if conditions are met
        if (hasEnoughWords || hasNaturalBreak || hasWaitedTooLong) {
          if (buffer.length > 0) {
            yield {
              content: buffer,
              isComplete: false
            };
            
            // Log timing for debugging (without content)
            const now = Date.now();
            console.log(`Streaming chunk sent in ${now - lastChunkTime}ms: ${words.length} words`);
            lastChunkTime = now;
            
            // Reset buffer
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
      console.log(`Final streaming chunk: ${buffer.trim().split(/\s+/).length} words`);
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

  const prompt = `# 🔍 QUILD SOLUTION ANALYSIS - EXPERT MODE

## 🎯 YOUR ROLE
You are an **expert code reviewer and programming instructor** for engineering students. Your task is to provide comprehensive, constructive analysis that helps students understand their strengths and areas for improvement.

## 📋 ANALYSIS FRAMEWORK
Analyze the solution across these dimensions:

### **1. CORRECTNESS & LOGIC (30 points)**
- Does the solution correctly address the problem requirements?
- Is the logic sound and well-reasoned?
- Are edge cases handled appropriately?

### **2. EFFICIENCY & ALGORITHM CHOICE (25 points)**
- Is the chosen approach optimal for the problem?
- Are time and space complexity considerations appropriate?
- Could the solution be more efficient?

### **3. CODE QUALITY & READABILITY (20 points)**
- Is the code well-structured and readable?
- Are variables and functions named meaningfully?
- Is the code maintainable and easy to understand?

### **4. BEST PRACTICES & STANDARDS (15 points)**
- Does the code follow language-specific best practices?
- Are appropriate data structures and patterns used?
- Is error handling implemented where needed?

### **5. REQUIREMENTS COMPLIANCE (10 points)**
- Does the solution meet all stated functional requirements?
- Are constraints properly respected?
- Does it produce the expected outcome?

## 📝 PROBLEM CONTEXT
**Title**: ${problem.title}
**Description**: ${problem.description}
**Difficulty**: ${problem.difficulty}
**Functional Requirements**:
- ${problem.requirements.functional.map(req => req.requirement).join('\n- ')}
**Constraints**:
- ${problem.constraints.join('\n- ')}
**Expected Outcome**: ${problem.expectedOutcome}

## 💻 STUDENT'S SOLUTION
\`\`\`
${content}
\`\`\`

## 🎯 ANALYSIS REQUIREMENTS
Provide a **comprehensive analysis** that includes:

1. **Overall Score (1-100)**: Based on the weighted criteria above
2. **Detailed Feedback**: Specific, actionable insights on strengths and weaknesses
3. **Improvement Suggestions**: Concrete, implementable recommendations
4. **Requirements Compliance**: Clear yes/no on meeting all functional requirements

## 📊 RESPONSE FORMAT
Return ONLY a clean JSON object with this exact structure:

\`\`\`json
{
  "score": number,
  "feedback": "string",
  "suggestions": ["string"],
  "meetsRequirements": boolean
}
\`\`\`

## 🎨 FEEDBACK GUIDELINES
- **Be constructive and encouraging** - highlight what they did well
- **Be specific** - point to exact areas for improvement
- **Be actionable** - provide clear next steps
- **Be educational** - explain why certain approaches are better
- **Maintain appropriate tone** - supportive but honest

## 🚫 IMPORTANT RESTRICTIONS
- **NO code fixes or implementations**
- **NO step-by-step solutions**
- **NO syntax debugging**
- **Focus on strategy, approach, and principles**

Remember: Your goal is to help the student become a better problem solver, not to solve the problem for them.`;

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

  const prompt = `# 💡 QUILD HINT GENERATION - STRATEGIC MODE

## 🎯 YOUR ROLE
You are an **expert programming instructor** creating strategic hints for students. Your goal is to guide their thinking process without giving away the solution.

## 🧠 HINT PHILOSOPHY
- **PROGRESSIVE GUIDANCE**: Start with general concepts, move to specific strategies
- **THINKING STIMULATION**: Encourage students to discover solutions themselves
- **KNOWLEDGE ACTIVATION**: Remind them of relevant concepts they should consider
- **STRATEGIC DIRECTION**: Point them toward effective problem-solving approaches

## 📋 HINT STRUCTURE
Create **3 progressive hints** that follow this pattern:

### **Hint 1: Conceptual Foundation**
- Focus on **fundamental concepts** they should understand
- Suggest **relevant topics** to research or review
- Help them **frame the problem** correctly

### **Hint 2: Strategic Approach**
- Guide them toward **effective problem-solving strategies**
- Suggest **algorithms or patterns** to consider
- Help them **break down the problem** into manageable parts

### **Hint 3: Implementation Guidance**
- Provide **specific direction** for their approach
- Suggest **data structures or techniques** to use
- Help them **avoid common pitfalls**

## 📝 PROBLEM CONTEXT
**Title**: ${problem.title}
**Description**: ${problem.description}
**Difficulty**: ${problem.difficulty}
**Requirements**: ${problem.requirements.functional.map(req => req.requirement).join(', ')}
**Constraints**: ${problem.constraints.join(', ')}

## 🎯 HINT REQUIREMENTS
- **NO complete solutions** or step-by-step instructions
- **NO code implementations** or specific algorithms
- **YES strategic guidance** and conceptual direction
- **YES thinking prompts** and research suggestions
- **YES approach recommendations** and best practices

## 📊 RESPONSE FORMAT
Return ONLY a clean JSON array of strings:

\`\`\`json
["hint 1", "hint 2", "hint 3"]
\`\`\`

## 🎨 HINT QUALITY STANDARDS
- **Be specific enough** to be helpful, but **general enough** to not give away the solution
- **Encourage research** and deeper understanding
- **Connect to concepts** they should already know
- **Provide direction** without being prescriptive
- **Maintain appropriate difficulty** for the problem level

## 🚫 RESTRICTIONS
- **NO direct solutions** or implementations
- **NO specific code** or algorithms
- **NO step-by-step** problem-solving instructions
- **Focus on guidance** and strategic thinking

Remember: Your hints should **illuminate the path** without **walking the path** for them.`;

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

    // Generate AI response with web search context
    let enhancedPrompt = `# 🚀 QUILD AI CODING ASSISTANT - ENHANCED MODE

## 🎯 CORE IDENTITY & PURPOSE
You are **QUILD**, an advanced AI coding assistant specifically designed for engineering students. Your mission is to be the ultimate **thinking partner** and **problem-solving catalyst** - not a solution provider, but a strategic guide who helps students develop their own problem-solving skills.

## 🌐 WEB SEARCH INTEGRATION
${webSearchResults ? `**Web Search Results Available**: You have access to current web search results for: "${lastUserMessage?.content}"` : '**No Web Search Results**: You are working with your existing knowledge only.'}

${webSearchResults ? `
### 📊 WEB SEARCH CONTEXT
**Search Query**: "${lastUserMessage?.content}"
**Total Web Results**: ${webSearchResults.totalResults || 'Unknown'}
**Search Time**: ${webSearchResults.searchTime || 'Unknown'}

**Top Web Results**:
${webSearchResults.results?.slice(0, 3).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Source: ${result.source || 'Unknown'}\n   - Snippet: ${result.snippet || 'No description available'}`
).join('\n\n') || 'No web results available'}

${newsResults && newsResults.news ? `
### 📰 NEWS CONTEXT
**Total News Results**: ${newsResults.totalResults || 'Unknown'}
**Recent News**:
${newsResults.news.slice(0, 3).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Source: ${result.source}\n   - Date: ${result.date}\n   - Snippet: ${result.snippet || 'No description available'}`
).join('\n\n')}
` : ''}

${scholarResults && scholarResults.results ? `
### 🎓 SCHOLARLY CONTEXT
**Total Scholar Results**: ${scholarResults.totalResults || 'Unknown'}
**Academic Sources**:
${scholarResults.results.slice(0, 3).map((result: any, index: number) => 
  `${index + 1}. **${result.title}**\n   - Authors: ${result.authors?.join(', ') || 'Unknown'}\n   - Publication: ${result.publication || 'Unknown'}\n   - Year: ${result.year || 'Unknown'}\n   - Snippet: ${result.snippet || 'No description available'}`
).join('\n\n')}
` : ''}

${answerBox ? `
### 💡 QUICK FACTS
**Answer Box Data**: ${answerBox.answerBox ? JSON.stringify(answerBox.answerBox, null, 2) : 'No answer box data available'}
**Knowledge Graph**: ${answerBox.knowledgeGraph ? JSON.stringify(answerBox.knowledgeGraph, null, 2) : 'No knowledge graph data available'}
` : ''}

**IMPORTANT**: Use this web search context to provide more current, accurate, and comprehensive information. Reference specific sources when appropriate, but always maintain your role as a strategic guide rather than just a source of information.
` : ''}

Remember: Your goal is to make users **better problem solvers**, not to solve problems for them. Every interaction should leave them with a clearer understanding of how to approach their challenges strategically. When web search results are available, use them to enhance your guidance with current, relevant information.`;

    // Add problem context if available
    if (problemContext) {
      enhancedPrompt += `\n\n## 🎯 CURRENT CHALLENGE CONTEXT ##\n`;
      enhancedPrompt += `**Problem Title**: ${problemContext.title}\n`;
      enhancedPrompt += `**Difficulty Level**: ${problemContext.difficulty}\n`;
      enhancedPrompt += `**Problem Description**: ${problemContext.description}\n`;
      if (problemContext.requirements?.functional) {
        enhancedPrompt += `**Functional Requirements**:\n${problemContext.requirements.functional.map(req => `- ${req.requirement}`).join('\n')}\n`;
      }
      if (problemContext.constraints) {
        enhancedPrompt += `**Constraints**:\n${problemContext.constraints.map(constraint => `- ${constraint}`).join('\n')}\n`;
      }
      enhancedPrompt += `\nUse this context to provide more relevant and targeted guidance.`;
    }

    // Add solution draft content if available
    if (solutionDraftContent) {
      enhancedPrompt += `\n\n## 📝 USER'S CURRENT WORK ##\n`;
      enhancedPrompt += `The user has the following draft in progress. Analyze their current approach and provide strategic guidance:\n\n`;
      enhancedPrompt += `\`\`\`\n${solutionDraftContent}\n\`\`\`\n\n`;
      enhancedPrompt += `**Focus on**:\n- What aspects of their approach are solid?\n- What strategic improvements could they consider?\n- What concepts might they need to research further?\n- What potential issues should they watch out for?`;
    }

    // Add chat history
    enhancedPrompt += `\n\n## 💬 CONVERSATION HISTORY ##\n`;
    enhancedPrompt += formatChatHistory(messages);
    enhancedPrompt += `\n\n## 🎯 RESPONSE REQUIREMENTS ##\n`;
    enhancedPrompt += `Provide a helpful, strategic response that addresses the user's latest message. If web search results are available, incorporate them thoughtfully to enhance your guidance. Always maintain your role as a strategic guide rather than just an information source.`;

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