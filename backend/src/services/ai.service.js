import { GoogleGenerativeAI } from "@google/genai";
import logger from '../utils/logger.js';

// Initialize the Gemini API client
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Get the Gemini Pro model
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 4096,
  },
});

/**
 * Analyzes a solution using Gemini AI
 * @param {string} content - The solution content to analyze
 * @param {object} problem - The problem details
 * @returns {object} Analysis results with score, feedback, and suggestions
 */
export const analyzeSolution = async (content, problem) => {
  try {
    // Create a prompt that includes the problem and solution
    const prompt = `
    You are an expert code reviewer and programming instructor. 
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    Difficulty: ${problem.difficulty}
    
    Functional Requirements:
    ${problem.requirements.functional.join('\n')}
    
    Non-Functional Requirements:
    ${problem.requirements.nonFunctional.join('\n')}
    
    Constraints:
    ${problem.constraints.join('\n')}
    
    Expected Outcome:
    ${problem.expectedOutcome}
    
    SOLUTION CODE:
    ${content}
    
    Please analyze this solution and provide:
    1. A score from 1-10 based on correctness, efficiency, readability, and best practices
    2. Detailed feedback on the solution's strengths and weaknesses
    3. A list of specific suggestions for improvement
    4. Whether the solution meets all functional requirements (yes/no)
    
    Format your response as a JSON object with the following structure:
    {
      "score": number,
      "feedback": "string",
      "suggestions": ["string"],
      "meetsRequirements": boolean
    }
    
    Only return the JSON object, nothing else.
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const analysis = JSON.parse(text);
      return analysis;
    } catch (parseError) {
      logger.error('Failed to parse AI analysis:', parseError);
      return {
        score: 5,
        feedback: "Analysis could not be parsed. Please try again later.",
        suggestions: ["Request a new analysis"],
        meetsRequirements: false
      };
    }
  } catch (error) {
    logger.error('Error in AI analysis:', error);
    throw new Error('Failed to analyze solution');
  }
};

/**
 * Generates hints for a problem
 * @param {object} problem - The problem to generate hints for
 * @returns {array} Array of hints
 */
export const generateHints = async (problem) => {
  try {
    const prompt = `
    You are an expert programming instructor.
    
    PROBLEM:
    ${problem.title}
    ${problem.description}
    
    Difficulty: ${problem.difficulty}
    
    Functional Requirements:
    ${problem.requirements.functional.join('\n')}
    
    Non-Functional Requirements:
    ${problem.requirements.nonFunctional.join('\n')}
    
    Constraints:
    ${problem.constraints.join('\n')}
    
    Expected Outcome:
    ${problem.expectedOutcome}
    
    Please generate 3 helpful hints for solving this problem. The hints should:
    1. Not give away the solution directly
    2. Progress from general guidance to more specific tips
    3. Help the user think through the problem methodically
    
    Format your response as a JSON array of strings:
    ["hint1", "hint2", "hint3"]
    
    Only return the JSON array, nothing else.
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const hints = JSON.parse(text);
      return hints;
    } catch (parseError) {
      logger.error('Failed to parse AI hints:', parseError);
      return ["Could not generate hints. Please try again later."];
    }
  } catch (error) {
    logger.error('Error generating hints:', error);
    throw new Error('Failed to generate hints');
  }
};

export default {
  analyzeSolution,
  generateHints
}; 