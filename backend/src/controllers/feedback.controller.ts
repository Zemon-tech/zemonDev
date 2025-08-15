import { Request, Response } from 'express';
import { Feedback, User } from '../models';
import ApiResponse from '../utils/ApiResponse';
import logger from '../utils/logger';

/**
 * Submit feedback
 * @route POST /api/feedback
 * @access Private
 */
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { message, category } = req.body;
    const userId = req.auth?.userId;

    if (!message) {
      return res.status(400).json(
        new ApiResponse(400, 'Feedback message is required', null)
      );
    }

    // Get user details
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, 'User not found', null)
      );
    }

    // Create feedback entry
    const feedback = new Feedback({
      userId: user._id,
      clerkId: user.clerkId,
      email: user.email,
      fullName: user.fullName,
      message,
      category: category || 'other',
    });

    await feedback.save();

    return res.status(201).json(
      new ApiResponse(201, 'Feedback submitted successfully', feedback)
    );
  } catch (error) {
    logger.error('Error submitting feedback:', error);
    return res.status(500).json(
      new ApiResponse(500, 'Failed to submit feedback', null)
    );
  }
};

/**
 * Get all feedback for a user
 * @route GET /api/feedback
 * @access Private
 */
export const getUserFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;

    const feedback = await Feedback.find({ clerkId: userId }).sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, `Retrieved ${feedback.length} feedback items`, {
        count: feedback.length,
        data: feedback
      })
    );
  } catch (error) {
    logger.error('Error fetching user feedback:', error);
    return res.status(500).json(
      new ApiResponse(500, 'Failed to fetch feedback', null)
    );
  }
};

/**
 * Get all feedback (admin only)
 * @route GET /api/admin/feedback
 * @access Admin
 */
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Feedback.countDocuments(query);

    return res.status(200).json(
      new ApiResponse(200, `Retrieved ${feedback.length} feedback items`, {
        count: feedback.length,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        data: feedback
      })
    );
  } catch (error) {
    logger.error('Error fetching all feedback:', error);
    return res.status(500).json(
      new ApiResponse(500, 'Failed to fetch feedback', null)
    );
  }
};

/**
 * Update feedback status (admin only)
 * @route PATCH /api/admin/feedback/:id
 * @access Admin
 */
export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json(
        new ApiResponse(404, 'Feedback not found', null)
      );
    }

    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;
    if (adminNotes !== undefined) feedback.adminNotes = adminNotes;

    await feedback.save();

    return res.status(200).json(
      new ApiResponse(200, 'Feedback updated successfully', feedback)
    );
  } catch (error) {
    logger.error('Error updating feedback:', error);
    return res.status(500).json(
      new ApiResponse(500, 'Failed to update feedback', null)
    );
  }
};
