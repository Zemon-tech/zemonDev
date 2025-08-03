import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { SolutionDraft, User } from '../models/index';

/**
 * @desc    Get or create a solution draft
 * @route   GET /api/crucible/:problemId/draft
 * @access  Private
 */
export const getDraft = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Find existing active draft only (no upsert - let reattempt handle new draft creation)
    const draft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (!draft) {
      return next(new AppError('No active draft found for this problem', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Draft fetched successfully',
        draft
      )
    );
  }
);

/**
 * @desc    Update a solution draft
 * @route   PUT /api/crucible/:problemId/draft
 * @access  Private
 */
export const updateDraft = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { currentContent } = req.body; // REMOVED: saveAsVersion, versionDescription

    // Validate required fields
    if (!currentContent && currentContent !== '') {
      return next(new AppError('Content is required', 400));
    }

    // Use findOneAndUpdate with upsert to handle the unique constraint properly
    // This will either find an existing active draft or create a new one if none exists
    let draft = await SolutionDraft.findOneAndUpdate(
      { userId, problemId, status: 'active' },
      {
        $set: {
          currentContent,
          lastEdited: new Date()
        },
        $setOnInsert: {
          status: 'active'
        }
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true // Set default values on insert
      }
    );

    // REMOVED: Version saving logic - no longer needed

    // Ensure the draft is in user's activeDrafts
    await User.findByIdAndUpdate(userId, {
      $addToSet: { activeDrafts: draft._id }
    });

    console.log(`Updated draft for user ${userId} and problem ${problemId}`);

    res.status(200).json(
      new ApiResponse(
        200,
        'Draft updated successfully',
        draft
      )
    );
  }
);

/**
 * @desc    Archive a solution draft (when solution is submitted)
 * @route   PUT /api/crucible/:problemId/draft/archive
 * @access  Private
 */
export const archiveDraft = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Find the draft
    const draft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }

    // Update status to archived
    draft.status = 'archived';
    await draft.save();

    // Update user's draft references
    await User.findByIdAndUpdate(userId, {
      $pull: { activeDrafts: draft._id },
      $addToSet: { archivedDrafts: draft._id }
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'Draft archived successfully',
        draft
      )
    );
  }
);

/**
 * @desc    Create a new draft for reattempting a problem
 * @route   POST /api/crucible/:problemId/draft/reattempt
 * @access  Private
 */
export const reattemptDraft = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    
    // First, archive any existing active draft
    const existingDraft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (existingDraft) {
      // Archive the existing draft
      existingDraft.status = 'archived';
      await existingDraft.save();

      // Update user's draft references
      await User.findByIdAndUpdate(userId, {
        $pull: { activeDrafts: existingDraft._id },
        $addToSet: { archivedDrafts: existingDraft._id }
      });

      console.log(`Archived existing draft ${existingDraft._id} for reattempt`);
    }
    
    // Get the last submitted solution to pre-populate the new draft
    const { SolutionAnalysis } = require('../models/index');
    const lastAnalysis = await SolutionAnalysis.findOne({ userId, problemId })
      .sort({ createdAt: -1 });
    
    let initialContent = ' ';
    
    if (lastAnalysis && lastAnalysis.solutionContent && lastAnalysis.solutionContent.trim() !== '') {
      initialContent = lastAnalysis.solutionContent;
      console.log(`Using last submitted solution for reattempt (Score: ${lastAnalysis.overallScore})`);
    }
    
    // Create a new draft with the last submitted solution content
    const newDraft = await SolutionDraft.create({
      userId,
      problemId,
      currentContent: initialContent,
      lastEdited: new Date(),
      status: 'active',
      autoSaveEnabled: true
    });

    // Ensure the new draft is in user's activeDrafts
    await User.findByIdAndUpdate(userId, {
      $addToSet: { activeDrafts: newDraft._id }
    });

    console.log(`Created new draft ${newDraft._id} for reattempt with previous solution content`);

    res.status(201).json(
      new ApiResponse(201, 'New draft created for reattempt with previous solution', newDraft)
    );
  }
);

// REMOVED: getDraftVersions function - no longer needed 