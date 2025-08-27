import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import env from '../config/env';
import { ICrucibleProblem } from '../models/crucibleProblem.model';
import SolutionAnalysis, { IAnalysisParameter, ISolutionAnalysisResult } from '../models/solutionAnalysis.model';
import mongoose, { ClientSession, Types } from 'mongoose';
import { markProblemSolved, MarkProblemSolvedResult } from './userProgress.service';

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

// Initialize Gemini with fallback to process.env for compatibility with other services
const genAI = new GoogleGenerativeAI(env.GEMINI_PRO_API_KEY || process.env.GEMINI_API_KEY || '');

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
    // Configure the model (switching to the same model used by chat for stability)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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
You are a world-class AI system architect and a neutral evaluator. Perform a blind, evidence-based review of the user's solution for the given programming problem. Optimize for fairness and objectivity.

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
  : "No additional context documents are available. Evaluate strictly based on the problem details and solution provided."}

## USER'S SUBMITTED SOLUTION ##
${userSolution}

## FAIRNESS AND OBJECTIVITY POLICY ##
- No stylistic or technology bias: Do not favor any specific language, framework, or paradigm. Judge only against stated requirements, general engineering principles, and evidence present in the solution.
- Evidence-based reasoning: When deducting points, base the deduction on concrete observations in the solution or explicit requirements/constraints. Avoid assumptions beyond the provided context.
- Handle unknowns neutrally: If information is missing or ambiguous, mark it as "Insufficient evidence" in justifications and do not penalize. Reflect uncertainty in aiConfidence instead.
- Give partial credit: Award points for correctly handled portions even if the solution is incomplete.
- Respect trade-offs: If the solution makes a reasonable trade-off (e.g., clarity over micro-optimizations) that fits the constraints, do not penalize.
- Unconventional but valid: Do not penalize novel approaches if they satisfy the requirements and constraints.

## SCORING RUBRIC (ANCHORS) ##
- 90–100: Exceptional – Thorough, correct, robust, and well-justified relative to requirements and constraints.
- 75–89: Solid – Correct with minor issues or reasonable trade-offs; generally production-ready with small improvements.
- 60–74: Adequate – Meets core requirements with notable gaps; needs meaningful fixes before production.
- 40–59: Partial – Addresses some requirements but with major issues or omissions.
- 0–39: Poor – Largely incorrect, unsafe, or fails to meet core requirements.

## ANALYSIS INSTRUCTIONS ##
- Tie each parameter's justification to specific evidence: reference the requirement, constraint, or a brief snippet/paraphrase (≤200 characters) from the user's solution.
- If a parameter cannot be assessed due to missing information, state "Insufficient evidence" and avoid penalization for that unknown.
- Consider problem difficulty and constraints when judging complexity, performance, and design choices.
- Suggestions must be specific and actionable within the problem context; avoid prescribing a particular stack unless required by constraints.
- Keep the tone professional and constructive.

## OUTPUT SCHEMA ##
\`\`\`typescript
interface IAnalysisParameter {
  name: string;
  score: number; // Score out of 100 (integers preferred)
  justification: string; // Reasoning tied to explicit evidence or "Insufficient evidence"
}

// (wrapper definitions moved below, outside of prompt string)

interface ISolutionAnalysisResult {
  overallScore: number; // Overall score out of 100 (reflecting rubric anchors)
  aiConfidence: number; // 0–100, lower when evidence is sparse or ambiguous
  summary: string; // Concise summary (max 180–250 words)
  evaluatedParameters: IAnalysisParameter[]; // Cover each provided parameter (deduplicate by name if needed)
  feedback: {
    strengths: string[]; // 2–5 key strengths grounded in evidence
    areasForImprovement: string[]; // 2–5 improvement areas grounded in evidence
    suggestions: string[]; // 2–5 actionable, context-aware suggestions
  };
}
\`\`\`

## OUTPUT REQUIREMENTS ##
- Return a single valid JSON object only (no backticks, no extra text).
- Ensure numeric fields are numbers, not strings.
- Keep justifications concise and evidence-based.
`;

    // Call the AI model with minimal retry on transient 5xx errors
    let responseText: string | undefined;
    const MAX_ATTEMPTS = 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        console.log(`Sending prompt to Gemini 2.5 Flash... attempt ${attempt}/${MAX_ATTEMPTS}`);
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        console.log('Received response from Gemini 2.5 Flash');
        break;
      } catch (e) {
        const maybeError = e as { status?: number; message?: string };
        const isTransient = (maybeError?.status && maybeError.status >= 500) ||
          (typeof maybeError?.message === 'string' && /Internal Server Error|5\d\d/.test(maybeError.message));
        if (attempt < MAX_ATTEMPTS && isTransient) {
          const backoffMs = 300 * attempt;
          console.warn(`Gemini error (transient). Retrying in ${backoffMs}ms...`, maybeError);
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }
        throw e;
      }
    }

    if (!responseText) {
      throw new GeminiServiceError('Empty response from Gemini after retries.');
    }
    
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

// ---- Create analysis + update progress (Phase 2 wrapper) ----

export interface SolutionAnalysisCreatePayload {
  solutionContent?: string;
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

export interface CreateSolutionAnalysisAndProgressArgs {
  userId: string | Types.ObjectId;
  problemId: string | Types.ObjectId;
  payload: SolutionAnalysisCreatePayload;
  session?: ClientSession;
}

export interface CreateSolutionAnalysisAndProgressResult {
  analysis: ISolutionAnalysisResult;
  progress: MarkProblemSolvedResult;
}

export async function createSolutionAnalysisAndUpdateProgress(
  args: CreateSolutionAnalysisAndProgressArgs
): Promise<CreateSolutionAnalysisAndProgressResult> {
  const { userId, problemId, payload, session } = args;

  const useExternalSession = Boolean(session);
  const txnSession = session ?? (await mongoose.startSession());

  try {
    let analysisDoc: ISolutionAnalysisResult;
    let progress: MarkProblemSolvedResult;

    await txnSession.withTransaction(async () => {
      // Check if user already has an analysis for this problem (reattempt)
      const priorExists = await SolutionAnalysis.exists({ userId, problemId }).session(txnSession);

      // 1) Create SolutionAnalysis
      const [created] = await SolutionAnalysis.create(
        [
          {
            userId,
            problemId,
            solutionContent: payload.solutionContent ?? '',
            overallScore: payload.overallScore,
            aiConfidence: payload.aiConfidence,
            summary: payload.summary,
            evaluatedParameters: payload.evaluatedParameters,
            feedback: payload.feedback,
          },
        ],
        { session: txnSession }
      );
      analysisDoc = created;

      // 2) Update user progress idempotently only on first-ever analysis
      if (!priorExists) {
        progress = await markProblemSolved({ userId, problemId, session: txnSession });
      } else {
        // Preserve return shape even when skipping increment
        progress = { newlySolved: false, solvedCount: 0 } as MarkProblemSolvedResult;
      }
    });

    // TypeScript satisfaction: variables are set inside txn
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { analysis: analysisDoc!, progress: progress! };
  } finally {
    if (!useExternalSession) txnSession.endSession();
  }
}