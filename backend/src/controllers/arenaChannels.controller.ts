import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { ArenaChannel, ArenaMessage, UserChannelStatus } from '../models';
import mongoose from 'mongoose';
import { emitToChannel } from '../services/socket.service';
import User from '../models/user.model';

/**
 * @desc    Get all channels grouped by category
 * @route   GET /api/arena/channels
 * @access  Public
 */
export const getChannels = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Fetch only active channels
    const channels = await ArenaChannel.find({ isActive: true }).sort({ group: 1, name: 1 });

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

    // Check user status for this channel
    const userStatus = await UserChannelStatus.findOne({ userId, channelId });
    if (userStatus) {
      if (userStatus.isKicked || userStatus.status === 'kicked') {
        return res.status(403).json(new ApiResponse(403, 'You are kicked from this channel. Ask moderators to rejoin.', {
          kickedAt: userStatus.kickedAt,
          kickedBy: userStatus.kickedBy
        }));
      }
      if (userStatus.isBanned || userStatus.status === 'banned') {
        return res.status(403).json(new ApiResponse(403, 'You are banned from this channel. Wait for the ban to be removed.', {
          banReason: userStatus.banReason,
          banExpiresAt: userStatus.banExpiresAt,
          bannedBy: userStatus.bannedBy
        }));
      }
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
    if (userStatus && userStatus.status === 'approved') {
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

    // Check if user is a member (approved) of this channel
    const userStatus = await UserChannelStatus.findOne({ userId, channelId, status: 'approved' });
    if (!userStatus) {
      return next(new AppError('You are not a member of this channel', 403));
    }

    // Check if channel exists
    const channel = await ArenaChannel.findById(channelId);
    if (!channel) {
      return next(new AppError('Channel not found', 404));
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
    // Always use type: 'text' for user messages (not channel type)
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

/**
 * @desc    Request to join a parent channel (and all its active child channels)
 * @route   POST /api/arena/channels/:channelId/join
 * @access  Private
 */
export const joinChannelRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { channelId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return next(new AppError('Invalid channel ID', 400));
    }
    // Find parent channel
    const parentChannel = await ArenaChannel.findOne({ _id: channelId, isActive: true });
    if (!parentChannel) {
      return next(new AppError('Channel not found or inactive', 404));
    }
    // Find all active child channels
    const childChannels = await ArenaChannel.find({ parentChannelId: channelId, isActive: true });
    // Build list of all channels to join (parent + children)
    const allChannelIds = [parentChannel._id, ...childChannels.map(ch => ch._id)];
    // For each, create UserChannelStatus (status: 'pending') if not already present
    const affected: string[] = [];
    for (const chId of allChannelIds) {
      const exists = await UserChannelStatus.findOne({ userId, channelId: chId });
      if (!exists) {
        await UserChannelStatus.create({ userId, channelId: chId, status: 'pending' });
        affected.push(String(chId));
      }
    }
    res.status(201).json(new ApiResponse(201, 'Join request(s) submitted', { affected }));
  }
); 

/**
 * @desc    Get all pending join requests, grouped by user
 * @route   GET /api/arena/channels/join-requests
 * @access  Private (Admin/Moderator)
 */
export const getAllJoinRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Only isActive: true channels
  const pending = await UserChannelStatus.find({ status: 'pending' })
    .populate('userId', 'username fullName')
    .populate('channelId', 'name isActive');
  // Group by user
  const grouped: Record<string, { username: string, fullName: string, requests: { channelId: string, channelName: string }[] }> = {};
  for (const req of pending) {
    if (!req.channelId || !(req.channelId as any).isActive) continue;
    const user = req.userId as any;
    if (!grouped[user._id]) {
      grouped[user._id] = { username: user.username, fullName: user.fullName, requests: [] };
    }
    grouped[user._id].requests.push({ channelId: String(req.channelId._id), channelName: (req.channelId as any).name });
  }
  res.status(200).json(new ApiResponse(200, 'Pending join requests', grouped));
});

/**
 * @desc    Accept a single join request
 * @route   POST /api/arena/channels/join-requests/:userId/:channelId/accept
 * @access  Private (Admin/Moderator)
 */
export const acceptJoinRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, channelId } = req.params;
  const status = await UserChannelStatus.findOneAndUpdate(
    { userId, channelId, status: 'pending' },
    { status: 'approved' },
    { new: true }
  );
  if (!status) return next(new AppError('Request not found', 404));
  res.status(200).json(new ApiResponse(200, 'Join request approved', status));
});

/**
 * @desc    Reject a single join request
 * @route   POST /api/arena/channels/join-requests/:userId/:channelId/reject
 * @access  Private (Admin/Moderator)
 */
export const rejectJoinRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, channelId } = req.params;
  const status = await UserChannelStatus.findOneAndUpdate(
    { userId, channelId, status: 'pending' },
    { status: 'denied' },
    { new: true }
  );
  if (!status) return next(new AppError('Request not found', 404));
  res.status(200).json(new ApiResponse(200, 'Join request denied', status));
});

/**
 * @desc    Accept all pending join requests for a user
 * @route   POST /api/arena/channels/join-requests/:userId/accept-all
 * @access  Private (Admin/Moderator)
 */
export const acceptAllJoinRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const result = await UserChannelStatus.updateMany(
    { userId, status: 'pending' },
    { status: 'approved' }
  );
  res.status(200).json(new ApiResponse(200, 'All join requests approved', result));
});

/**
 * @desc    Reject all pending join requests for a user
 * @route   POST /api/arena/channels/join-requests/:userId/reject-all
 * @access  Private (Admin/Moderator)
 */
