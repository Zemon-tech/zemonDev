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
    let prompt = "You are an AI tutor helping engineering students solve programming challenges. ";
    prompt += "Your responses should be clear, educational, and guide students towards understanding rather than giving direct solutions.\n\n";

    // Add problem context if available
    if (problemContext) {
      prompt += `Current Problem:\nTitle: ${problemContext.title}\n`;
      prompt += `Description: ${problemContext.description}\n`;
      prompt += `Difficulty: ${problemContext.difficulty}\n\n`;
    }

    // Add solution draft content if available
    if (solutionDraftContent) {
      prompt += "## USER'S CURRENT SOLUTION DRAFT ##\n";
      prompt += "The user is currently working on the following draft. Please consider this when providing assistance:\n";
      prompt += "```\n" + solutionDraftContent + "\n```\n\n";
    }

    // Add chat history
    prompt += "Previous conversation:\n";
    prompt += formatChatHistory(messages);

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