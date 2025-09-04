import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import env from '../config/env';
import { ICrucibleProblem } from '../models/crucibleProblem.model';
import SolutionAnalysis, { IAnalysisParameter, ISolutionAnalysisResult } from '../models/solutionAnalysis.model';
import mongoose, { ClientSession, Types } from 'mongoose';
import { markProblemSolved, MarkProblemSolvedResult } from './userProgress.service';
import { updateUserScoring, UpdateUserScoringResult } from './userScoring.service';
import { SolutionAnalysisProviderFactory } from './solutionAnalysis/providers/ProviderFactory';
import { 
  isProviderError, 
  ModelOverloadError, 
  ResponseParsingError, 
  AIServiceError 
} from './solutionAnalysis/providers/ProviderErrors';

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
// NOTE: These are maintained for backward compatibility and will be deprecated
// Use the new provider error system from ProviderErrors.ts instead
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



/**
 * Generates a comprehensive analysis of a user's solution using the configured provider
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
    // Get the configured provider
    const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
    
    console.log(`[SolutionAnalysis] Using provider: ${provider.getProviderName()}`);
    
    // Perform analysis using the provider
    const result = await provider.analyzeComprehensively(
      problemDetails,
      userSolution,
      ragDocuments,
      technicalParameters
    );
    
    console.log(`[SolutionAnalysis] Analysis completed successfully with ${provider.getProviderName()}`);
    return result;
    
  } catch (error) {
    console.error('[SolutionAnalysis] Analysis failed:', error);
    
    // Map new provider errors to legacy error types for backward compatibility
    if (isProviderError(error)) {
      switch (error.errorCode) {
        case 'MODEL_OVERLOADED':
          throw new GeminiModelOverloadError(error.message);
        case 'RESPONSE_PARSING_ERROR':
          throw new GeminiParsingError(error.message);
        case 'AI_SERVICE_ERROR':
        case 'AUTHENTICATION_ERROR':
        case 'TIMEOUT_ERROR':
        case 'CONFIGURATION_ERROR':
        case 'HEALTH_CHECK_ERROR':
          throw new GeminiServiceError(error.message);
        default:
          throw new GeminiServiceError(`Provider error: ${error.message}`);
      }
    }
    
    // For non-provider errors, wrap in generic service error
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
  scoring: UpdateUserScoringResult;
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
    let scoring: UpdateUserScoringResult;

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
      analysisDoc = created as ISolutionAnalysisResult;

      // 2) Update user progress idempotently only on first-ever analysis
      if (!priorExists) {
        progress = await markProblemSolved({ userId, problemId, session: txnSession });
      } else {
        // Preserve return shape even when skipping increment
        progress = { newlySolved: false, solvedCount: 0 } as MarkProblemSolvedResult;
      }

      // 3) Update user scoring and skill tracking (always update for new analysis)
      // Get problem details for scoring calculation
      const { CrucibleProblem } = require('../models/index');
      const problem = await CrucibleProblem.findById(problemId).session(txnSession);
      
      if (problem) {
        scoring = await updateUserScoring({
          userId,
          problemId,
          analysisId: analysisDoc._id as mongoose.Types.ObjectId,
          score: payload.overallScore,
          problem,
          session: txnSession
        });
      } else {
        // Fallback if problem not found
        scoring = {
          points: 0,
          totalPoints: 0,
          averageScore: 0,
          highestScore: 0,
          skillsUpdated: [],
          techStackUpdated: [],
          learningProgressUpdated: []
        };
      }
    });

    // TypeScript satisfaction: variables are set inside txn
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { analysis: analysisDoc!, progress: progress!, scoring: scoring! };
  } finally {
    if (!useExternalSession) txnSession.endSession();
  }
}