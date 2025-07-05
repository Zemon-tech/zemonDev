import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { CrucibleProblem, CrucibleSolution, User, SolutionDraft, CrucibleNote, AIChatHistory, CrucibleDiagram, ResearchItem } from '../models/index';
import mongoose from 'mongoose';

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
      select: '-__v',
      populate: { path: 'createdBy', select: 'fullName' }
    };

    // Count total documents
    const total = await CrucibleProblem.countDocuments(filter);
    
    // Execute query
    const challenges = await CrucibleProblem.find(filter)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: 'desc' })
      .select(options.select)
      .populate(options.populate);

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
  }
);

/**
 * @desc    Get a single challenge by ID
 * @route   GET /api/crucible/:id
 * @access  Public
 */
export const getChallengeById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const challenge = await CrucibleProblem.findById(req.params.id)
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