import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { authenticateSocket } from '../middleware/socketAuth.middleware';
import { socketRateLimit } from '../middleware/socketRateLimit.middleware';
import { ArenaMessage, ArenaChannel, UserChannelStatus } from '../models';
import User from '../models/user.model'; // Add this import
import mongoose from 'mongoose';
import logger from '../utils/logger';

let io: SocketIOServer;

/**
 * Initialize Socket.IO server
 * @param server HTTP server instance
 * @returns Socket.IO server instance
 */
export const initializeSocketIO = (server: HttpServer) => {
  try {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:5175', 'https://quild.vercel.app'
    ];

    io = new SocketIOServer(server, {
      cors: {
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
    });

    // Use authentication middleware
    io.use(authenticateSocket);

    // Handle connections
    io.on('connection', handleConnection);

    logger.info('Socket.IO initialized successfully');
    return io;
  } catch (error) {
    logger.error('Socket.IO initialization error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Handle new socket connections
 * @param socket Socket instance
 */
const handleConnection = (socket: any) => {
  const userId = socket.data.user?.userId;
  logger.info(`User connected to socket:`, {
    userId,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Join user to their private room for direct messages
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Handle joining a channel
  socket.on('join_channel', async (channelId: string) => {
    try {
      // Validate input
      if (!channelId || typeof channelId !== 'string') {
        socket.emit('error', { message: 'Invalid channel ID' });
        return;
      }

      // Check if channel exists
      const channel = await ArenaChannel.findById(channelId);
      if (!channel) {
        socket.emit('error', { message: 'Channel not found' });
        return;
      }

      // Check if user is a member (approved) of this channel
      if (userId) {
        const approvedStatus = await UserChannelStatus.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          channelId: new mongoose.Types.ObjectId(channelId),
          status: 'approved'
        });
        if (!approvedStatus) {
          socket.emit('error', { message: 'You are not a member of this channel' });
          return;
        }
      }

      // Check if user is banned from this channel
      if (userId) {
        const userStatus = await UserChannelStatus.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          channelId: new mongoose.Types.ObjectId(channelId),
          isBanned: true,
          banExpiresAt: { $gt: new Date() }
        });

        if (userStatus) {
          socket.emit('error', { 
            message: 'You are banned from this channel',
            banExpiresAt: userStatus.banExpiresAt
          });
          return;
        }
      }

      // Join the channel room
      socket.join(`channel:${channelId}`);
      logger.info(`User joined channel:`, {
        userId,
        channelId,
        channelName: channel.name,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      
      socket.emit('channel_joined', { channelId });
    } catch (error) {
      logger.error('Error joining channel:', {
        userId,
        channelId,
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      socket.emit('error', { message: 'Failed to join channel' });
    }
  });

  // Handle leaving a channel
  socket.on('leave_channel', async (channelId: string) => {
    try {
      // Validate input
      if (!channelId || typeof channelId !== 'string') {
        return;
      }
      // Fetch channel name for logging
      let channelName = undefined;
      try {
        const channel = await ArenaChannel.findById(channelId);
        if (channel) channelName = channel.name;
      } catch {}
      socket.leave(`channel:${channelId}`);
      logger.info(`User left channel:`, {
        userId,
        channelId,
        channelName,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error leaving channel:', {
        userId,
        channelId,
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle sending a message with rate limiting
  socket.on('send_message', async (messageData: any, callback: Function = () => {}) => {
    // Log the incoming message attempt
    logger.info('Message send attempt:', {
      userId,
      socketId: socket.id,
      messageData: JSON.stringify(messageData),
      timestamp: new Date().toISOString()
    });
    
    // Apply rate limiting
    socketRateLimit(socket, 'send_message', async () => {
      try {
        // Validate input first
        if (!messageData || typeof messageData !== 'object') {
          const error = 'Invalid message data';
          logger.error('Message validation error:', { error, messageData: JSON.stringify(messageData) });
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }
        
        const { channelId, content, replyToId } = messageData;
        logger.info('Message data extracted:', { channelId, contentLength: content?.length, replyToId });
        
        if (!userId) {
          const error = 'Unauthorized';
          logger.error('Message unauthorized error:', { error, socketId: socket.id });
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }

        if (!channelId || !content) {
          const error = 'Channel ID and content are required';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }

        // Check if channel exists
        logger.info('Finding channel:', { channelId });
        const channel = await ArenaChannel.findById(channelId);
        if (!channel) {
          const error = 'Channel not found';
          logger.error('Channel not found error:', { error, channelId });
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }
        logger.info('Channel found:', { channelId, channelName: channel.name });

        // Check if user is a member (approved) of this channel
        const approvedStatus = await UserChannelStatus.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          channelId: new mongoose.Types.ObjectId(channelId),
          status: 'approved'
        });
        if (!approvedStatus) {
          const error = 'You are not a member of this channel';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }

        // Check if user is banned from this channel
        const userStatus = await UserChannelStatus.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          channelId: new mongoose.Types.ObjectId(channelId),
          isBanned: true,
          banExpiresAt: { $gt: new Date() }
        });

        if (userStatus) {
          const error = 'You are banned from this channel';
          socket.emit('error', { 
            message: error,
            banExpiresAt: userStatus.banExpiresAt
          });
          return callback?.({ success: false, message: error });
        }

        // Check role-based permissions for announcement channels
        if (channel.type === 'announcement') {
          const { hasAnyRole } = await import('../utils/roleUtils');
          const hasPermission = await hasAnyRole(userId, channelId, ['admin', 'moderator']);
          
          if (!hasPermission) {
            const error = 'Only admins and moderators can send messages in announcement channels';
            logger.info('Role check failed for announcement channel:', { 
              userId, 
              channelId, 
              channelType: channel.type 
            });
            socket.emit('error', { message: error });
            return callback?.({ success: false, message: error });
          }
          
          logger.info('Role check passed for announcement channel:', { 
            userId, 
            channelId, 
            channelType: channel.type 
          });
        }

        // Get user's username (Clerk username) from database
        let username = 'Anonymous';
        try {
          const user = await User.findById(userId);
          if (user && user.username) {
            username = user.username;
          }
        } catch (e) {
          // fallback to Anonymous if lookup fails
        }

        // Create message
        logger.info('Creating message:', { channelId, userId, contentLength: content?.length });
        let message;
        try {
            // Always use type: 'text' for user messages (not channel type)
            message = await ArenaMessage.create({
              channelId,
              userId,
              username,
              content,
              replyToId: replyToId || null,
              mentions: messageData.mentions || [],
              timestamp: new Date(),
              type: 'text'
            });
          logger.info('Message created successfully:', { messageId: message._id });

          // Populate user info
          logger.info('Populating message with user info:', { messageId: message._id });
          message = await ArenaMessage.findById(message._id)
            .populate('userId', 'fullName')
            .populate('replyToId');
          
          if (!message) {
            logger.error('Failed to populate message');
            const error = 'Failed to process message';
            socket.emit('error', { message: error });
            return callback?.({ success: false, message: error });
          }

          // Update user's last read timestamp
          logger.info('Updating user\'s last read timestamp:', { userId, channelId });
          await UserChannelStatus.findOneAndUpdate(
            { 
              userId: new mongoose.Types.ObjectId(userId),
              channelId: new mongoose.Types.ObjectId(channelId)
            },
            { 
              lastReadTimestamp: new Date(),
              lastReadMessageId: message._id
            },
            { upsert: true }
          );

          // Broadcast to channel
          logger.info('Broadcasting message to channel:', { channelId, messageId: message?._id });
          io.to(`channel:${channelId}`).emit('new_message', message);
          logger.info('Message broadcast completed');
        } catch (createError) {
          logger.error('Error creating message:', { 
            error: createError instanceof Error ? createError.message : String(createError),
            stack: createError instanceof Error ? createError.stack : undefined
          });
          const error = 'Failed to create message';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }
        
        // Get all users in the channel and update their unread counts
        // This is done asynchronously to not block the response
        try {
          // Find all users who have interacted with this channel
          const channelUsers = await UserChannelStatus.find({ 
            channelId: new mongoose.Types.ObjectId(channelId)
          }).distinct('userId');
          
          // Update unread counts for each user except the sender
          channelUsers.forEach(async (userIdObj) => {
            const userIdStr = userIdObj.toString();
            if (userIdStr !== userId) {
              try {
                await updateUnreadCounts(userIdStr);
              } catch (error) {
                logger.error('Failed to update unread counts for user:', {
                  userId: userIdStr,
                  channelId,
                  error: error instanceof Error ? error.message : String(error)
                });
              }
            }
          });
        } catch (error) {
          logger.error('Failed to get channel users:', {
            channelId,
            error: error instanceof Error ? error.message : String(error)
          });
        }

        // Send success response to sender
        logger.info('Sending success response to sender:', { messageId: message._id });
        callback?.({ success: true, message: message });
        
        logger.info('Message sent:', {
          userId,
          channelId,
          messageId: message._id,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Error sending message:', {
          userId,
          messageData,
          socketId: socket.id,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        const errorMessage = 'Failed to send message';
        socket.emit('error', { message: errorMessage });
        callback?.({ success: false, message: errorMessage });
      }
    });
  });

  // Handle message read status updates
  socket.on('read_status', async (data: any) => {
    try {
      // Validate input
      if (!data || !data.channelId) {
        socket.emit('error', { message: 'Invalid data' });
        return;
      }

      const { channelId } = data;
      
      if (!userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Get the latest message in the channel
      const latestMessage = await ArenaMessage.findOne({ channelId })
        .sort({ timestamp: -1 })
        .limit(1);

      // Update user's last read timestamp and message ID
      await UserChannelStatus.findOneAndUpdate(
        { 
          userId: new mongoose.Types.ObjectId(userId),
          channelId: new mongoose.Types.ObjectId(channelId)
        },
        { 
          lastReadTimestamp: new Date(),
          lastReadMessageId: latestMessage?._id
        },
        { upsert: true }
      );

      // Emit event to confirm read status update
      socket.emit('read_status_updated', { 
        channelId,
        lastReadTimestamp: new Date()
      });

      logger.info('Read status updated:', {
        userId,
        channelId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error updating read status:', {
        userId,
        data,
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      socket.emit('error', { message: 'Failed to update read status' });
    }
  });

  // Handle typing indicator with rate limiting
  socket.on('typing', (data: { channelId: string, isTyping: boolean }) => {
    // TEMP: Bypass rate limiter for debugging
    (async () => {
      try {
        if (!userId || !data || !data.channelId) return;
        
        // Fetch username from DB
        let username = 'Anonymous';
        try {
          const user = await User.findById(userId);
          if (user && user.username) {
            username = user.username;
          } else if (socket.data.user && socket.data.user.username) {
            username = socket.data.user.username;
          }
        } catch (e) {
          if (socket.data.user && socket.data.user.username) {
            username = socket.data.user.username;
          }
        }

        if (username === 'Anonymous') {
        }

        // Broadcast to channel that user is typing (to all users, including sender)
        if (!io) return;
        const payload = {
          userId,
          username, // Include username
          isTyping: data.isTyping
        };
        io.to(`channel:${data.channelId}`).emit('user_typing', payload);
      } catch (error) {
        logger.error('Error processing typing indicator:', {
          userId,
          data,
          socketId: socket.id,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    })();
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected:`, {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle role change notifications
  socket.on('role_updated', (data: { userId: string; channelId?: string; role: string }) => {
    try {
      logger.info('Role updated notification:', {
        userId: data.userId,
        channelId: data.channelId,
        role: data.role,
        timestamp: new Date().toISOString()
      });

      // Notify the user about their role change
      emitToUser(data.userId, 'role_updated', {
        channelId: data.channelId,
        role: data.role,
        timestamp: new Date().toISOString()
      });

      // If it's a channel-specific role, also notify channel members
      if (data.channelId) {
        emitToChannel(data.channelId, 'user_role_updated', {
          userId: data.userId,
          role: data.role,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Error handling role update notification:', {
        error: error instanceof Error ? error.message : String(error),
        data,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle channel permissions updates
  socket.on('channel_permissions_updated', (data: { channelId: string; permissions: any }) => {
    try {
      logger.info('Channel permissions updated notification:', {
        channelId: data.channelId,
        permissions: data.permissions,
        timestamp: new Date().toISOString()
      });

      // Notify all channel members about permission changes
      emitToChannel(data.channelId, 'channel_permissions_updated', {
        channelId: data.channelId,
        permissions: data.permissions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error handling channel permissions update notification:', {
        error: error instanceof Error ? error.message : String(error),
        data,
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * Get Socket.IO instance
 * @returns Socket.IO server instance
 * @throws Error if Socket.IO is not initialized
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit event to all connected clients in a channel
 * @param channelId Channel ID
 * @param event Event name
 * @param data Event data
 * @throws Error if Socket.IO is not initialized
 */
export const emitToChannel = (channelId: string, event: string, data: any) => {
  try {
    if (!io) {
      throw new Error('Socket.IO not initialized');
    }
    io.to(`channel:${channelId}`).emit(event, data);
  } catch (error) {
    logger.error('Error emitting to channel:', {
      channelId,
      event,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Emit event to a specific user
 * @param userId User ID
 * @param event Event name
 * @param data Event data
 * @throws Error if Socket.IO is not initialized
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  try {
    if (!io) {
      throw new Error('Socket.IO not initialized');
    }
    const roomName = `user:${userId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const roomSize = room ? room.size : 0;
    logger.info('Emitting to user room', {
      room: roomName,
      event,
      roomSize,
      timestamp: new Date().toISOString()
    });
    io.to(roomName).emit(event, data);

    // Fallback: if room appears empty, emit directly to matching sockets (debug aid)
    if (!roomSize) {
      let directEmits = 0;
      for (const [socketId, s] of io.sockets.sockets) {
        const sUserId = (s as any).data?.user?.userId;
        if (sUserId === userId) {
          s.emit(event, data);
          directEmits += 1;
        }
      }
      if (directEmits > 0) {
        logger.info('Fallback direct emit used', { userId, event, directEmits });
      }
    }
  } catch (error) {
    logger.error('Error emitting to user:', {
      userId,
      event,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}; 

/**
 * Update unread counts for a user
 * @param userId User ID
 * @throws Error if Socket.IO is not initialized
 */
export const updateUnreadCounts = async (userId: string) => {
  try {
    if (!io) {
      throw new Error('Socket.IO not initialized');
    }

    // Get all active channels
    const channels = await ArenaChannel.find({ isActive: true });
    
    // Get user's status for all channels
    const userStatuses = await UserChannelStatus.find({ 
      userId: new mongoose.Types.ObjectId(userId)
    });
    
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
        userId: { $ne: new mongoose.Types.ObjectId(userId) } // Don't count user's own messages
      });

      return {
        channelId,
        unreadCount
      };
    });

    const unreadCounts = await Promise.all(unreadCountPromises);

    // Emit unread counts to the user
    io.to(`user:${userId}`).emit('unread_counts_updated', { unreadCounts });

    logger.info('Unread counts updated for user:', {
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating unread counts:', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}; 