import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { CrucibleDiagram } from '../models/index';

/**
 * @desc    Get all diagrams for a problem
 * @route   GET /api/crucible/:problemId/diagrams
 * @access  Private
 */
export const getDiagrams = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    const diagrams = await CrucibleDiagram.find({
      userId,
      problemId,
      status: 'active'
    }).sort({ updatedAt: -1 });

    res.status(200).json(
      new ApiResponse(
        200,
        'Diagrams fetched successfully',
        diagrams
      )
    );
  }
);

/**
 * @desc    Create a new diagram
 * @route   POST /api/crucible/:problemId/diagrams
 * @access  Private
 */
export const createDiagram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { title, type, content, thumbnail } = req.body;

    // Validate request body
    if (!title || !content) {
      return next(new AppError('Title and content are required', 400));
    }

    const diagram = await CrucibleDiagram.create({
      userId,
      problemId,
      title,
      type: type || 'architecture',
      content,
      thumbnail: thumbnail || '',
      status: 'active'
    });

    res.status(201).json(
      new ApiResponse(
        201,
        'Diagram created successfully',
        diagram
      )
    );
  }
);

/**
 * @desc    Get a specific diagram
 * @route   GET /api/crucible/:problemId/diagrams/:diagramId
 * @access  Private
 */
export const getDiagram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, diagramId } = req.params;
    const userId = req.user._id;

    const diagram = await CrucibleDiagram.findOne({
      _id: diagramId,
      userId,
      problemId,
      status: 'active'
    });

    if (!diagram) {
      return next(new AppError('Diagram not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Diagram fetched successfully',
        diagram
      )
    );
  }
);

/**
 * @desc    Update a diagram
 * @route   PUT /api/crucible/:problemId/diagrams/:diagramId
 * @access  Private
 */
export const updateDiagram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, diagramId } = req.params;
    const userId = req.user._id;
    const { title, type, content, thumbnail } = req.body;

    const diagram = await CrucibleDiagram.findOne({
      _id: diagramId,
      userId,
      problemId,
      status: 'active'
    });

    if (!diagram) {
      return next(new AppError('Diagram not found', 404));
    }

    // Update fields if provided
    if (title !== undefined) diagram.title = title;
    if (type !== undefined) diagram.type = type;
    if (content !== undefined) diagram.content = content;
    if (thumbnail !== undefined) diagram.thumbnail = thumbnail;

    await diagram.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Diagram updated successfully',
        diagram
      )
    );
  }
);

/**
 * @desc    Delete a diagram
 * @route   DELETE /api/crucible/:problemId/diagrams/:diagramId
 * @access  Private
 */
export const deleteDiagram = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, diagramId } = req.params;
    const userId = req.user._id;

    const diagram = await CrucibleDiagram.findOne({
      _id: diagramId,
      userId,
      problemId,
      status: 'active'
    });

    if (!diagram) {
      return next(new AppError('Diagram not found', 404));
    }

    // Soft delete by changing status
    diagram.status = 'archived';
    await diagram.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Diagram deleted successfully',
        {}
      )
    );
  }
); 