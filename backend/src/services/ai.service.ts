import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

import { ICrucibleProblem } from '../models';

import { performWebSearch, searchNews, searchScholar, getAnswerBox } from './serpapi.service';
import { getAIConfig, logAIConfig, validateAIConfig } from '../config/ai.config';

// --- PROVIDER ABSTRACTION ---

export type AIProvider = 'openrouter' | 'gemini';

interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

interface AIProviderClient {
  generateResponse(messages: IChatMessage[], context?: any): Promise<IChatResponse>;
  generateStreamingResponse(messages: IChatMessage[], context?: any): AsyncGenerator<IStreamingChatResponse>;
  analyzeSolution(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis>;
  generateHints(problem: ICrucibleProblem): Promise<string[]>;
}

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

// --- PROVIDER RESOLUTION WITH VALIDATION ---

let aiConfig: ReturnType<typeof getAIConfig>;

// Validate configuration on startup
try {
  aiConfig = getAIConfig();
  logAIConfig();
} catch (error) {
  console.error('❌ AI Service initialization failed:', error instanceof Error ? error.message : error);
  console.error('Please check your environment variables and try again.');
  process.exit(1);
}

const resolveProvider = (): AIProvider => {
  return aiConfig.provider;
};

const getProviderConfig = (provider: AIProvider): AIProviderConfig => {
  switch (provider) {
    case 'openrouter':
      return {
        provider: 'openrouter',
        apiKey: aiConfig.openrouter.apiKey,
        model: aiConfig.openrouter.model,
        baseUrl: aiConfig.openrouter.baseUrl
      };
    case 'gemini':
    default:
      return {
        provider: 'gemini',
        apiKey: aiConfig.gemini.apiKey,
        model: 'gemini-2.5-flash'
      };
  }
};

// --- GEMINI INITIALIZATION (Legacy) ---

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

// --- GEMINI PROVIDER IMPLEMENTATION ---

class GeminiProvider implements AIProviderClient {
  private config: AIProviderConfig;
  private model: any;

  constructor(config: AIProviderConfig) {
    this.config = config;
    if (!config.apiKey) {
      console.warn("WARNING: Gemini API key is not set. AI features will be disabled.");
      return;
    }
    const genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = genAI.getGenerativeModel({
      model: config.model || "gemini-2.5-flash",
      generationConfig,
      safetySettings,
    });
  }

  async generateResponse(messages: IChatMessage[], context?: any): Promise<IChatResponse> {
    return await this.generateChatResponseInternal(messages, context?.problemContext, context?.solutionDraftContent);
  }

  async* generateStreamingResponse(messages: IChatMessage[], context?: any): AsyncGenerator<IStreamingChatResponse> {
    yield* this.generateStreamingChatResponseInternal(messages, context?.problemContext, context?.solutionDraftContent);
  }

