import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import User from '../models/user.model';

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .populate('bookmarkedResources', 'title url type')
      .populate('completedSolutions', 'problemId status');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'User profile retrieved successfully',
        user
      )
    );
  }
);

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { collegeDetails, profile, interests } = req.body;

    // Filter out unwanted fields
    const updateData: any = {};
    if (collegeDetails) updateData.collegeDetails = collegeDetails;
    if (profile) updateData.profile = profile;
    if (interests) updateData.interests = interests;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'User profile updated successfully',
        updatedUser
      )
    );
  }
);

/**
 * @desc    Handle Clerk webhook for user creation
 * @route   POST /api/webhooks/clerk
 * @access  Public
 */
export const handleClerkWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const evt = req.body;

    // Verify the webhook signature (In production, use Clerk's webhook verification)
    // For now, we'll just check if the event type is supported
    
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        return res.status(200).json({ message: 'User already exists' });
      }

      // Get primary email
      const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
      const emailValue = primaryEmail ? primaryEmail.email_address : '';
      
      // Create a new user
      const user = await User.create({
        clerkId: id,
        email: emailValue,
        fullName: `${first_name || ''} ${last_name || ''}`.trim(),
        interests: [],
        stats: {
          problemsSolved: 0,
          resourcesCreated: 0,
          reputation: 0
        }
      });

      return res.status(201).json({ success: true, userId: user._id });
    } 
    
    else if (evt.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Get primary email
      const primaryEmail = email_addresses.find((email: any) => email.id === evt.data.primary_email_address_id);
      const emailValue = primaryEmail ? primaryEmail.email_address : '';

      // Update user
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          $set: {
            email: emailValue,
            fullName: `${first_name || ''} ${last_name || ''}`.trim(),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ success: true, userId: updatedUser._id });
    } 
    
    else {
      // Unsupported event type
      return res.status(400).json({ error: 'Unsupported event type' });
    }
  }
); 