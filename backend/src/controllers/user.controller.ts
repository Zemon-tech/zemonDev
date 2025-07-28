import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import User from '../models/user.model';
import UserRole from '../models/userRole.model';

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
 * @desc    Handle Clerk webhook for user creation/updates
 * @route   POST /api/webhooks/clerk
 * @access  Public (Webhook signature should be verified in production)
 */
export const handleClerkWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const evt = req.body;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        // Idempotency: If user already exists, acknowledge successfully.
        return res.status(200).json({ message: 'User already processed.' });
      }

      const primaryEmail = email_addresses.find((e: any) => e.id === evt.data.primary_email_address_id)?.email_address;
      if (!primaryEmail) {
        return next(new AppError('Primary email address not found on webhook event.', 400));
      }

      const newUser = await User.create({
        clerkId: id,
        email: primaryEmail,
        fullName: `${first_name || ''} ${last_name || ''}`.trim(),
      });

      return res.status(201).json(new ApiResponse(201, 'User created successfully.', { userId: newUser._id }));

    } else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;

      const primaryEmail = email_addresses.find((e: any) => e.id === evt.data.primary_email_address_id)?.email_address;
      if (!primaryEmail) {
        return next(new AppError('Primary email address not found on webhook event.', 400));
      }

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          $set: {
            email: primaryEmail,
            fullName: `${first_name || ''} ${last_name || ''}`.trim(),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        // This could happen if the created webhook failed or was missed.
        // We could either create the user here or return an error.
        // For now, we'll return an error.
        return next(new AppError(`Webhook Error: User with clerkId ${id} not found for update.`, 404));
      }

      return res.status(200).json(new ApiResponse(200, 'User updated successfully.', { userId: updatedUser._id }));

    } else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      await User.findOneAndDelete({ clerkId: id });
      
      return res.status(200).json(new ApiResponse(200, 'User deleted successfully.'));
    }

    // Acknowledge other event types without taking action
    res.status(200).json({ message: `Webhook received: ${eventType}, no action taken.` });
  }
);

/**
 * @desc    Get current user role
 * @route   GET /api/users/me/role
 * @access  Private
 */
export const getUserRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get all roles for the user (both global and channel-specific)
    const userRoles = await UserRole.find({ userId: user._id })
      .sort({ role: 1 }) // This will sort: admin, moderator, user
      .select('role channelId grantedBy grantedAt');

    // Separate global and channel-specific roles
    const globalRoles = userRoles.filter(role => !role.channelId);
    const channelRoles = userRoles.filter(role => role.channelId);

    // Determine highest global role
    let highestGlobalRole = 'user';
    if (globalRoles.length > 0) {
      const adminRole = globalRoles.find(role => role.role === 'admin');
      if (adminRole) {
        highestGlobalRole = 'admin';
      } else {
        const moderatorRole = globalRoles.find(role => role.role === 'moderator');
        if (moderatorRole) {
          highestGlobalRole = 'moderator';
        }
      }
    }

    // Create a map of channel-specific roles for easy lookup
    const channelRoleMap: Record<string, { role: string; grantedBy?: string; grantedAt?: Date }> = {};
    channelRoles.forEach(role => {
      if (role.channelId) {
        channelRoleMap[role.channelId.toString()] = {
          role: role.role,
          grantedBy: role.grantedBy?.toString(),
          grantedAt: role.grantedAt
        };
      }
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'User role retrieved successfully',
        { 
          role: highestGlobalRole, // Backward compatibility
          globalRole: highestGlobalRole,
          globalRoles: globalRoles,
          channelRoles: channelRoleMap,
          allRoles: userRoles // Complete role information
        }
      )
    );
  }
);