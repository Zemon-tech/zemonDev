import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";
import { ICrucibleProblem } from '../models';

// --- INTERFACES ---

export interface ISolutionAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
  meetsRequirements: boolean;
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

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig,
});

// --- HELPER FUNCTIONS ---

/**
 * Safely parses a JSON string from the AI's text response.
 * Handles cases where the JSON is wrapped in markdown ```json ... ```
 * @param text The raw text response from the AI.
 * @returns The parsed JSON object or null if parsing fails.
 */
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

// --- CORE AI SERVICES ---

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