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
    const userId = req.user?._id;
    const channels = await ArenaChannel.find({}).sort({ group: 1, name: 1 });
    let userStatuses: any[] = [];
    if (userId) {
      userStatuses = await UserChannelStatus.find({ userId });
    }
    // Map channelId to status
    const statusMap = userStatuses.reduce((acc, s) => {
      acc[s.channelId.toString()] = s.status === 'approved';
      return acc;
    }, {} as Record<string, boolean>);

    // Attach user-specific permissions
    const channelsWithPerms = channels.map((ch: any) => {
      const isMember = statusMap[ch._id.toString()] || false;
      return {
        ...ch.toObject(),
        permissions: {
          canRead: isMember,
          canMessage: isMember && ch.type === 'text',
        },
      };
    });

    // Group by category
    const groupedChannels = channelsWithPerms.reduce((acc: Record<string, any[]>, channel) => {
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
    // Only update read status if user is approved for this channel
    const userStatus = await UserChannelStatus.findOne({ userId, channelId, status: 'approved' });
    if (userStatus) {
      userStatus.lastReadTimestamp = new Date();
      if (messages.length > 0 && mongoose.isValidObjectId(messages[0]._id)) {
        userStatus.lastReadMessageId = new mongoose.Types.ObjectId(String(messages[0]._id));
      }
      await userStatus.save();
    }

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
    // Only update read status if user is approved for this channel
    const userStatus2 = await UserChannelStatus.findOne({ userId, channelId, status: 'approved' });
    if (userStatus2) {
      userStatus2.lastReadTimestamp = new Date();
      if (message._id && mongoose.isValidObjectId(message._id)) {
        userStatus2.lastReadMessageId = new mongoose.Types.ObjectId(String(message._id));
      }
      await userStatus2.save();
    }

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
 * @desc    Mark all messages in a channel as read
 * @route   POST /api/arena/channels/:channelId/mark-read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
    }

    // Get the latest message in the channel
    const latestMessage = await ArenaMessage.findOne({ channelId })
      .sort({ timestamp: -1 })
      .limit(1);

    // Update user's last read timestamp and message ID
    // Only update read status if user is approved for this channel
    const userStatus3 = await UserChannelStatus.findOne({ userId, channelId, status: 'approved' });
    if (userStatus3) {
      userStatus3.lastReadTimestamp = new Date();
      if (latestMessage && latestMessage._id && mongoose.isValidObjectId(latestMessage._id)) {
        userStatus3.lastReadMessageId = new mongoose.Types.ObjectId(String(latestMessage._id));
      }
      await userStatus3.save();
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'All messages marked as read',
        { success: true }
      )
    );
  }
);

/**
 * @desc    Get unread message count for all channels
 * @route   GET /api/arena/channels/unread-counts
 * @access  Private
 */
export const getAllUnreadCounts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Get all channels (not just isActive: true)
    const channels = await ArenaChannel.find({});
    
    // Get user's status for all channels
    const userStatuses = await UserChannelStatus.find({ userId });
    
    // Create a map of channelId to lastReadTimestamp
    const lastReadMap = userStatuses.reduce((map, status) => {
      map[status.channelId.toString()] = status.lastReadTimestamp;
      return map;
    }, {} as Record<string, Date>);

    // Calculate unread counts for each channel
    const unreadCountPromises = channels.map(async (channel: any) => {
      const channelId = channel._id.toString();
      const lastReadTimestamp = lastReadMap[channelId] || new Date(0);
      
      const unreadCount = await ArenaMessage.countDocuments({
        channelId: new mongoose.Types.ObjectId(channelId),
        timestamp: { $gt: lastReadTimestamp },
        userId: { $ne: userId } // Don't count user's own messages
      });

      return {
        channelId,
        unreadCount
      };
    });

    const unreadCounts = await Promise.all(unreadCountPromises);

    res.status(200).json(
      new ApiResponse(
        200,
        'Unread counts retrieved successfully',
        { unreadCounts }
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