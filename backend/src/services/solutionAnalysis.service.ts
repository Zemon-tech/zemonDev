import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import env from '../config/env';
import { ICrucibleProblem } from '../models/crucibleProblem.model';
import { IAnalysisParameter, ISolutionAnalysisResult } from '../models/solutionAnalysis.model';

// Define the output interface for the AI response
export interface ISolutionAnalysisResponse {
  overallScore: number;
  aiConfidence: number; 
  summary: string;
  evaluatedParameters: IAnalysisParameter[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    suggestions: string[];
  };
}

// Initialize Gemini 2.5 Pro
const genAI = new GoogleGenerativeAI(env.GEMINI_PRO_API_KEY);

/**
 * Generates a comprehensive analysis of a user's solution
 * @param problemDetails - The details of the problem being solved
 * @param userSolution - The user's submitted solution
 * @param ragDocuments - Relevant documents from the RAG system
 * @param technicalParameters - Technical parameters to evaluate
 * @returns A structured analysis of the solution
 */
export async function generateComprehensiveAnalysis(
  problemDetails: ICrucibleProblem,
  userSolution: string,
  ragDocuments: string[],
  technicalParameters: string[]
): Promise<ISolutionAnalysisResponse> {
  try {
    // Configure the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        responseMimeType: 'application/json',
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Construct the prompt
    const prompt = `
You are a world-class AI system architect and engineering hiring manager with expertise in evaluating technical solutions. Your task is to analyze the user's submitted solution to a programming problem.

## PROBLEM DETAILS ##
Title: ${problemDetails.title}
Description: ${problemDetails.description}
Expected Outcome: ${problemDetails.expectedOutcome}
Difficulty: ${problemDetails.difficulty}
Tags: ${problemDetails.tags.join(', ')}
Functional Requirements: ${problemDetails.requirements.functional.join('\n')}
Non-Functional Requirements: ${problemDetails.requirements.nonFunctional.join('\n')}
Constraints: ${problemDetails.constraints.join('\n')}

## TECHNICAL & ARCHITECTURAL PARAMETERS TO EVALUATE ##
${technicalParameters.join('\n')}

## RELEVANT KNOWLEDGE BASE DOCUMENTS (FOR CONTEXT) ##
${ragDocuments.join('\n\n---\n\n')}

## USER'S SUBMITTED SOLUTION ##
${userSolution}

Based on all the information provided, analyze the user's solution thoroughly. Your analysis should be fair, balanced, and constructive.

IMPORTANT: Return your analysis as a single, valid JSON object that strictly adheres to the following TypeScript interface:

\`\`\`typescript
interface IAnalysisParameter {
  name: string;
  score: number; // Score out of 100
  justification: string; // AI's reasoning for this score
}

interface ISolutionAnalysisResult {
  overallScore: number; // Overall score out of 100
  aiConfidence: number; // A score from 0-100 on how confident you are in your assessment
  summary: string; // A concise summary of the analysis (max 250 words)
  evaluatedParameters: IAnalysisParameter[]; // Evaluation of each technical parameter
  feedback: {
    strengths: string[]; // 2-5 key strengths of the solution
    areasForImprovement: string[]; // 2-5 areas that need improvement
    suggestions: string[]; // 2-5 specific, actionable suggestions
  };
}
\`\`\`

Do not include any explanations, notes, or text outside the JSON object. Ensure your response is a valid, parsable JSON.
`;

    // Call the AI model
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    try {
      const analysisResult = JSON.parse(responseText) as ISolutionAnalysisResponse;
      return analysisResult;
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('AI returned an invalid response format');
    }
  } catch (error) {
    console.error('Error generating solution analysis:', error);
    throw new Error('Failed to generate solution analysis');
  }
} 