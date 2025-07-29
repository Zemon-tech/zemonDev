import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ICrucibleProblem } from '../models';

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
  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
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

// --- CORE AI SERVICES ---

/**
 * Generates a chat response using Gemini AI.
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
    // Build the prompt with context and history
    let prompt = `You are a focused coding assistant designed to help engineering students organize their thoughts and approach programming challenges strategically. Your core principles:

## RESPONSE PHILOSOPHY ##
- **BE CONCISE**: Keep responses short, clear, and actionable
- **STIMULATE THINKING**: Ask guiding questions instead of providing direct answers
- **ORGANIZE IDEAS**: Help structure thoughts, break down problems, and suggest research directions
- **NO SOLUTIONS**: Never provide complete code solutions or step-by-step implementations
- **CONTEXTUAL AWARENESS**: Respond appropriately to the conversation context (casual greetings get casual responses, technical questions get technical guidance)

## RESPONSE GUIDELINES ##
- **ALWAYS USE MARKDOWN FORMATTING** for better readability and structure
- **Use emojis appropriately** to make responses more engaging and friendly (but not excessive)
- **Structure responses clearly** with headers, bullet points, and code blocks
- Provide 2-3 key points maximum per response
- Include relevant questions to guide user's thinking
- Suggest research keywords, concepts, or resources when appropriate
- Help identify problem patterns and approaches
- Keep responses under 150 words unless specifically asked for more detail

## MARKDOWN FORMATTING REQUIREMENTS ##
- Use **bold** for emphasis and key concepts
- Use *italic* for subtle emphasis
- Use \`code\` for inline code and technical terms
- Use \`\`\`language\ncode\n\`\`\` for code blocks with syntax highlighting
- Use ### for section headers
- Use - for bullet points
- Use > for important notes or tips
- Use emojis strategically: 🎯 for goals, 💡 for ideas, ⚠️ for warnings, ✅ for confirmations

## WHAT YOU DO ##
✅ Help brainstorm approaches and strategies
✅ Suggest relevant algorithms, data structures, or concepts to research
✅ Ask clarifying questions about requirements
✅ Help break down complex problems into smaller parts
✅ Point out potential edge cases or considerations
✅ Provide debugging direction (not fixes)

## WHAT YOU DON'T DO ##
❌ Write complete solutions or implementations
❌ Debug code line by line
❌ Provide detailed explanations when a simple nudge suffices
❌ Overwhelm with unnecessary context when user asks simple questions
❌ Act as a traditional tutor giving lectures

## RESPONSE ADAPTATION ##
- **Casual messages** (greetings, thanks): Respond briefly and naturally with friendly emojis
- **Technical questions**: Focus on guidance and strategic thinking with clear markdown structure
- **Stuck situations**: Help identify what specific aspect they're struggling with
- **Code review requests**: Point out approach issues, not syntax fixes

`;

    // Add problem context if available
    if (problemContext) {
      prompt += `\n## CURRENT CHALLENGE CONTEXT ##\n`;
      prompt += `**Problem**: ${problemContext.title}\n`;
      prompt += `**Difficulty**: ${problemContext.difficulty}\n`;
      prompt += `**Description**: ${problemContext.description}\n\n`;
    }

    // Add solution draft content if available
    if (solutionDraftContent) {
      prompt += `## USER'S CURRENT WORK ##\n`;
      prompt += `The user has the following draft in progress. Use this to understand their current approach and provide relevant guidance:\n\n`;
      prompt += `\`\`\`\n${solutionDraftContent}\n\`\`\`\n\n`;
    }

    // Add chat history
    prompt += `## CONVERSATION HISTORY ##\n`;
    prompt += formatChatHistory(messages);
    prompt += `\n---\n\nRespond to the user's latest message following the guidelines above. Be contextually appropriate - if it's a simple greeting, respond simply. If it's a technical question, provide focused guidance that encourages their own problem-solving.`;

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
    // Build the prompt with context and history (same as non-streaming)
    let prompt = `You are a focused coding assistant designed to help engineering students organize their thoughts and approach programming challenges strategically. Your core principles:

## RESPONSE PHILOSOPHY ##
- **BE CONCISE**: Keep responses short, clear, and actionable
- **STIMULATE THINKING**: Ask guiding questions instead of providing direct answers
- **ORGANIZE IDEAS**: Help structure thoughts, break down problems, and suggest research directions
- **NO SOLUTIONS**: Never provide complete code solutions or step-by-step implementations
- **CONTEXTUAL AWARENESS**: Respond appropriately to the conversation context (casual greetings get casual responses, technical questions get technical guidance)

## RESPONSE GUIDELINES ##
- Use markdown formatting for clarity
- Provide 2-3 key points maximum per response
- Include relevant questions to guide user's thinking
- Suggest research keywords, concepts, or resources when appropriate
- Help identify problem patterns and approaches
- Keep responses under 150 words unless specifically asked for more detail

## WHAT YOU DO ##
✅ Help brainstorm approaches and strategies
✅ Suggest relevant algorithms, data structures, or concepts to research
✅ Ask clarifying questions about requirements
✅ Help break down complex problems into smaller parts
✅ Point out potential edge cases or considerations
✅ Provide debugging direction (not fixes)

## WHAT YOU DON'T DO ##
❌ Write complete solutions or implementations
❌ Debug code line by line
❌ Provide detailed explanations when a simple nudge suffices
❌ Overwhelm with unnecessary context when user asks simple questions
❌ Act as a traditional tutor giving lectures

## RESPONSE ADAPTATION ##
- **Casual messages** (greetings, thanks): Respond briefly and naturally
- **Technical questions**: Focus on guidance and strategic thinking
- **Stuck situations**: Help identify what specific aspect they're struggling with
- **Code review requests**: Point out approach issues, not syntax fixes

`;

    // Add problem context if available
    if (problemContext) {
      prompt += `\n## CURRENT CHALLENGE CONTEXT ##\n`;
      prompt += `**Problem**: ${problemContext.title}\n`;
      prompt += `**Difficulty**: ${problemContext.difficulty}\n`;
      prompt += `**Description**: ${problemContext.description}\n\n`;
    }

    // Add solution draft content if available
    if (solutionDraftContent) {
      prompt += `## USER'S CURRENT WORK ##\n`;
      prompt += `The user has the following draft in progress. Use this to understand their current approach and provide relevant guidance:\n\n`;
      prompt += `\`\`\`\n${solutionDraftContent}\n\`\`\`\n\n`;
    }

    // Add chat history
    prompt += `## CONVERSATION HISTORY ##\n`;
    prompt += formatChatHistory(messages);
    prompt += `\n---\n\nRespond to the user's latest message following the guidelines above. Be contextually appropriate - if it's a simple greeting, respond simply. If it's a technical question, provide focused guidance that encourages their own problem-solving.`;

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
    
    // Real-time chunking: send words or small phrases (3 words max)
    // This provides the immediate, real-time feel like ChatGPT
    const MAX_WORDS_PER_CHUNK = 3;
    const MAX_WAIT_TIME = 50; // 50ms maximum wait for immediate feel
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullResponse += chunkText;
        buffer += chunkText;
        
        const timeSinceLastChunk = Date.now() - lastChunkTime;
        
        // Split buffer into words to check word count
        const words = buffer.trim().split(/\s+/);
        
        // Send chunk if:
        // 1. We have 3 or more words
        // 2. Or if we've waited 50ms (for immediate feel)
        // 3. Or if we hit a natural break (period, comma, etc.)
        const hasNaturalBreak = /[.!?,;:]/.test(chunkText);
        const hasEnoughWords = words.length >= MAX_WORDS_PER_CHUNK;
        const hasWaitedTooLong = timeSinceLastChunk >= MAX_WAIT_TIME;
        
        if (hasEnoughWords || hasNaturalBreak || hasWaitedTooLong) {
          if (buffer.length > 0) {
            yield {
              content: buffer,
              isComplete: false
            };
            
            // Log timing for debugging (without content)
            const now = Date.now();
            console.log(`Chunk sent in ${now - lastChunkTime}ms: ${words.length} words`);
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
      console.log(`Final chunk: ${buffer.trim().split(/\s+/).length} words`);
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

  const prompt = `
    You are a world-class code reviewer and programming instructor for engineering students.
    Your task is to analyze a student's solution for a given problem.

    ## PROBLEM DETAILS ##
    Title: ${problem.title}
    Description: ${problem.description}
    Difficulty: ${problem.difficulty}
    Functional Requirements:
    ${problem.requirements.functional.join('\n- ')}
    Constraints:
    ${problem.constraints.join('\n- ')}
    Expected Outcome: ${problem.expectedOutcome}

    ## STUDENT'S SOLUTION ##
    \`\`\`
    ${content}
    \`\`\`

    ## YOUR ANALYSIS TASK ##
    Please analyze the solution and provide:
    1. A score from 1-100 based on correctness, efficiency, readability, and adherence to best practices.
    2. Constructive, detailed feedback on the solution's strengths and weaknesses.
    3. A list of specific, actionable suggestions for improvement.
    4. A clear "yes" or "no" on whether the solution meets all stated functional requirements.

    Format your response as a single, clean JSON object with the following structure, and nothing else:
    {
      "score": number,
      "feedback": "string",
      "suggestions": ["string"],
      "meetsRequirements": boolean
    }
  `;

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

  const prompt = `
    You are an expert programming instructor creating hints for a student.

    ## PROBLEM DETAILS ##
    Title: ${problem.title}
    Description: ${problem.description}
    Difficulty: ${problem.difficulty}

    ## YOUR TASK ##
    Generate 3 helpful hints for solving this problem. The hints should:
    1. NOT give away the final solution.
    2. Progress from general guidance to more specific tips.
    3. Guide the user's thinking process.

    Format your response as a single, clean JSON array of strings, and nothing else:
    ["hint 1", "hint 2", "hint 3"]
  `;

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