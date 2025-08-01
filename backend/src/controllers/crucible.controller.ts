import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { CrucibleProblem, CrucibleSolution, User, SolutionDraft, CrucibleNote, AIChatHistory, CrucibleDiagram, ResearchItem, SolutionAnalysis } from '../models/index';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { redisClient } from '../config/redis';
import { generateComprehensiveAnalysis, GeminiModelOverloadError, GeminiParsingError, GeminiServiceError } from '../services/solutionAnalysis.service';
import { retrieveRelevantDocuments } from '../services/rag.service';

// Cache TTL in seconds
const PROBLEM_CACHE_TTL = 60 * 60; // 1 hour
const PROBLEM_LIST_CACHE_TTL = 5 * 60; // 5 minutes
const NOTES_CACHE_TTL = 30 * 60; // 30 minutes
const DRAFT_CACHE_TTL = 30 * 60; // 30 minutes

/**
 * Helper function to generate cache keys
 */
const getCacheKeys = {
  problemList: (query: any) => `problems:${JSON.stringify(query)}`,
  problem: (id: string) => `problem:${id}`,
  notes: (userId: string, problemId: string) => `notes:${userId}:${problemId}`,
  draft: (userId: string, problemId: string) => `draft:${userId}:${problemId}`
};

/**
 * @desc    Get all challenges
 * @route   GET /api/crucible
 * @access  Public
 */
export const getAllChallenges = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { difficulty, tags, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter: any = {};
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: (tags as string).split(',') };

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    try {
      // Use MongoDB aggregation for better performance
      const aggregationPipeline = [
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: (options.page - 1) * options.limit },
        { $limit: options.limit },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator',
            pipeline: [{ $project: { fullName: 1 } }]
          }
        },
        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
        { $project: { __v: 0 } }
      ] as mongoose.PipelineStage[];

      // Execute aggregation in parallel with count
      const [challenges, countResult] = await Promise.all([
        CrucibleProblem.aggregate(aggregationPipeline),
        CrucibleProblem.aggregate([
          { $match: filter },
          { $count: 'total' }
        ] as mongoose.PipelineStage[])
      ]);

      const total = countResult.length > 0 ? countResult[0].total : 0;

      res.status(200).json(
        new ApiResponse(
          200,
          'Challenges fetched successfully',
          {
            challenges,
            pagination: {
              page: options.page,
              limit: options.limit,
              total,
              pages: Math.ceil(total / options.limit)
            }
          }
        )
      );
    } catch (error) {
      logger.error('Error in getAllChallenges:', error);
      return next(new AppError('Failed to fetch challenges', 500));
    }
  }
);

/**
 * @desc    Get a single challenge by ID
 * @route   GET /api/crucible/:id
 * @access  Public
 */
export const getChallengeById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid resource identifier. Malformed _id: ' + id, 400));
    }

    const challenge = await CrucibleProblem.findById(id)
      .select('-__v')
      .populate('createdBy', 'fullName');

    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }

    // Increment attempts counter
    challenge.metrics.attempts += 1;
    await challenge.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Challenge fetched successfully',
        challenge
      )
    );
  }
);


/**
 * @desc    Submit a solution for a challenge
 * @route   POST /api/crucible/:challengeId/solutions
 * @access  Private
 */
