import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { UserChannelStatus, UserRole, ArenaChannel, User } from '../models';
import mongoose from 'mongoose';
import { emitToUser, emitToChannel } from '../services/socket.service';

/**
 * @desc    Ban user from channel
 * @route   POST /api/arena/users/:userId/ban
 * @access  Private (Moderator/Admin)
 */
export const banUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { channelId, reason, duration } = req.body;
    const moderatorId = req.user._id;

    // Validate input
    if (!channelId) {
      return next(new AppError('Channel ID is required', 400));
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Check if user is moderator or admin
    const isModerator = channel.moderators.some(id => id.toString() === moderatorId.toString());
    const isAdmin = await UserRole.findOne({ 
      userId: moderatorId, 
      role: 'admin' 
    });

    if (!isModerator && !isAdmin) {
      return next(new AppError('You do not have permission to ban users', 403));
    }

    // Check if target user is a moderator or admin (can't ban higher roles)
    const isTargetModerator = channel.moderators.some(id => id.toString() === userId.toString());
    const isTargetAdmin = await UserRole.findOne({
      userId,
      role: 'admin'
    });

    if ((isTargetModerator || isTargetAdmin) && !isAdmin) {
      return next(new AppError('You cannot ban a moderator or admin', 403));
    }

    // Calculate ban expiry date if duration provided (in hours)
    let banExpiresAt;
    if (duration) {
      banExpiresAt = new Date();
      banExpiresAt.setHours(banExpiresAt.getHours() + parseInt(duration, 10));
    }

    // Update or create user channel status
    const userStatus = await UserChannelStatus.findOneAndUpdate(
      { userId, channelId },
      {
        isBanned: true,
        banReason: reason || 'Violation of community guidelines',
        banExpiresAt,
        bannedBy: moderatorId
      },
      { upsert: true, new: true }
    );

    // Notify the banned user via socket
    try {
      emitToUser(userId.toString(), 'user_banned', {
        channelId,
        reason: userStatus.banReason,
        banExpiresAt: userStatus.banExpiresAt
      });

      // Notify channel moderators
      emitToChannel(channelId, 'user_moderation', {
        action: 'banned',
        userId,
        moderatorId,
        reason: userStatus.banReason,
        duration: duration ? `${duration} hours` : 'permanently'
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to emit socket event:', error);
    }

    res.status(200).json(
      new ApiResponse(
        200,
        `User banned successfully${duration ? ` for ${duration} hours` : ''}`,
        userStatus
      )
    );
  }
);

/**
 * @desc    Unban user from channel
 * @route   POST /api/arena/users/:userId/unban
 * @access  Private (Moderator/Admin)
 */
export const unbanUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { channelId } = req.body;
    const moderatorId = req.user._id;

    // Validate input
    if (!channelId) {
      return next(new AppError('Channel ID is required', 400));
    }

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Check if user is moderator or admin
    const isModerator = channel.moderators.some(id => id.toString() === moderatorId.toString());
    const isAdmin = await UserRole.findOne({ 
      userId: moderatorId, 
      role: 'admin' 
    });

    if (!isModerator && !isAdmin) {
      return next(new AppError('You do not have permission to unban users', 403));
    }

    // Update user channel status
    const userStatus = await UserChannelStatus.findOneAndUpdate(
      { userId, channelId },
      {
        isBanned: false,
        banExpiresAt: null
      },
      { new: true }
    );

    if (!userStatus) {
      return next(new AppError('User was not banned from this channel', 404));
    }

    // Notify the unbanned user via socket
    try {
      emitToUser(userId.toString(), 'user_unbanned', {
        channelId
      });

      // Notify channel moderators
      emitToChannel(channelId, 'user_moderation', {
        action: 'unbanned',
        userId,
        moderatorId
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to emit socket event:', error);
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'User unbanned successfully',
        userStatus
      )
    );
  }
);

/**
 * @desc    Kick user from channel
 * @route   POST /api/arena/users/:userId/kick
 * @access  Private (Moderator/Admin)
 */
export const kickUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { channelId, reason } = req.body;
    const moderatorId = req.user._id;

    // Validate input
    if (!channelId) {
      return next(new AppError('Channel ID is required', 400));
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Check if user is moderator or admin
    const isModerator = channel.moderators.some(id => id.toString() === moderatorId.toString());
    const isAdmin = await UserRole.findOne({ 
      userId: moderatorId, 
      role: 'admin' 
    });

    if (!isModerator && !isAdmin) {
      return next(new AppError('You do not have permission to kick users', 403));
    }

    // Check if target user is a moderator or admin (can't kick higher roles)
    const isTargetModerator = channel.moderators.some(id => id.toString() === userId.toString());
    const isTargetAdmin = await UserRole.findOne({
      userId,
      role: 'admin'
    });

    if ((isTargetModerator || isTargetAdmin) && !isAdmin) {
      return next(new AppError('You cannot kick a moderator or admin', 403));
    }

    // Update or create user channel status
    const userStatus = await UserChannelStatus.findOneAndUpdate(
      { userId, channelId },
      {
        isKicked: true,
        kickedAt: new Date(),
        kickedBy: moderatorId
      },
      { upsert: true, new: true }
    );

    // Notify the kicked user via socket
    try {
      emitToUser(userId.toString(), 'user_kicked', {
        channelId,
        reason: reason || 'Violation of community guidelines'
      });

      // Notify channel moderators
      emitToChannel(channelId, 'user_moderation', {
        action: 'kicked',
        userId,
        moderatorId,
        reason: reason || 'Violation of community guidelines'
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to emit socket event:', error);
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'User kicked successfully',
        userStatus
      )
    );
  }
);

/**
 * @desc    Make user moderator
 * @route   POST /api/arena/users/:userId/make-moderator
 * @access  Private (Admin only)
 */
export const makeModerator = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { channelId } = req.body;
    const adminId = req.user._id;

    // Validate input
    if (!channelId) {
      return next(new AppError('Channel ID is required', 400));
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Check if user is admin
    const isAdmin = await UserRole.findOne({ 
      userId: adminId, 
      role: 'admin' 
    });

    if (!isAdmin) {
      return next(new AppError('Only admins can assign moderator roles', 403));
    }

    // Add user to channel moderators if not already there
    if (!channel.moderators.some(id => id.toString() === userId.toString())) {
      channel.moderators.push(new mongoose.Types.ObjectId(userId));
      await channel.save();
    }

    // Create moderator role for user
    const userRole = await UserRole.findOneAndUpdate(
      { userId, channelId },
      {
        role: 'moderator',
        grantedBy: adminId,
        grantedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Notify the new moderator via socket
    try {
      const { emitRoleUpdateNotification } = await import('../utils/roleNotificationUtils');
      await emitRoleUpdateNotification(
        userId.toString(),
        'moderator',
        channelId,
        adminId.toString()
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to emit socket event:', error);
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'User promoted to moderator successfully',
        { userId, channelId, role: 'moderator' }
      )
    );
  }
); 