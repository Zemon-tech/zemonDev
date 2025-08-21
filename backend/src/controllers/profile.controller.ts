import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import { SolutionAnalysis, SolutionDraft } from '../models/index';
import logger from '../utils/logger';
import User from '../models/user.model';

/**
 * @desc    Get user's recent analysis history across all problems
 * @route   GET /api/profile/crucible/analyses
 * @access  Private
 */
export const getUserAnalysisHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    
    try {
      const analyses = await SolutionAnalysis.find({ userId })
        .populate('problemId', 'title')
        .sort({ createdAt: -1 })
        .limit(2);
      
      logger.info(`Retrieved ${analyses.length} analyses for user ${userId}`);
      
      res.status(200).json(
        new ApiResponse(200, 'User analysis history retrieved successfully', analyses)
      );
    } catch (error) {
      logger.error('Error in getUserAnalysisHistory:', error);
      throw error;
    }
  }
);

/**
 * @desc    Get user's recent active drafts across all problems
 * @route   GET /api/profile/crucible/drafts
 * @access  Private
 */
export const getUserActiveDrafts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    
    try {
      const drafts = await SolutionDraft.find({ userId, status: 'active' })
        .populate('problemId', 'title')
        .sort({ lastEdited: -1 })
        .limit(2);
      
      logger.info(`Retrieved ${drafts.length} active drafts for user ${userId}`);
      
      res.status(200).json(
        new ApiResponse(200, 'User active drafts retrieved successfully', drafts)
      );
    } catch (error) {
      logger.error('Error in getUserActiveDrafts:', error);
      throw error;
    }
  }
); 

/**
 * @desc    Public: Get a user's recent analysis history by username (for public profile)
 * @route   GET /api/profile/public/:username/crucible/analyses
 * @access  Public (requires target profile to be public)
 */
export const getPublicUserAnalysisHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params as { username: string };
    try {
      const user = await User.findOne({ username })
        .select('_id profileVisibility')
        .lean();
      if (!user) {
        return res.status(404).json(new ApiResponse(404, 'User not found', null));
      }
      if (!(user as any).profileVisibility?.isPublic) {
        return res.status(403).json(new ApiResponse(403, 'Profile is private', null));
      }

      const analyses = await SolutionAnalysis.find({ userId: (user as any)._id })
        .populate('problemId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      res.status(200).json(new ApiResponse(200, 'Public analysis history retrieved successfully', analyses));
    } catch (error) {
      logger.error('Error in getPublicUserAnalysisHistory:', error);
      throw error;
    }
  }
);

/**
 * @desc    Public: Get a user's recent active drafts by username (for public profile)
 * @route   GET /api/profile/public/:username/crucible/drafts
 * @access  Public (requires target profile to be public)
 */
export const getPublicUserActiveDrafts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params as { username: string };
    try {
      const user = await User.findOne({ username })
        .select('_id profileVisibility')
        .lean();
      if (!user) {
        return res.status(404).json(new ApiResponse(404, 'User not found', null));
      }
      if (!(user as any).profileVisibility?.isPublic) {
        return res.status(403).json(new ApiResponse(403, 'Profile is private', null));
      }

      const drafts = await SolutionDraft.find({ userId: (user as any)._id, status: 'active' })
        .populate('problemId', 'title')
        .sort({ lastEdited: -1 })
        .limit(5)
        .lean();

      res.status(200).json(new ApiResponse(200, 'Public active drafts retrieved successfully', drafts));
    } catch (error) {
      logger.error('Error in getPublicUserActiveDrafts:', error);
      throw error;
    }
  }
);