export const submitSolution = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { challengeId } = req.params;
    const { content } = req.body;

    // Validate the challenge exists
    const challenge = await CrucibleProblem.findById(challengeId);
    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }

    // Check if user already has a solution for this challenge
    const existingSolution = await CrucibleSolution.findOne({
      problemId: challengeId,
      userId: req.user._id
    });

    let solution;
    if (existingSolution) {
      // Update existing solution
      existingSolution.content = content;
      existingSolution.status = 'submitted';
      solution = await existingSolution.save();
    } else {
      // Create new solution
      solution = await CrucibleSolution.create({
        problemId: challengeId,
        userId: req.user._id,
        content,
        status: 'submitted',
        aiAnalysis: {
          score: 0,
          feedback: '',
          suggestions: []
        },
        metrics: {
          upvotes: 0,
          downvotes: 0,
          views: 0
        }
      });

      // Increment solutions counter on the challenge
      challenge.metrics.solutions += 1;
      await challenge.save();

      // Update user's stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.problemsSolved': 1 },
        $addToSet: { completedSolutions: solution._id }
      });
    }

    // Archive the draft if it exists
    const draft = await SolutionDraft.findOne({
      userId: req.user._id,
      problemId: challengeId,
      status: 'active'
    });

    if (draft) {
      // Update status to archived
      draft.status = 'archived';
      await draft.save();

      // Update user's draft references
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { activeDrafts: draft._id },
        $addToSet: { archivedDrafts: draft._id }
      });
    }

    // Archive related notes, chats, etc.
    await Promise.all([
      CrucibleNote.updateMany(
        { userId: req.user._id, problemId: challengeId, status: 'active' },
        { status: 'archived' }
      ),
      AIChatHistory.updateMany(
        { userId: req.user._id, problemId: challengeId, status: 'active' },
        { status: 'archived' }
      ),
      CrucibleDiagram.updateMany(
        { userId: req.user._id, problemId: challengeId, status: 'active' },
        { status: 'archived' }
      ),
      ResearchItem.updateMany(
        { userId: req.user._id, problemId: challengeId, status: 'active' },
        { status: 'archived' }
      )
    ]);

    res.status(201).json(
      new ApiResponse(
        201,
        'Solution submitted successfully',
        solution
      )
    );
  }
);

/**
 * @desc    Get all solutions for a challenge
 * @route   GET /api/crucible/:challengeId/solutions
 * @access  Public
 */
export const getSolutions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { challengeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate the challenge exists
    const challenge = await CrucibleProblem.findById(challengeId);
    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    };

    // Count total documents
    const total = await CrucibleSolution.countDocuments({ problemId: challengeId });
    
    // Execute query
    const solutions = await CrucibleSolution.find({ problemId: challengeId })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: 'desc' })
      .populate('userId', 'fullName')
      .select('-__v');

    res.status(200).json(
      new ApiResponse(
        200,
        'Solutions fetched successfully',
        {
          solutions,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            pages: Math.ceil(total / options.limit)
          }
        }
      )
    );
  }
);

/**
 * Get all problems with pagination and optional filtering
 */
export const getProblems = asyncHandler(async (req: Request, res: Response) => {
  const { difficulty, tags, search } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  // Create cache key based on query parameters
  const queryParams = { difficulty, tags, search, page, limit };
  const cacheKey = getCacheKeys.problemList(queryParams);
  
  // Try to get from cache first
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    try {
      const parsedData = JSON.parse(cachedData);
      logger.info(`Cache hit for problems list with query: ${JSON.stringify(queryParams)}`);
      return res.status(200).json(new ApiResponse(200, 'Problems retrieved from cache', parsedData));
    } catch (error) {
      logger.error('Error parsing cached data:', error);
      // Continue with database query if parsing fails
    }
  }
  
  // Build query based on filters
  const query: any = {};
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : [tags];
    query.tags = { $in: tagList };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  // Get total count for pagination
  const total = await CrucibleProblem.countDocuments(query);
  
  // Get problems with pagination
  const problems = await CrucibleProblem.find(query)
    .select('_id title difficulty tags createdAt updatedAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const result = {
    problems,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
  
  // Cache the result
  await redisClient.set(cacheKey, JSON.stringify(result), { ex: PROBLEM_LIST_CACHE_TTL });
  
  res.status(200).json(new ApiResponse(200, 'Problems retrieved successfully', result));
});

/**
 * Get a single problem by ID
 */
export const getProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid problem ID format', 400);
  }
  
  // Create cache key
  const cacheKey = getCacheKeys.problem(id);
  
  // Try to get from cache first
  const cachedProblem = await redisClient.get(cacheKey);
  if (cachedProblem) {
    try {
      const problem = JSON.parse(cachedProblem);
      logger.info(`Cache hit for problem: ${id}`);
      return res.status(200).json(new ApiResponse(200, 'Problem retrieved from cache', problem));
    } catch (error) {
      logger.error('Error parsing cached problem:', error);
      // Continue with database query if parsing fails
    }
  }
  
  // Get from database if not in cache
  const problem = await CrucibleProblem.findById(id);
  
  if (!problem) {
    throw new AppError('Problem not found', 404);
  }
  
  // Cache the problem
  await redisClient.set(cacheKey, JSON.stringify(problem.toJSON()), { ex: PROBLEM_CACHE_TTL });
  
  res.status(200).json(new ApiResponse(200, 'Problem retrieved successfully', problem));
});

