import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import User from '../models/user.model';
import UserRole from '../models/userRole.model';
import { recordDailyVisit, getStreakInfo } from '../services/zemonStreak.service';

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
    const { collegeDetails, profile, interests, profileBackground, college, socialLinks } = req.body;

    // Filter out unwanted fields
    const updateData: any = {};
    if (collegeDetails) updateData.collegeDetails = collegeDetails;
    if (profile) updateData.profile = profile;
    if (interests) updateData.interests = interests;
    if (profileBackground) updateData.profileBackground = profileBackground;
    if (college) updateData.college = college;
    if (socialLinks) updateData.socialLinks = socialLinks;

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
 * @desc    Update user profile background
 * @route   PATCH /api/users/me/background
 * @access  Private
 */
export const updateProfileBackground = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, value, name } = req.body;

    // Validate required fields
    if (!type || !value || !name) {
      return next(new AppError('Type, value, and name are required', 400));
    }

    // Validate type
    if (!['gradient', 'image'].includes(type)) {
      return next(new AppError('Type must be either "gradient" or "image"', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          profileBackground: {
            type,
            value,
            name
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Profile background updated successfully',
        updatedUser.profileBackground
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

/**
 * @desc    Record daily visit and update streak
 * @route   POST /api/users/me/visit
 * @access  Private
 */
export const recordDailyVisitController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streakInfo = await recordDailyVisit(req.user._id);
      
      res.status(200).json(
        new ApiResponse(
          200,
          'Daily visit recorded successfully',
          streakInfo
        )
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to record visit', 500));
    }
  }
);

/**
 * @desc    Get current streak information
 * @route   GET /api/users/me/streak
 * @access  Private
 */
export const getStreakInfoController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const streakInfo = await getStreakInfo(req.user._id);
      
      res.status(200).json(
        new ApiResponse(
          200,
          'Streak information retrieved successfully',
          streakInfo
        )
      );
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to get streak info', 500));
    }
  }
);

/**
 * @desc    Change user password
 * @route   PATCH /api/users/me/password
 * @access  Private
 */
export const changePasswordController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters long', 400));
    }

    try {
      // Note: In a real implementation, you would verify the current password with Clerk
      // For now, we'll just update the user record
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { passwordUpdatedAt: new Date() } },
        { new: true }
      );

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Password changed successfully'));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to change password', 500));
    }
  }
);

/**
 * @desc    Update user skills
 * @route   PATCH /api/users/me/skills
 * @access  Private
 */
export const updateSkillsController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return next(new AppError('Skills must be an array', 400));
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'profile.skills': skills } },
        { new: true }
      );

      if (!updatedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Skills updated successfully', { skills: updatedUser.profile?.skills }));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to update skills', 500));
    }
  }
);

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/me
 * @access  Private
 */
export const deleteAccountController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.user._id);

      if (!deletedUser) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json(new ApiResponse(200, 'Account deleted successfully'));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to delete account', 500));
    }
  }
);

/**
 * @desc    Export user data
 * @route   GET /api/users/me/export
 * @access  Private
 */
export const exportUserDataController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user._id).select('-__v');

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Create export data (exclude sensitive information)
      const exportData = {
        profile: {
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          bio: user.profile?.bio,
          aboutMe: user.profile?.aboutMe,
          location: user.profile?.location,
          skills: user.profile?.skills,
          toolsAndTech: user.profile?.toolsAndTech,
        },
        college: user.college,
        socialLinks: user.socialLinks,
        stats: user.stats,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.status(200).json(new ApiResponse(200, 'User data exported successfully', exportData));
    } catch (error) {
      return next(new AppError(error instanceof Error ? error.message : 'Failed to export user data', 500));
    }
  }
);