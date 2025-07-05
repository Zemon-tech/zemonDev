import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { ProgressTracking, CrucibleProblem } from '../models/index';

/**
 * @desc    Get progress for a problem
 * @route   GET /api/crucible/:problemId/progress
 * @access  Private
 */
export const getProgress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;

    // Try to find existing progress
    let progress = await ProgressTracking.findOne({
      userId,
      problemId
    });

    // If no progress exists, create a new one with default values
    if (!progress) {
      // Get problem to initialize milestones
      const problem = await CrucibleProblem.findById(problemId);
      if (!problem) {
        return next(new AppError('Problem not found', 404));
      }

      // Create milestones from problem subtasks or use defaults
      const milestones = problem.subtasks?.length
        ? problem.subtasks.map((task, index) => ({
            id: `milestone-${index}`,
            description: task,
            completed: false
          }))
        : [
            { id: 'milestone-1', description: 'Understand the problem', completed: false },
            { id: 'milestone-2', description: 'Design solution approach', completed: false },
            { id: 'milestone-3', description: 'Implement solution', completed: false },
            { id: 'milestone-4', description: 'Test and refine', completed: false }
          ];

      progress = await ProgressTracking.create({
        userId,
        problemId,
        status: 'not-started',
        timeSpent: 0,
        milestones,
        lastActive: new Date()
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Progress fetched successfully',
        progress
      )
    );
  }
);

/**
 * @desc    Update progress for a problem
 * @route   PUT /api/crucible/:problemId/progress
 * @access  Private
 */
export const updateProgress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { status, timeSpent } = req.body;

    // Find the progress
    let progress = await ProgressTracking.findOne({
      userId,
      problemId
    });

    if (!progress) {
      return next(new AppError('Progress not found', 404));
    }

    // Update fields if provided
    if (status !== undefined) progress.status = status;
    if (timeSpent !== undefined) progress.timeSpent = timeSpent;
    
    // Always update lastActive
    progress.lastActive = new Date();

    await progress.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Progress updated successfully',
        progress
      )
    );
  }
);

/**
 * @desc    Update a specific milestone
 * @route   PUT /api/crucible/:problemId/progress/milestones/:milestoneId
 * @access  Private
 */
export const updateMilestone = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, milestoneId } = req.params;
    const userId = req.user._id;
    const { completed, description } = req.body;

    // Find the progress
    const progress = await ProgressTracking.findOne({
      userId,
      problemId
    });

    if (!progress) {
      return next(new AppError('Progress not found', 404));
    }

    // Find the milestone
    const milestone = progress.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return next(new AppError('Milestone not found', 404));
    }

    // Update milestone
    if (completed !== undefined) {
      milestone.completed = completed;
      if (completed) {
        milestone.completedAt = new Date();
      } else {
        milestone.completedAt = undefined;
      }
    }
    
    if (description !== undefined) {
      milestone.description = description;
    }

    // Update lastActive
    progress.lastActive = new Date();

    // If all milestones are completed, update status to completed
    const allCompleted = progress.milestones.every(m => m.completed);
    if (allCompleted && progress.status !== 'completed') {
      progress.status = 'completed';
    }

    await progress.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Milestone updated successfully',
        progress
      )
    );
  }
);

/**
 * @desc    Add a new milestone
 * @route   POST /api/crucible/:problemId/progress/milestones
 * @access  Private
 */
export const addMilestone = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { description } = req.body;

    if (!description) {
      return next(new AppError('Description is required', 400));
    }

    // Find the progress
    const progress = await ProgressTracking.findOne({
      userId,
      problemId
    });

    if (!progress) {
      return next(new AppError('Progress not found', 404));
    }

    // Generate a unique ID for the new milestone
    const milestoneId = `milestone-${Date.now()}`;

    // Add the new milestone
    progress.milestones.push({
      id: milestoneId,
      description,
      completed: false
    });

    // Update lastActive
    progress.lastActive = new Date();

    await progress.save();

    res.status(201).json(
      new ApiResponse(
        201,
        'Milestone added successfully',
        progress
      )
    );
  }
);

/**
 * @desc    Delete a milestone
 * @route   DELETE /api/crucible/:problemId/progress/milestones/:milestoneId
 * @access  Private
 */
export const deleteMilestone = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { problemId, milestoneId } = req.params;
    const userId = req.user._id;

    // Find the progress
    const progress = await ProgressTracking.findOne({
      userId,
      problemId
    });

    if (!progress) {
      return next(new AppError('Progress not found', 404));
    }

    // Find the milestone index
    const milestoneIndex = progress.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) {
      return next(new AppError('Milestone not found', 404));
    }

    // Remove the milestone
    progress.milestones.splice(milestoneIndex, 1);

    // Update lastActive
    progress.lastActive = new Date();

    await progress.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Milestone deleted successfully',
        progress
      )
    );
  }
); 