/**
 * Get a user's notes for a problem
 */
export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('Unauthenticated', 401);
  }
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new AppError('Invalid problem ID format', 400);
  }
  
  // Create cache key
  const cacheKey = getCacheKeys.notes(userId, problemId);
  
  // Try to get from cache first
  const cachedNotes = await redisClient.get(cacheKey);
  if (cachedNotes) {
    try {
      const notes = JSON.parse(cachedNotes);
      logger.info(`Cache hit for notes: user ${userId}, problem ${problemId}`);
      return res.status(200).json(new ApiResponse(200, 'Notes retrieved from cache', notes));
    } catch (error) {
      logger.error('Error parsing cached notes:', error);
      // Continue with database query if parsing fails
    }
  }
  
  // Find existing notes or create empty notes
  let notes = await CrucibleNote.findOne({ userId, problemId });
  
  const notesData = notes ? notes.toJSON() : {
    content: '',
    tags: [],
    problemId
  };
  
  // Cache the notes
  await redisClient.set(cacheKey, JSON.stringify(notesData), { ex: NOTES_CACHE_TTL });
  
  res.status(200).json(new ApiResponse(200, 'Notes retrieved successfully', notesData));
});

/**
 * Update a user's notes for a problem
 */
export const updateNotes = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = req.user?.id;
  const { content, tags } = req.body;
  
  if (!userId) {
    throw new AppError('Unauthenticated', 401);
  }
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new AppError('Invalid problem ID format', 400);
  }
  
  // Update or create notes
  const notes = await CrucibleNote.findOneAndUpdate(
    { userId, problemId },
    { content, tags },
    { new: true, upsert: true }
  );
  
  // Update cache
  const cacheKey = getCacheKeys.notes(userId, problemId);
  await redisClient.set(cacheKey, JSON.stringify(notes.toJSON()), { ex: NOTES_CACHE_TTL });
  
  res.status(200).json(new ApiResponse(200, 'Notes updated successfully', notes));
});

/**
 * Get a user's solution draft for a problem
 */
export const getDraft = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('Unauthenticated', 401);
  }
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new AppError('Invalid problem ID format', 400);
  }
  
  // Create cache key
  const cacheKey = getCacheKeys.draft(userId, problemId);
  
  // Try to get from cache first
  const cachedDraft = await redisClient.get(cacheKey);
  if (cachedDraft) {
    try {
      const draft = JSON.parse(cachedDraft);
      logger.info(`Cache hit for draft: user ${userId}, problem ${problemId}`);
      return res.status(200).json(new ApiResponse(200, 'Draft retrieved from cache', draft));
    } catch (error) {
      logger.error('Error parsing cached draft:', error);
      // Continue with database query if parsing fails
    }
  }
  
  // Find existing draft or create empty draft
  let draft = await SolutionDraft.findOne({ userId, problemId });
  
  const draftData = draft ? draft.toJSON() : {
    currentContent: '',
    versions: []
  };
  
  // Cache the draft
  await redisClient.set(cacheKey, JSON.stringify(draftData), { ex: DRAFT_CACHE_TTL });
  
  res.status(200).json(new ApiResponse(200, 'Draft retrieved successfully', draftData));
});

/**
 * Update a user's solution draft for a problem
 */
export const updateDraft = asyncHandler(async (req: Request, res: Response) => {
  const { problemId } = req.params;
  const userId = req.user?.id;
  const { currentContent, saveAsVersion, versionDescription } = req.body;
  
  if (!userId) {
    throw new AppError('Unauthenticated', 401);
  }
  
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new AppError('Invalid problem ID format', 400);
  }
  
  // Find existing draft or create new one
  let draft = await SolutionDraft.findOne({ userId, problemId });
  
  if (!draft) {
    draft = new SolutionDraft({
      userId,
      problemId,
      currentContent,
      versions: []
    });
  } else {
    draft.currentContent = currentContent;
  }
  
  // Save as version if requested
  if (saveAsVersion && versionDescription) {
    if (!draft.versions) {
      draft.versions = [];
    }
    
    draft.versions.push({
      content: currentContent,
      timestamp: new Date(),
      description: versionDescription
    });
  }
  
  await draft.save();
  
  // Update cache
  const cacheKey = getCacheKeys.draft(userId, problemId);
  await redisClient.set(cacheKey, JSON.stringify(draft.toJSON()), { ex: DRAFT_CACHE_TTL });
  
  res.status(200).json(new ApiResponse(200, 'Draft updated successfully', draft));
}); 

