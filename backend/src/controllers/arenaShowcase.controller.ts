import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { ProjectShowcase } from '../models';

/**
 * @desc    Get all showcased projects
 * @route   GET /api/arena/showcase
 * @access  Public
 */
export const getShowcasedProjects = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { upvotes: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { submittedAt: -1 };
        break;
    }

    // Only show approved projects
    const filter = { isApproved: true };

    // Count total documents
    const total = await ProjectShowcase.countDocuments(filter);
    
    // Fetch projects with pagination
    const projects = await ProjectShowcase.find(filter)
      .sort(sortOptions)
      .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10))
      .limit(parseInt(limit as string, 10))
      .populate('userId', 'fullName');

    res.status(200).json(
      new ApiResponse(
        200,
        'Projects retrieved successfully',
        {
          projects,
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

/**
 * @desc    Submit new project
 * @route   POST /api/arena/showcase
 * @access  Private
 */
export const submitProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, images, gitRepositoryUrl, demoUrl } = req.body;
    const userId = req.user._id;
    const username = req.user.fullName;

    // Validate input
    if (!title || title.trim() === '') {
      return next(new AppError('Project title is required', 400));
    }

    if (!gitRepositoryUrl || gitRepositoryUrl.trim() === '') {
      return next(new AppError('Git repository URL is required', 400));
    }

    if (!demoUrl || demoUrl.trim() === '') {
      return next(new AppError('Demo URL is required', 400));
    }

    // Validate images (max 3)
    if (images && images.length > 3) {
      return next(new AppError('Maximum 3 images allowed', 400));
    }

    // Create new project
    const project = await ProjectShowcase.create({
      title,
      description,
      images: images || [],
      gitRepositoryUrl,
      demoUrl,
      userId,
      username,
      submittedAt: new Date(),
      isApproved: false, // Requires approval by moderator
      upvotes: 0,
      upvotedBy: []
    });

    res.status(201).json(
      new ApiResponse(
        201,
        'Project submitted successfully and awaiting approval',
        project
      )
    );
  }
);

/**
 * @desc    Upvote project
 * @route   POST /api/arena/showcase/:projectId/upvote
 * @access  Private
 */
export const upvoteProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Check if project exists
    const project = await ProjectShowcase.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has already upvoted
    if (project.upvotedBy.some(id => id.toString() === userId.toString())) {
      return next(new AppError('You have already upvoted this project', 400));
    }

    // Add upvote
    project.upvotes += 1;
    project.upvotedBy.push(userId);
    await project.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Project upvoted successfully',
        {
          projectId,
          upvotes: project.upvotes,
          hasUpvoted: true
        }
      )
    );
  }
);

/**
 * @desc    Remove upvote
 * @route   DELETE /api/arena/showcase/:projectId/upvote
 * @access  Private
 */
export const removeUpvote = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Check if project exists
    const project = await ProjectShowcase.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Check if user has upvoted
    if (!project.upvotedBy.some(id => id.toString() === userId.toString())) {
      return next(new AppError('You have not upvoted this project', 400));
    }

    // Remove upvote
    project.upvotes -= 1;
    project.upvotedBy = project.upvotedBy.filter(
      id => id.toString() !== userId.toString()
    );
    await project.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Upvote removed successfully',
        {
          projectId,
          upvotes: project.upvotes,
          hasUpvoted: false
        }
      )
    );
  }
); 