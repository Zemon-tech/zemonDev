import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { ResearchItem } from '../models/index';

/**
 * @desc    Get all research items for a problem
 * @route   GET /api/crucible/:problemId/research
 * @access  Private
 */
export const getResearchItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { type } = req.query;

    // Build query
    const query: any = {
      userId,
      problemId,
      status: 'active'
    };

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    const researchItems = await ResearchItem.find(query).sort({ updatedAt: -1 });

    res.status(200).json(
      new ApiResponse(
        200,
        'Research items fetched successfully',
        researchItems
      )
    );
  }
);

/**
 * @desc    Create a new research item
 * @route   POST /api/crucible/:problemId/research
 * @access  Private
 */
export const createResearchItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { title, type, content, notes, tags } = req.body;

    // Validate request body
    if (!title || !content) {
      return next(new AppError('Title and content are required', 400));
    }

    const researchItem = await ResearchItem.create({
      userId,
      problemId,
      title,
      type: type || 'article',
      content,
      notes: notes || '',
      tags: tags || [],
      status: 'active'
    });

    res.status(201).json(
      new ApiResponse(
        201,
        'Research item created successfully',
        researchItem
      )
    );
  }
);

/**
 * @desc    Get a specific research item
 * @route   GET /api/crucible/:problemId/research/:itemId
 * @access  Private
 */
export const getResearchItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, itemId } = req.params;
    const userId = req.user._id;

    const researchItem = await ResearchItem.findOne({
      _id: itemId,
      userId,
      problemId,
      status: 'active'
    });

    if (!researchItem) {
      return next(new AppError('Research item not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Research item fetched successfully',
        researchItem
      )
    );
  }
);

/**
 * @desc    Update a research item
 * @route   PUT /api/crucible/:problemId/research/:itemId
 * @access  Private
 */
export const updateResearchItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, itemId } = req.params;
    const userId = req.user._id;
    const { title, type, content, notes, tags } = req.body;

    const researchItem = await ResearchItem.findOne({
      _id: itemId,
      userId,
      problemId,
      status: 'active'
    });

    if (!researchItem) {
      return next(new AppError('Research item not found', 404));
    }

    // Update fields if provided
    if (title !== undefined) researchItem.title = title;
    if (type !== undefined) researchItem.type = type;
    if (content !== undefined) researchItem.content = content;
    if (notes !== undefined) researchItem.notes = notes;
    if (tags !== undefined) researchItem.tags = tags;

    await researchItem.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Research item updated successfully',
        researchItem
      )
    );
  }
);

/**
 * @desc    Delete a research item
 * @route   DELETE /api/crucible/:problemId/research/:itemId
 * @access  Private
 */
export const deleteResearchItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, itemId } = req.params;
    const userId = req.user._id;

    const researchItem = await ResearchItem.findOne({
      _id: itemId,
      userId,
      problemId,
      status: 'active'
    });

    if (!researchItem) {
      return next(new AppError('Research item not found', 404));
    }

    // Soft delete by changing status
    researchItem.status = 'archived';
    await researchItem.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Research item deleted successfully',
        {}
      )
    );
  }
); 