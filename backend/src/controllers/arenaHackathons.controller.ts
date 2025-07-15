import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { WeeklyHackathon, HackathonSubmission } from '../models';

/**
 * @desc    Get current/active hackathon
 * @route   GET /api/arena/hackathons/current
 * @access  Public
 */
export const getCurrentHackathon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find active hackathon where current date is between startDate and endDate
    const now = new Date();
    const currentHackathon = await WeeklyHackathon.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    });

    if (!currentHackathon) {
      return res.status(200).json(
        new ApiResponse(
          200,
          'No active hackathon found',
          null
        )
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Current hackathon retrieved successfully',
        currentHackathon
      )
    );
  }
);

/**
 * @desc    Get hackathon leaderboard
 * @route   GET /api/arena/hackathons/:hackathonId/leaderboard
 * @access  Public
 */
export const getHackathonLeaderboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { hackathonId } = req.params;

    // Check if hackathon exists
    const hackathon = await WeeklyHackathon.findById(hackathonId);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    // Get leaderboard from hackathon
    const leaderboard = hackathon.leaderboard || [];

    // Sort by score (descending) and then by submission time (ascending)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.submissionTime).getTime() - new Date(b.submissionTime).getTime();
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'Leaderboard retrieved successfully',
        {
          hackathonId,
          leaderboard
        }
      )
    );
  }
);

/**
 * @desc    Submit hackathon solution
 * @route   POST /api/arena/hackathons/:hackathonId/submit
 * @access  Private
 */
export const submitHackathonSolution = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { hackathonId } = req.params;
    const { solution, codeFiles, demoUrl, explanation } = req.body;
    const userId = req.user._id;
    const username = req.user.fullName;

    // Validate input
    if (!solution || solution.trim() === '') {
      return next(new AppError('Solution is required', 400));
    }

    if (!explanation || explanation.trim() === '') {
      return next(new AppError('Explanation is required', 400));
    }

    // Check if hackathon exists and is active
    const hackathon = await WeeklyHackathon.findById(hackathonId);
    if (!hackathon) {
      return next(new AppError('Hackathon not found', 404));
    }

    const now = new Date();
    if (now < hackathon.startDate || now > hackathon.endDate || !hackathon.isActive) {
      return next(new AppError('Hackathon is not active or has ended', 400));
    }

    // Check if user has already submitted
    const existingSubmission = await HackathonSubmission.findOne({
      hackathonId,
      userId
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.solution = solution;
      existingSubmission.codeFiles = codeFiles || [];
      existingSubmission.demoUrl = demoUrl;
      existingSubmission.explanation = explanation;
      existingSubmission.submittedAt = now;
      
      await existingSubmission.save();

      res.status(200).json(
        new ApiResponse(
          200,
          'Submission updated successfully',
          existingSubmission
        )
      );
    } else {
      // Create new submission
      const submission = await HackathonSubmission.create({
        hackathonId,
        userId,
        username,
        solution,
        codeFiles: codeFiles || [],
        demoUrl,
        explanation,
        submittedAt: now,
        isWinner: false
      });

      res.status(201).json(
        new ApiResponse(
          201,
          'Solution submitted successfully',
          submission
        )
      );
    }
  }
);

/**
 * @desc    Get hackathon history
 * @route   GET /api/arena/hackathons/history
 * @access  Public
 */
export const getHackathonHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10 } = req.query;

    // Find completed hackathons (end date in the past)
    const now = new Date();
    const filter = { endDate: { $lt: now } };

    // Count total documents
    const total = await WeeklyHackathon.countDocuments(filter);
    
    // Fetch hackathons with pagination
    const hackathons = await WeeklyHackathon.find(filter)
      .sort({ endDate: -1 }) // Most recent first
      .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10))
      .limit(parseInt(limit as string, 10))
      .select('title description startDate endDate winners');

    res.status(200).json(
      new ApiResponse(
        200,
        'Hackathon history retrieved successfully',
        {
          hackathons,
          pagination: {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            total,
            pages: Math.ceil(total / parseInt(limit as string, 10))
          }
        }
      )
    );
  }
); 