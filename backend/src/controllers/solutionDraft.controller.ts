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

    // Try to find existing draft
    let draft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    // If no draft exists, create a new one
    if (!draft) {
      draft = await SolutionDraft.create({
        userId,
        problemId,
        currentContent: '',
        versions: [{ content: '', timestamp: new Date(), description: 'Initial draft' }],
        lastEdited: new Date()
      });

      // Add to user's active drafts
      await User.findByIdAndUpdate(userId, {
        $addToSet: { activeDrafts: draft._id }
      });
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
    const { content, saveAsVersion, versionDescription } = req.body;

    // Find the draft
    let draft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }

    // Update content
    draft.currentContent = content;
    draft.lastEdited = new Date();

    // Save as a new version if requested
    if (saveAsVersion) {
      draft.versions.push({
        content,
        timestamp: new Date(),
        description: versionDescription || `Version ${draft.versions.length + 1}`
      });
    }

    await draft.save();

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
 * @desc    Get all versions of a draft
 * @route   GET /api/crucible/:problemId/draft/versions
 * @access  Private
 */
export const getDraftVersions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Find the draft
    const draft = await SolutionDraft.findOne({
      userId,
      problemId
    });

    if (!draft) {
      return next(new AppError('Draft not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Draft versions fetched successfully',
        draft.versions
      )
    );
  }
); 