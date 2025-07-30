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
        currentContent: ' ',
        versions: [{ content: ' ', timestamp: new Date(), description: 'Initial draft' }],
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
    const { currentContent, saveAsVersion, versionDescription } = req.body;

    // Validate required fields
    if (!currentContent && currentContent !== '') {
      return next(new AppError('Content is required', 400));
    }

    // Find the draft
    let draft = await SolutionDraft.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (!draft) {
      // If no draft exists, create a new one
      draft = await SolutionDraft.create({
        userId,
        problemId,
        currentContent,
        versions: [{ 
          content: currentContent || ' ', // Ensure there's always content, even if empty
          timestamp: new Date(), 
          description: 'Initial draft' 
        }],
        lastEdited: new Date(),
        status: 'active'
      });

      // Add to user's active drafts
      await User.findByIdAndUpdate(userId, {
        $addToSet: { activeDrafts: draft._id }
      });

      console.log(`Created new draft for user ${userId} and problem ${problemId}`);
    } else {
      // Update content
      draft.currentContent = currentContent;
      draft.lastEdited = new Date();

      // Save as a new version if requested
      if (saveAsVersion) {
        draft.versions.push({
          content: currentContent,
          timestamp: new Date(),
          description: versionDescription || `Version ${draft.versions.length + 1}`
        });
      }

      await draft.save();
      console.log(`Updated draft for user ${userId} and problem ${problemId}`);
    }

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
    // Archive any active draft for this problem/user
    const activeDraft = await SolutionDraft.findOne({ userId, problemId, status: 'active' });
    if (activeDraft) {
      activeDraft.status = 'archived';
      await activeDraft.save();
      await User.findByIdAndUpdate(userId, {
        $pull: { activeDrafts: activeDraft._id },
        $addToSet: { archivedDrafts: activeDraft._id }
      });
    }
    // Create new draft
    const newDraft = await SolutionDraft.create({
      userId,
      problemId,
      currentContent: ' ',
      versions: [{ content: ' ', timestamp: new Date(), description: 'Reattempt draft' }],
      lastEdited: new Date(),
      status: 'active',
      autoSaveEnabled: true
    });
    // Update user's activeDrafts
    await User.findByIdAndUpdate(userId, {
      $addToSet: { activeDrafts: newDraft._id }
    });
    res.status(201).json(
      new ApiResponse(201, 'New draft created for reattempt', newDraft)
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