/**
 * @desc    Analyze a user's solution for a problem
 * @route   POST /api/crucible/:problemId/analyze
 * @access  Private
 */
export const analyzeUserSolution = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Validate the problem exists
    const problem = await CrucibleProblem.findById(problemId);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Get the user's solution draft
    const solutionDraft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (!solutionDraft || !solutionDraft.currentContent) {
      return next(new AppError('No solution draft found for this problem', 404));
    }

    // Extract the user's solution content
    const userSolution = solutionDraft.currentContent;

    // Validate that the solution is not empty
    if (!userSolution || userSolution.trim().length < 10) {
      return res.status(400).json(
        new ApiResponse(
          400,
          'Solution too short',
          {
            error: 'solution_too_short',
            message: 'Please provide a more detailed solution before submitting for analysis. Your solution should be at least 10 characters long.'
          }
        )
      );
    }

    // Archive the current active draft before analysis
    try {
      // Update status to archived
      solutionDraft.status = 'archived';
      await solutionDraft.save();

      // Update user's draft references (move from activeDrafts to archivedDrafts)
      await User.findByIdAndUpdate(userId, {
        $pull: { activeDrafts: solutionDraft._id },
        $addToSet: { archivedDrafts: solutionDraft._id }
      });

      console.log(`Archived draft ${solutionDraft._id} for user ${userId} and problem ${problemId}`);
    } catch (archiveError) {
      console.error('Error archiving draft:', archiveError);
      // Continue with analysis even if archiving fails
    }

    // Get technical parameters for this problem (or use empty array if not defined)
    const technicalParameters = problem.technicalParameters || [];

    // Construct a query for the RAG service
    const queryText = `${problem.title} ${problem.description} ${userSolution.substring(0, 500)}`;
    
    try {
      // Retrieve relevant documents from the RAG system
      let ragDocuments: string[] = [];
      
      try {
        ragDocuments = await retrieveRelevantDocuments(queryText);
        console.log(`Successfully retrieved ${ragDocuments.length} documents from RAG system`);
      } catch (ragError) {
        console.error('Error retrieving documents from RAG system:', ragError);
        // Continue with empty documents rather than failing the whole request
        ragDocuments = [];
      }

      // Generate the comprehensive analysis
      let analysisResult;
      try {
        analysisResult = await generateComprehensiveAnalysis(
          problem,
          userSolution,
          ragDocuments,
          technicalParameters
        );
        console.log('Analysis generated successfully');
      } catch (analysisError) {
        console.error('Error generating analysis:', analysisError);
        
        // Handle specific Gemini errors with appropriate HTTP status codes
        if (analysisError instanceof GeminiModelOverloadError) {
          return res.status(503).json(
            new ApiResponse(
              503,
              'AI Model Overloaded',
              {
                error: 'model_overloaded',
                message: analysisError.message,
                retryAfter: 60 // Suggest retry after 60 seconds
              }
            )
          );
        }
        
        if (analysisError instanceof GeminiParsingError) {
          return res.status(422).json(
            new ApiResponse(
              422,
              'Analysis Processing Error',
              {
                error: 'parsing_error',
                message: analysisError.message
              }
            )
          );
        }
        
        if (analysisError instanceof GeminiServiceError) {
          return res.status(500).json(
            new ApiResponse(
              500,
              'AI Service Error',
              {
                error: 'service_error',
                message: analysisError.message
              }
            )
          );
        }
        
        // For any other unexpected errors
        return res.status(500).json(
          new ApiResponse(
            500,
            'Analysis Failed',
            {
              error: 'unknown_error',
              message: 'An unexpected error occurred during analysis.'
            }
          )
        );
      }

      // Only save to database if we have a valid analysis result
      if (!analysisResult || typeof analysisResult.overallScore !== 'number') {
        console.error('Invalid analysis result - missing or invalid overallScore:', analysisResult);
        return res.status(500).json(
          new ApiResponse(
            500,
            'Invalid Analysis Result',
            {
              error: 'invalid_result',
              message: 'The analysis result is invalid or incomplete.'
            }
          )
        );
      }

      // Create a new SolutionAnalysis document
      try {
        const solutionAnalysis = await SolutionAnalysis.create({
          userId: new mongoose.Types.ObjectId(userId),
          problemId: new mongoose.Types.ObjectId(problemId),
          solutionContent: userSolution, // Save the solution content that was analyzed
          overallScore: analysisResult.overallScore,
          aiConfidence: analysisResult.aiConfidence,
          summary: analysisResult.summary,
          evaluatedParameters: analysisResult.evaluatedParameters,
          feedback: {
            strengths: analysisResult.feedback.strengths,
            areasForImprovement: analysisResult.feedback.areasForImprovement,
            suggestions: analysisResult.feedback.suggestions
          }
        });

        console.log(`Created solution analysis with ID: ${solutionAnalysis._id}`);

        res.status(201).json(
          new ApiResponse(
            201,
            'Solution analysis completed successfully',
            { analysisId: solutionAnalysis._id }
          )
        );
      } catch (dbError) {
        console.error('Error saving analysis to database:', dbError);
        return next(new AppError('Failed to save analysis results', 500));
      }
    } catch (error) {
      logger.error('Error in analyzeUserSolution:', error);
      return next(new AppError('Failed to analyze solution', 500));
    }
  }
);

