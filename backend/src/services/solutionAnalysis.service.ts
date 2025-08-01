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

// Add specific error types for different failure scenarios
export class GeminiModelOverloadError extends Error {
  constructor(message: string = 'Gemini model is currently overloaded. Please try again later.') {
    super(message);
    this.name = 'GeminiModelOverloadError';
  }
}

export class GeminiParsingError extends Error {
  constructor(message: string = 'Failed to parse Gemini response.') {
    super(message);
    this.name = 'GeminiParsingError';
  }
}

export class GeminiServiceError extends Error {
  constructor(message: string = 'Gemini service error occurred.') {
    super(message);
    this.name = 'GeminiServiceError';
  }
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

    // Log information about the inputs
    console.log(`Generating analysis for problem: ${problemDetails.title}`);
    console.log(`User solution length: ${userSolution.length} characters`);
    console.log(`RAG documents: ${ragDocuments.length} documents retrieved`);
    console.log(`Technical parameters: ${technicalParameters.length} parameters to evaluate`);
    
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
${technicalParameters.length > 0 
  ? technicalParameters.join('\n') 
  : `
- Code Quality: Evaluate the overall code quality, readability, and maintainability
- Performance: Assess the solution's performance characteristics and efficiency
- Correctness: Determine if the solution correctly addresses all requirements
- Design: Evaluate the architectural design and structure of the solution
- Error Handling: Assess how well the solution handles edge cases and errors
`}

## RELEVANT KNOWLEDGE BASE DOCUMENTS (FOR CONTEXT) ##
${ragDocuments.length > 0 
  ? ragDocuments.join('\n\n---\n\n') 
  : "No additional context documents are available. Please evaluate based on the problem details and solution provided."}

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
    console.log('Sending prompt to Gemini 2.5 Pro...');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Received response from Gemini 2.5 Pro');
    
    // Parse the JSON response
    try {
      console.log('Parsing AI response as JSON...');
      const analysisResult = JSON.parse(responseText) as ISolutionAnalysisResponse;
      console.log('Successfully parsed AI response');
      return analysisResult;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response (first 200 chars):', responseText.substring(0, 200));
      
      // Throw specific error instead of returning fallback
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new GeminiParsingError(`Failed to parse AI response: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error generating solution analysis:', error);
    
    // Type guard to safely access error properties
    const isErrorWithStatus = (err: unknown): err is { status?: number; statusText?: string; message?: string } => {
      return typeof err === 'object' && err !== null && ('status' in err || 'message' in err);
    };
    
    // Check for specific Gemini errors and throw appropriate custom errors
    if (isErrorWithStatus(error)) {
      if (error.status === 503 || error.message?.includes('overloaded')) {
        throw new GeminiModelOverloadError('The AI model is currently overloaded. Please try again later.');
      }
      
      if (error.status === 429 || error.message?.includes('rate limit')) {
        throw new GeminiModelOverloadError('Rate limit exceeded. Please try again later.');
      }
      
      if (error.status && error.status >= 500) {
        throw new GeminiServiceError(`Gemini service error (${error.status}): ${error.statusText || 'Unknown error'}`);
      }
    }
    
    // For other errors, throw a generic service error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new GeminiServiceError(`Unexpected error: ${errorMessage}`);
  }
} 