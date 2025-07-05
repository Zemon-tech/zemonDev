import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { CrucibleNote } from '../models/index';

/**
 * @desc    Get notes for a problem
 * @route   GET /api/crucible/:problemId/notes
 * @access  Private
 */
export const getNotes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Try to find existing notes
    let notes = await CrucibleNote.findOne({
      userId,
      problemId,
      status: 'active'
    });

    // If no notes exist, create new empty notes
    if (!notes) {
      notes = await CrucibleNote.create({
        userId,
        problemId,
        content: '',
        tags: [],
        status: 'active',
        visibility: 'private'
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Notes fetched successfully',
        notes
      )
    );
  }
);

/**
 * @desc    Update notes for a problem
 * @route   PUT /api/crucible/:problemId/notes
 * @access  Private
 */
export const updateNotes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { content, tags, visibility } = req.body;

    // Find the notes
    let notes = await CrucibleNote.findOne({
      userId,
      problemId,
      status: 'active'
    });

    // If no notes exist, create new notes
    if (!notes) {
      notes = await CrucibleNote.create({
        userId,
        problemId,
        content: content || '',
        tags: tags || [],
        status: 'active',
        visibility: visibility || 'private'
      });
    } else {
      // Update existing notes
      if (content !== undefined) notes.content = content;
      if (tags !== undefined) notes.tags = tags;
      if (visibility !== undefined) notes.visibility = visibility;
      await notes.save();
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Notes updated successfully',
        notes
      )
    );
  }
);

/**
 * @desc    Delete notes for a problem
 * @route   DELETE /api/crucible/:problemId/notes
 * @access  Private
 */
export const deleteNotes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Find the notes
    const notes = await CrucibleNote.findOne({
      userId,
      problemId,
      status: 'active'
    });

    if (!notes) {
      return next(new AppError('Notes not found', 404));
    }

    // Soft delete by changing status to archived
    notes.status = 'archived';
    await notes.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Notes deleted successfully',
        {}
      )
    );
  }
); 