import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { analyzeSolution, generateHints, generateChatResponse } from '../services/ai.service';
import { CrucibleProblem } from '../models';

/**
 * @desc    Submit a solution for AI analysis
 * @route   POST /api/ai/analyze-solution
 * @access  Private
 */
export const analyzeUserSolution = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content, problemId } = req.body;

    // Validate request
    if (!content || !problemId) {
      return next(new AppError('Both content and problemId are required', 400));
    }

    // Fetch the problem details
    const problem = await CrucibleProblem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Call the AI service
    const analysis = await analyzeSolution(content, problem);

    res.status(200).json(
      new ApiResponse(
        200,
        'Solution analyzed successfully',
        analysis
      )
    );
  }
);

/**
 * @desc    Generate hints for a problem
 * @route   POST /api/ai/generate-hints
 * @access  Private
 */
export const generateProblemHints = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.body;

    if (!problemId) {
      return next(new AppError('A problemId is required', 400));
    }

    const problem = await CrucibleProblem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    const hints = await generateHints(problem);

    res.status(200).json(
      new ApiResponse(
        200,
        'Hints generated successfully',
        hints
      )
    );
  }
);

/**
 * @desc    Ask a question to the AI assistant with context from the problem and solution draft
 * @route   POST /api/ai/ask
 * @access  Private
 */
export const askAI = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userMessage, problemId, solutionDraftContent, messages } = req.body;

    if (!userMessage || !problemId) {
      return next(new AppError('Both userMessage and problemId are required', 400));
    }
    
    // Fetch the problem details
    const problem = await CrucibleProblem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Prepare chat messages
    const chatMessages = messages || [];
    // Add the current user message
    chatMessages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Call AI service with problem context and solution draft content
    const aiResponse = await generateChatResponse(
      chatMessages,
      problem,
      solutionDraftContent
    );

    res.status(200).json(
      new ApiResponse(
        200,
        'AI response generated successfully',
        aiResponse
      )
    );
  }
); 