  async analyzeSolution(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis> {
    return await this.analyzeSolutionInternal(content, problem);
  }

  async generateHints(problem: ICrucibleProblem): Promise<string[]> {
    return await this.generateHintsInternal(problem);
  }

  // Internal methods (moved from existing functions)
  private async generateChatResponseInternal(messages: IChatMessage[], problemContext?: ICrucibleProblem, solutionDraftContent?: string): Promise<IChatResponse> {
    if (!this.config.apiKey) {
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
| **YouTube Links** | Include relevant YouTube URLs; UI auto-embeds videos in chat |

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
      const result = await this.model.generateContent(prompt);
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
  }

  private async* generateStreamingChatResponseInternal(messages: IChatMessage[], problemContext?: ICrucibleProblem, solutionDraftContent?: string): AsyncGenerator<IStreamingChatResponse> {
    if (!this.config.apiKey) {
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
| **YouTube Links** | Include relevant YouTube URLs; UI auto-embeds videos in chat |

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
      const result = await this.model.generateContentStream(prompt);
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
  }

  private async analyzeSolutionInternal(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis> {
    if (!this.config.apiKey) {
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
      const result = await this.model.generateContent(prompt);
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
  }

  private async generateHintsInternal(problem: ICrucibleProblem): Promise<string[]> {
    if (!this.config.apiKey) {
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
      const result = await this.model.generateContent(prompt);
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
  }
}

// OpenRouter Provider Implementation
class OpenRouterProvider implements AIProviderClient {
  private config: AIProviderConfig;
  private baseUrl: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    this.model = config.model || 'openai/gpt-4o-mini';
  }

  async generateResponse(messages: IChatMessage[], context?: any): Promise<IChatResponse> {
    return this.generateChatResponseInternal(messages, context?.problemContext, context?.solutionDraftContent);
  }

  async* generateStreamingResponse(messages: IChatMessage[], context?: any): AsyncGenerator<IStreamingChatResponse> {
    yield* this.generateStreamingChatResponseInternal(messages, context?.problemContext, context?.solutionDraftContent);
  }

  async analyzeSolution(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis> {
    return this.analyzeSolutionInternal(content, problem);
  }

  async generateHints(problem: ICrucibleProblem): Promise<string[]> {
    return this.generateHintsInternal(problem);
  }

  private async generateChatResponseInternal(messages: IChatMessage[], problemContext?: ICrucibleProblem, solutionDraftContent?: string): Promise<IChatResponse> {
    if (!this.config.apiKey) {
      return {
        message: "AI chat is disabled. No API key was provided.",
        error: "MISSING_API_KEY"
      };
    }

    try {
      const lastMessage = messages[messages.length - 1];
      const userMessage = lastMessage?.content || '';

      // Check if we should use web search (same logic as Gemini)
      const useWebSearch = shouldUseWebSearch(userMessage);
      let webSearchResults = null;

      if (useWebSearch) {
        webSearchResults = await performIntelligentWebSearch(userMessage);
      }

      // Build the system prompt (same as Gemini)
      let systemPrompt = `# 🤖 QUILD AI Assistant

You are **QUILD**, an intelligent AI assistant designed to help engineering students with coding and problem-solving. You adapt your responses based on the context and complexity of each query.

## 🎯 Core Principles

| Principle | Description |
|-----------|-------------|
| **Helpful & Educational** | Guide learning rather than just giving answers |
| **Context-Aware** | Match response style to user's needs and query complexity |
| **Current Information** | Use web search results when available for up-to-date information |
| **Conversational** | Be human-friendly and engaging |
| **Structured** | Use proper Markdown formatting, tables, and visual elements when appropriate |
| **YouTube Links** | Include relevant YouTube URLs; UI auto-embeds videos in chat |

## 🌐 Web Search Integration

${webSearchResults ? `
### **Current Web Search Results**
**Query**: "${userMessage}"

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

      // Convert messages to OpenRouter format
      const openRouterMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const response = await this.makeOpenRouterRequest('/chat/completions', {
        model: this.model,
        messages: openRouterMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 4000
      });

      if (response.choices && response.choices[0] && response.choices[0].message) {
        return { message: response.choices[0].message.content };
      } else {
        throw new Error('Invalid response format from OpenRouter');
      }
    } catch (error) {
      console.error('Error in OpenRouter chat response:', error);
      return {
        message: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        error: "OPENROUTER_ERROR"
      };
    }
  }

  private async* generateStreamingChatResponseInternal(messages: IChatMessage[], problemContext?: ICrucibleProblem, solutionDraftContent?: string): AsyncGenerator<IStreamingChatResponse> {
    if (!this.config.apiKey) {
      yield { content: "AI chat is disabled. No API key was provided.", isComplete: true, error: "MISSING_API_KEY" };
      return;
    }

    try {
      const lastMessage = messages[messages.length - 1];
      const userMessage = lastMessage?.content || '';

      // Check if we should use web search (same logic as Gemini)
      const useWebSearch = shouldUseWebSearch(userMessage);
      let webSearchResults = null;

      if (useWebSearch) {
        webSearchResults = await performIntelligentWebSearch(userMessage);
      }

      // Build the system prompt (same structure as Gemini)
      let systemPrompt = `# 🤖 QUILD AI Assistant - Streaming Mode

You are **QUILD**, an intelligent AI assistant for engineering students. Provide helpful, contextually appropriate responses with proper Markdown formatting.

## 🎯 Guidelines

| Guideline | Description |
|-----------|-------------|
| **Conversational** | Be human-friendly and engaging |
| **Context-Aware** | Match response complexity to the query |
| **Web-Enhanced** | Use web search results when available |
| **Educational** | Focus on learning and understanding |
| **Structured** | Use Markdown formatting, tables, and visual elements when appropriate |
| **YouTube Links** | Include relevant YouTube URLs; UI auto-embeds videos in chat |

## 🌐 Web Search Integration

${webSearchResults ? `
### **Current Web Search Results**
**Query**: "${userMessage}"

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

      // Convert messages to OpenRouter format
      const openRouterMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': aiConfig.openrouter.siteUrl || 'http://localhost:3000',
          'X-Title': aiConfig.openrouter.appName || 'Zemon AI Tutor'
        },
        body: JSON.stringify({
          model: this.model,
          messages: openRouterMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6);
              if (data === '[DONE]') {
                yield { content: '', isComplete: true };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  yield { content: parsed.choices[0].delta.content, isComplete: false };
                }
              } catch (parseError) {
                // Skip invalid JSON chunks
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      yield { content: '', isComplete: true };
    } catch (error) {
      console.error('Error in OpenRouter streaming chat response:', error);
      yield { 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again later.", 
        isComplete: true, 
        error: "OPENROUTER_ERROR" 
      };
    }
  }

  private async analyzeSolutionInternal(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis> {
    if (!this.config.apiKey) {
      return {
        score: 0,
        feedback: "AI analysis is disabled. No API key was provided.",
        suggestions: [],
        meetsRequirements: false
      };
    }

    try {
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

      const response = await this.makeOpenRouterRequest('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert code reviewer. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 2000
      });

      if (response.choices && response.choices[0] && response.choices[0].message) {
        const responseText = response.choices[0].message.content;
        try {
          const analysis = JSON.parse(responseText);
          return {
            score: analysis.score || 0,
            feedback: analysis.feedback || "Analysis completed",
            suggestions: analysis.suggestions || [],
            meetsRequirements: analysis.meetsRequirements || false
          };
        } catch (parseError) {
          console.error('Error parsing solution analysis JSON:', parseError);
          return {
            score: 50,
            feedback: responseText,
            suggestions: [],
            meetsRequirements: false
          };
        }
      } else {
        throw new Error('Invalid response format from OpenRouter');
      }
    } catch (error) {
      console.error('Error in OpenRouter solution analysis:', error);
      return {
        score: 0,
        feedback: "I apologize, but I'm having trouble analyzing your solution right now. Please try again later.",
        suggestions: [],
        meetsRequirements: false
      };
    }
  }

  private async generateHintsInternal(problem: ICrucibleProblem): Promise<string[]> {
    if (!this.config.apiKey) {
      return ["AI hint generation is disabled as no API key was provided."];
    }

    try {
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

      const response = await this.makeOpenRouterRequest('/chat/completions', {
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert programming tutor. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        stream: false,
        temperature: 0.5,
        max_tokens: 1000
      });

      if (response.choices && response.choices[0] && response.choices[0].message) {
        const responseText = response.choices[0].message.content;
        try {
          const hintsResponse = JSON.parse(responseText);
          return hintsResponse.hints || hintsResponse || ["Think about the problem step by step."];
        } catch (parseError) {
          console.error('Error parsing hints JSON:', parseError);
          return [responseText];
        }
      } else {
        throw new Error('Invalid response format from OpenRouter');
      }
    } catch (error) {
      console.error('Error in OpenRouter hint generation:', error);
      return ["I apologize, but I'm having trouble generating hints right now. Please try again later."];
    }
  }

  private async makeOpenRouterRequest(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': aiConfig.openrouter.siteUrl || 'http://localhost:3000',
        'X-Title': aiConfig.openrouter.appName || 'Zemon AI Tutor'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }
}

// --- FALLBACK STRATEGY ---

// Provider performance tracking
interface ProviderMetrics {
  successCount: number;
  failureCount: number;
  fallbackCount: number;
  lastFailure?: Date;
  lastSuccess?: Date;
}

const providerMetrics: Record<string, ProviderMetrics> = {
  openrouter: { successCount: 0, failureCount: 0, fallbackCount: 0 },
  gemini: { successCount: 0, failureCount: 0, fallbackCount: 0 }
};

const logProviderEvent = (provider: string, event: 'success' | 'failure' | 'fallback', operationName: string, error?: any) => {
  const metrics = providerMetrics[provider] || { successCount: 0, failureCount: 0, fallbackCount: 0 };
  
  switch (event) {
    case 'success':
      metrics.successCount++;
      metrics.lastSuccess = new Date();
      console.log(`✅ ${provider} ${operationName} succeeded (${metrics.successCount} total successes)`);
      break;
    case 'failure':
      metrics.failureCount++;
      metrics.lastFailure = new Date();
      console.error(`❌ ${provider} ${operationName} failed (${metrics.failureCount} total failures):`, error);
      break;
    case 'fallback':
      metrics.fallbackCount++;
      console.warn(`🔄 Falling back from ${provider} to Gemini for ${operationName} (${metrics.fallbackCount} total fallbacks)`);
      break;
  }
  
  providerMetrics[provider] = metrics;
};

const executeWithFallback = async <T>(
  operation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  operationName: string,
  primaryProviderName: string = 'openrouter'
): Promise<T> => {
  try {
    const result = await operation();
    logProviderEvent(primaryProviderName, 'success', operationName);
    return result;
  } catch (error) {
    logProviderEvent(primaryProviderName, 'failure', operationName, error);
    logProviderEvent(primaryProviderName, 'fallback', operationName);
    
    try {
      const fallbackResult = await fallbackOperation();
      logProviderEvent('gemini', 'success', `${operationName} (fallback)`);
      return fallbackResult;
    } catch (fallbackError) {
      logProviderEvent('gemini', 'failure', `${operationName} (fallback)`, fallbackError);
      throw fallbackError;
    }
  }
};

const executeStreamingWithFallback = async function* <T>(
  operation: () => AsyncGenerator<T>,
  fallbackOperation: () => AsyncGenerator<T>,
  operationName: string,
  primaryProviderName: string = 'openrouter'
): AsyncGenerator<T> {
  try {
    yield* operation();
    logProviderEvent(primaryProviderName, 'success', operationName);
  } catch (error) {
    logProviderEvent(primaryProviderName, 'failure', operationName, error);
    logProviderEvent(primaryProviderName, 'fallback', operationName);
    
    try {
      yield* fallbackOperation();
      logProviderEvent('gemini', 'success', `${operationName} (fallback)`);
    } catch (fallbackError) {
      logProviderEvent('gemini', 'failure', `${operationName} (fallback)`, fallbackError);
      throw fallbackError;
    }
  }
};

// --- PROVIDER FACTORY ---

const createProvider = (provider: AIProvider): AIProviderClient => {
  const config = getProviderConfig(provider);
  
  switch (provider) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openrouter':
      return new OpenRouterProvider(config);
    default:
      return new GeminiProvider(getProviderConfig('gemini'));
  }
};

// --- PROVIDER INSTANCE WITH FALLBACK ---

let primaryProvider: AIProviderClient;
let fallbackProvider: AIProviderClient;

try {
  const currentProvider = resolveProvider();
  primaryProvider = createProvider(currentProvider);
  
  // Always create Gemini as fallback if primary is not Gemini
  if (currentProvider !== 'gemini') {
    try {
      fallbackProvider = createProvider('gemini');
    } catch (fallbackError) {
      console.warn('Failed to create Gemini fallback provider:', fallbackError);
      fallbackProvider = primaryProvider; // Use primary as fallback if Gemini fails
    }
  } else {
    fallbackProvider = primaryProvider; // If primary is Gemini, no separate fallback needed
  }
} catch (error) {
  console.warn('Failed to create primary AI provider, using Gemini:', error);
  primaryProvider = createProvider('gemini');
  fallbackProvider = primaryProvider;
}

// --- FALLBACK-AWARE PROVIDER CLIENT ---

class FallbackAwareProvider implements AIProviderClient {
  private primaryProviderName: string;

  constructor(
    private primary: AIProviderClient,
    private fallback: AIProviderClient,
    private shouldUseFallback: boolean = false
  ) {
    // Determine primary provider name for logging
    this.primaryProviderName = resolveProvider();
  }

  async generateResponse(messages: IChatMessage[], context?: any): Promise<IChatResponse> {
    if (this.shouldUseFallback || this.primary === this.fallback) {
      const result = await this.primary.generateResponse(messages, context);
      logProviderEvent(this.primaryProviderName, 'success', 'generateResponse');
      return result;
    }

    return await executeWithFallback(
      () => this.primary.generateResponse(messages, context),
      () => this.fallback.generateResponse(messages, context),
      'generateResponse',
      this.primaryProviderName
    );
  }

  async* generateStreamingResponse(messages: IChatMessage[], context?: any): AsyncGenerator<IStreamingChatResponse> {
    if (this.shouldUseFallback || this.primary === this.fallback) {
      yield* this.primary.generateStreamingResponse(messages, context);
      logProviderEvent(this.primaryProviderName, 'success', 'generateStreamingResponse');
      return;
    }

    yield* executeStreamingWithFallback(
      () => this.primary.generateStreamingResponse(messages, context),
      () => this.fallback.generateStreamingResponse(messages, context),
      'generateStreamingResponse',
      this.primaryProviderName
    );
  }

  async analyzeSolution(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis> {
    if (this.shouldUseFallback || this.primary === this.fallback) {
      const result = await this.primary.analyzeSolution(content, problem);
      logProviderEvent(this.primaryProviderName, 'success', 'analyzeSolution');
      return result;
    }

    return await executeWithFallback(
      () => this.primary.analyzeSolution(content, problem),
      () => this.fallback.analyzeSolution(content, problem),
      'analyzeSolution',
      this.primaryProviderName
    );
  }

  async generateHints(problem: ICrucibleProblem): Promise<string[]> {
    if (this.shouldUseFallback || this.primary === this.fallback) {
      const result = await this.primary.generateHints(problem);
      logProviderEvent(this.primaryProviderName, 'success', 'generateHints');
      return result;
    }

    return await executeWithFallback(
      () => this.primary.generateHints(problem),
      () => this.fallback.generateHints(problem),
      'generateHints',
      this.primaryProviderName
    );
  }

  // Method to get provider performance metrics
  getProviderMetrics(): Record<string, ProviderMetrics> {
    return { ...providerMetrics };
  }

  // Method to reset metrics (useful for testing)
  resetMetrics(): void {
    Object.keys(providerMetrics).forEach(provider => {
      providerMetrics[provider] = { successCount: 0, failureCount: 0, fallbackCount: 0 };
    });
  }
}

const providerClient = new FallbackAwareProvider(primaryProvider, fallbackProvider);

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
  return await providerClient.generateResponse(messages, { problemContext, solutionDraftContent });
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
  yield* providerClient.generateStreamingResponse(messages, { problemContext, solutionDraftContent });
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
  return await providerClient.analyzeSolution(content, problem);
};

/**
 * Generates helpful hints for a given problem.
 * @param problem The problem to generate hints for.
 * @returns An array of string hints.
 */
export const generateHints = async (problem: ICrucibleProblem): Promise<string[]> => {
  return await providerClient.generateHints(problem);
};

/**
 * Get provider performance metrics for monitoring and debugging
 * @returns Object containing success/failure/fallback counts for each provider
 */
export const getProviderMetrics = (): Record<string, ProviderMetrics> => {
  if (providerClient instanceof FallbackAwareProvider) {
    return providerClient.getProviderMetrics();
  }
  return { ...providerMetrics };
};

/**
 * Reset provider performance metrics (useful for testing)
 */
export const resetProviderMetrics = (): void => {
  if (providerClient instanceof FallbackAwareProvider) {
    providerClient.resetMetrics();
  }
};

/**
 * Get current AI configuration status (without sensitive data)
 * @returns Configuration status object
 */
export const getConfigurationStatus = () => {
  const validation = validateAIConfig();
  
  return {
    provider: aiConfig.provider,
    model: aiConfig.provider === 'openrouter' ? aiConfig.openrouter.model : 'gemini-2.5-flash',
    webSearch: {
      enabled: aiConfig.webSearch.enabled,
      provider: aiConfig.webSearch.provider
    },
    validation: {
      isValid: validation.isValid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      errors: validation.errors,
      warnings: validation.warnings
    },
    fallbackAvailable: aiConfig.gemini.apiKey.length > 0,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validate current configuration and return detailed results
 * @returns Validation results with errors and warnings
 */
export const validateCurrentConfig = () => {
  return validateAIConfig();
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
  // For enhanced response, we'll use the regular provider and add web search results manually
  const response = await providerClient.generateResponse(messages, { problemContext, solutionDraftContent });
  
  // If web search is enabled, perform it and return enhanced response
  if (enableWebSearch) {
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
    const shouldPerformWebSearch = lastUserMessage &&
      (lastUserMessage.content.toLowerCase().includes('search') ||
       lastUserMessage.content.toLowerCase().includes('find') ||
       lastUserMessage.content.toLowerCase().includes('latest') ||
       lastUserMessage.content.toLowerCase().includes('news') ||
       lastUserMessage.content.toLowerCase().includes('research') ||
       lastUserMessage.content.toLowerCase().includes('current') ||
       lastUserMessage.content.toLowerCase().includes('recent'));

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

        return {
          message: response.message,
          webSearchResults: webSearch.status === 'fulfilled' ? webSearch.value : null,
          newsResults: newsSearch.status === 'fulfilled' ? newsSearch.value : null,
          scholarResults: scholarSearch.status === 'fulfilled' ? scholarSearch.value : null,
          answerBox: answerBoxData.status === 'fulfilled' ? answerBoxData.value : null,
          error: response.error
        };
      } catch (searchError) {
        console.warn('Web search failed, continuing with AI response only:', searchError);
      }
    }
  }

  return {
    message: response.message,
    error: response.error
  };
};