export const rejectAllJoinRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const result = await UserChannelStatus.updateMany(
    { userId, status: 'pending' },
    { status: 'denied' }
  );
  res.status(200).json(new ApiResponse(200, 'All join requests denied', result));
}); 

/**
 * @desc    Get all channel membership statuses for the current user
 * @route   GET /api/arena/user-channel-status
 * @access  Private
 */
export const getUserChannelStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    // Find all UserChannelStatus for this user
    const statuses = await UserChannelStatus.find({ userId })
      .populate('channelId', 'isActive name type');
    // Only include channels where isActive: true
    const filtered = statuses.filter(s => s.channelId && (s.channelId as any).isActive);
    // Return array of { channelId, status, name, type }
    const result = filtered.map(s => ({
      userId: s.userId, // include userId for frontend filtering
      channelId: s.channelId._id,
      status: s.status,
      name: (s.channelId as any).name,
      type: (s.channelId as any).type
    }));
    res.status(200).json({ data: result });
  }
); 

/**
 * @desc    Admin: Get all channel membership statuses for any user
 * @route   GET /api/arena/channels/user-channel-status/:userId
 * @access  Admin/Mod only
 */
export const getUserChannelStatusForAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (!userId) {
      return next(new AppError('Missing userId', 400));
    }
    // Find all UserChannelStatus for this user
    const statuses = await UserChannelStatus.find({ userId })
      .populate('channelId', 'isActive name type');
    // Only include channels where isActive: true
    const filtered = statuses.filter(s => s.channelId && (s.channelId as any).isActive);
    // Return array of { userId, channelId, status, name, type }
    const result = filtered.map(s => ({
      userId: s.userId,
      channelId: s.channelId._id,
      status: s.status,
      name: (s.channelId as any).name,
      type: (s.channelId as any).type
    }));
    res.status(200).json({ data: result });
  }
);

/**
 * @desc    Ban or kick a user from a parent channel and all its children
 * @route   POST /api/arena/channels/:parentChannelId/ban
 * @access  Admin/Mod only
 */
export const banOrKickUserFromParentChannel = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { parentChannelId } = req.params;
    const { userId, duration, reason } = req.body;
    const adminId = req.user._id;
    if (!userId || !parentChannelId || !duration) {
      return next(new AppError('Missing required fields', 400));
    }

    // Validate parent channel
    const parentChannel = await ArenaChannel.findById(parentChannelId);
    if (!parentChannel || parentChannel.parentChannelId) {
      return next(new AppError('Parent channel not found', 404));
    }

    // Fetch all child channels
    const childChannels = await ArenaChannel.find({ parentChannelId: parentChannel._id });
    const allChannelIds = [parentChannel._id, ...childChannels.map(ch => ch._id)];

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const now = new Date();
      let banExpiresAt = null;
      if (duration !== 'kick') {
        const days = parseInt(duration, 10);
        if (isNaN(days) || days < 1) {
          throw new AppError('Invalid ban duration', 400);
        }
        banExpiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }
      for (const channelId of allChannelIds) {
        let statusDoc = await UserChannelStatus.findOne({ userId, channelId }).session(session);
        if (!statusDoc) {
          statusDoc = new UserChannelStatus({ userId, channelId });
        }
        if (duration === 'kick') {
          statusDoc.isKicked = true;
          statusDoc.kickedAt = now;
          statusDoc.kickedBy = adminId;
          statusDoc.status = 'kicked';
          // Clear ban fields
          statusDoc.isBanned = false;
          statusDoc.banExpiresAt = undefined;
          statusDoc.banReason = undefined;
          statusDoc.bannedBy = undefined;
        } else {
          statusDoc.isBanned = true;
          statusDoc.banExpiresAt = banExpiresAt || undefined;
          statusDoc.banReason = reason || null;
          statusDoc.bannedBy = adminId;
          statusDoc.status = 'banned';
          // Clear kick fields
          statusDoc.isKicked = false;
          statusDoc.kickedAt = undefined;
          statusDoc.kickedBy = undefined;
        }
        await statusDoc.save({ session });
      }
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(new ApiResponse(200, `User ${duration === 'kick' ? 'kicked' : 'banned'} from parent and child channels`, { userId, parentChannelId, affectedChannels: allChannelIds }));
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return next(err);
    }
  }
); 

/**
 * @desc    Unban a user from a parent channel and all its children
 * @route   POST /api/arena/channels/:parentChannelId/unban
 * @access  Admin/Mod only
 */
export const unbanUserFromParentChannel = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { parentChannelId } = req.params;
    const { userId } = req.body;
    if (!userId || !parentChannelId) {
      return next(new AppError('Missing required fields', 400));
    }

    // Validate parent channel
    const parentChannel = await ArenaChannel.findById(parentChannelId);
    if (!parentChannel || parentChannel.parentChannelId) {
      return next(new AppError('Parent channel not found', 404));
    }

    // Fetch all child channels
    const childChannels = await ArenaChannel.find({ parentChannelId: parentChannel._id });
    const allChannelIds = [parentChannel._id, ...childChannels.map(ch => ch._id)];

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      for (const channelId of allChannelIds) {
        let statusDoc = await UserChannelStatus.findOne({ userId, channelId }).session(session);
        if (statusDoc) {
          statusDoc.isBanned = false;
          statusDoc.banExpiresAt = undefined;
          statusDoc.banReason = undefined;
          statusDoc.bannedBy = undefined;
          statusDoc.isKicked = false;
          statusDoc.kickedAt = undefined;
          statusDoc.kickedBy = undefined;
          statusDoc.status = 'approved';
          await statusDoc.save({ session });
        }
      }
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(new ApiResponse(200, `User unbanned from parent and child channels`, { userId, parentChannelId, affectedChannels: allChannelIds }));
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return next(err);
    }
  }
); 