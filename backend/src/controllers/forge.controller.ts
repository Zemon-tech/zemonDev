import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { ForgeResource, User } from '../models/index';

/**
 * @desc    Get all resources with filters
 * @route   GET /api/forge
 * @access  Public
 */
export const getAllResources = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, tags, difficulty, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter: any = {};
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: (tags as string).split(',') };

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      select: '-__v',
      populate: { path: 'createdBy', select: 'fullName' }
    };

    // Count total documents
    const total = await ForgeResource.countDocuments(filter);
    
    // Execute query
    const resources = await ForgeResource.find(filter)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: 'desc' })
      .select(options.select)
      .populate(options.populate);

    res.status(200).json(
      new ApiResponse(
        200,
        'Resources fetched successfully',
        {
          resources,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            pages: Math.ceil(total / options.limit)
          }
        }
      )
    );
  }
);

/**
 * @desc    Get a single resource by ID
 * @route   GET /api/forge/:id
 * @access  Public
 */
export const getResourceById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const resource = await ForgeResource.findById(req.params.id)
      .select('-__v')
      .populate('createdBy', 'fullName');

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Increment view count
    resource.metrics.views += 1;
    await resource.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Resource fetched successfully',
        resource
      )
    );
  }
);

/**
 * @desc    Bookmark a resource
 * @route   POST /api/forge/:id/bookmark
 * @access  Private
 */
export const bookmarkResource = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user._id;

    // Check if resource exists
    const resource = await ForgeResource.findById(resourceId);
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check if user has already bookmarked this resource
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const isBookmarked = user.bookmarkedResources.some(
      (id) => id.toString() === resourceId
    );

    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedResources: resourceId }
      });

      // Decrement bookmark count
      resource.metrics.bookmarks -= 1;
      await resource.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          'Resource removed from bookmarks',
          { isBookmarked: false }
        )
      );
    }

    // Add bookmark
    await User.findByIdAndUpdate(userId, {
      $addToSet: { bookmarkedResources: resourceId }
    });

    // Increment bookmark count
    resource.metrics.bookmarks += 1;
    await resource.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Resource bookmarked successfully',
        { isBookmarked: true }
      )
    );
  }
);

/**
 * @desc    Rate and review a resource
 * @route   POST /api/forge/:id/review
 * @access  Private
 */
export const reviewResource = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment } = req.body;
    const resourceId = req.params.id;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // Check if resource exists
    const resource = await ForgeResource.findById(resourceId);
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check if user has already reviewed this resource
    const existingReviewIndex = resource.reviews.findIndex(
      (review) => review.userId.toString() === userId.toString()
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      resource.reviews[existingReviewIndex].rating = rating;
      resource.reviews[existingReviewIndex].comment = comment || '';
    } else {
      // Add new review
      resource.reviews.push({
        userId,
        rating,
        comment: comment || '',
        createdAt: new Date()
      });
    }

    // Calculate new average rating
    const totalRating = resource.reviews.reduce((sum, item) => sum + item.rating, 0);
    resource.metrics.rating = parseFloat((totalRating / resource.reviews.length).toFixed(1));

    await resource.save();

    res.status(200).json(
      new ApiResponse(
        200,
        'Review submitted successfully',
        {
          review: {
            rating,
            comment,
            userId
          },
          newRating: resource.metrics.rating
        }
      )
    );
  }
); 