/**
 * @desc    Get a specific analysis result
 * @route   GET /api/crucible/results/:analysisId
 * @access  Private
 */
export const getAnalysisResult = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { analysisId } = req.params;
    const userId = req.user._id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(analysisId)) {
      return next(new AppError('Invalid analysis ID format', 400));
    }

    // Find the analysis document
    const analysis = await SolutionAnalysis.findById(analysisId);

    if (!analysis) {
      return next(new AppError('Analysis result not found', 404));
    }

    // Check if the analysis belongs to the requesting user
    if (analysis.userId.toString() !== userId.toString()) {
      return next(new AppError('You are not authorized to view this analysis', 403));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Analysis result retrieved successfully',
        analysis
      )
    );
  }
); 

/**
 * @desc    Get the latest analysis for the current user/problem
 * @route   GET /api/crucible/:problemId/solutions/latest
 * @access  Private
 */
export const getLatestAnalysisForUserProblem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const latest = await SolutionAnalysis.findOne({ userId, problemId })
      .sort({ createdAt: -1 });
    if (!latest) {
      return next(new AppError('No analysis found for this problem', 404));
    }
    res.status(200).json(
      new ApiResponse(200, 'Latest analysis retrieved successfully', latest)
    );
  }
);

/**
 * @desc    Get all past analyses for the current user/problem
 * @route   GET /api/crucible/:problemId/solutions/history
 * @access  Private
 */
export const getAnalysisHistoryForUserProblem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const history = await SolutionAnalysis.find({ userId, problemId })
      .sort({ createdAt: -1 });
    res.status(200).json(
      new ApiResponse(200, 'Analysis history retrieved successfully', history)
    );
  }
);

/**
 * @desc    Get the last submitted solution for reattempting
 * @route   GET /api/crucible/:problemId/solutions/last-submitted
 * @access  Private
 */
export const getLastSubmittedSolution = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    
    // Get the most recent analysis which contains the last submitted solution
    const lastAnalysis = await SolutionAnalysis.findOne({ userId, problemId })
      .sort({ createdAt: -1 });
    
    if (!lastAnalysis) {
      return next(new AppError('No previous solution found for this problem', 404));
    }
    
    // Handle cases where solutionContent might not exist (for older analyses)
    const solutionContent = lastAnalysis.solutionContent || '';
    
    res.status(200).json(
      new ApiResponse(200, 'Last submitted solution retrieved successfully', {
        solutionContent: solutionContent,
        analysisId: lastAnalysis._id,
        score: lastAnalysis.overallScore,
        submittedAt: lastAnalysis.createdAt
      })
    );
  }
); 