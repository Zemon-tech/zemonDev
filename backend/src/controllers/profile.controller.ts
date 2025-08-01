import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import { SolutionAnalysis, SolutionDraft } from '../models/index';
import logger from '../utils/logger';

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