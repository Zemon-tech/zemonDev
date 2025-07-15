import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { ArenaChannel, ArenaMessage, UserChannelStatus } from '../models';
import mongoose from 'mongoose';
import { emitToChannel } from '../services/socket.service';

/**
 * @desc    Get all channels grouped by category
 * @route   GET /api/arena/channels
 * @access  Public
 */
export const getChannels = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const channels = await ArenaChannel.find({ isActive: true })
      .sort({ group: 1, name: 1 });
    
    // Group by category
    const groupedChannels = channels.reduce((acc: Record<string, any[]>, channel) => {
      if (!acc[channel.group]) acc[channel.group] = [];
      acc[channel.group].push(channel);
      return acc;
    }, {});

    res.status(200).json(
      new ApiResponse(
        200,
        'Channels retrieved successfully',
        groupedChannels
      )
    );
  }
);

/**
 * @desc    Get messages for a channel
 * @route   GET /api/arena/channels/:channelId/messages
 * @access  Private
 */
export const getChannelMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { channelId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const userId = req.user._id;

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Build query
    const query: any = { channelId };
    
    // If 'before' parameter is provided, get messages before that timestamp
    if (before) {
      query.timestamp = { $lt: new Date(before as string) };
    }

    // Fetch messages with pagination
    const messages = await ArenaMessage.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10))
      .limit(parseInt(limit as string, 10))
      .populate('userId', 'fullName')
      .populate('replyToId');

    // Update user's last read timestamp for this channel
    await UserChannelStatus.findOneAndUpdate(
      { userId, channelId },
      { 
        lastReadTimestamp: new Date(),
        lastReadMessageId: messages.length > 0 ? messages[0]._id : undefined
      },
      { upsert: true }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        'Messages retrieved successfully',
        {
          messages: messages.reverse(), // Return in chronological order
          pagination: {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10)
          }
        }
      )
    );
  }
);

/**
 * @desc    Send message to channel
 * @route   POST /api/arena/channels/:channelId/messages
 * @access  Private
 */
export const createMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { channelId } = req.params;
    const { content, replyToId } = req.body;
    const userId = req.user._id;
    const username = req.user.fullName;

    // Validate input
    if (!content || content.trim() === '') {
      return next(new AppError('Message content is required', 400));
    }

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Check if user can post in this channel
    if (!channel.permissions.canMessage) {
      return next(new AppError('You do not have permission to post in this channel', 403));
    }

    // Check if reply message exists if replyToId is provided
    if (replyToId) {
      const replyMessage = await ArenaMessage.findById(replyToId);
      if (!replyMessage) {
        return next(new AppError('Reply message not found', 404));
      }
    }

    // Extract mentions from content (usernames starting with @)
    const mentionRegex = /@(\w+)/g;
    const mentionMatches = content.match(mentionRegex) || [];
    const mentions: mongoose.Types.ObjectId[] = []; // This would be populated with actual user IDs in a real implementation

    // Create new message
    const message = await ArenaMessage.create({
      channelId,
      userId,
      username,
      content,
      replyToId,
      mentions,
      timestamp: new Date(),
      type: 'text'
    });

    // Populate user info
    const populatedMessage = await ArenaMessage.findById(message._id)
      .populate('userId', 'fullName')
      .populate('replyToId');

    // Update user's last read timestamp
    await UserChannelStatus.findOneAndUpdate(
      { userId, channelId },
      { 
        lastReadTimestamp: new Date(),
        lastReadMessageId: message._id
      },
      { upsert: true }
    );

    // Emit the new message to all users in the channel via Socket.IO
    emitToChannel(channelId, 'new_message', populatedMessage);

    res.status(201).json(
      new ApiResponse(
        201,
        'Message sent successfully',
        populatedMessage
      )
    );
  }
);

/**
 * @desc    Delete message
 * @route   DELETE /api/arena/channels/:channelId/messages/:messageId
 * @access  Private
 */
export const deleteMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { channelId, messageId } = req.params;
    const userId = req.user._id;

    // Check if message exists
    const message = await ArenaMessage.findById(messageId);
    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    // Check if user is the message author or a moderator
    const isAuthor = message.userId.toString() === userId.toString();
    const channel = await ArenaChannel.findById(channelId);
    const isModerator = channel?.moderators.some(id => id.toString() === userId.toString());

    if (!isAuthor && !isModerator) {
      return next(new AppError('You do not have permission to delete this message', 403));
    }

    // Soft delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;
    await message.save();

    // Notify all users in the channel about the deleted message
    emitToChannel(channelId, 'message_deleted', { messageId });

    res.status(200).json(
      new ApiResponse(
        200,
        'Message deleted successfully',
        { messageId }
      )
    );
  }
);

/**
 * @desc    Get unread message count
 * @route   GET /api/arena/channels/:channelId/unread-count
 * @access  Private
 */
export const getUnreadMessageCount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Get user's last read timestamp for this channel
    const userStatus = await UserChannelStatus.findOne({ userId, channelId });
    const lastReadTimestamp = userStatus?.lastReadTimestamp || new Date(0); // Default to epoch if never read

    // Count messages after the last read timestamp
    const unreadCount = await ArenaMessage.countDocuments({
      channelId,
      timestamp: { $gt: lastReadTimestamp },
      userId: { $ne: userId } // Don't count user's own messages
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'Unread count retrieved successfully',
        { unreadCount }
      )
    );
  }
); 