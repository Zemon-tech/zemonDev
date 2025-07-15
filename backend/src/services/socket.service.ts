import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { authenticateSocket } from '../middleware/socketAuth.middleware';
import { socketRateLimit } from '../middleware/socketRateLimit.middleware';
import { ArenaMessage, ArenaChannel, UserChannelStatus } from '../models';
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
    io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
  socket.on('leave_channel', (channelId: string) => {
    try {
      // Validate input
      if (!channelId || typeof channelId !== 'string') {
        return;
      }
      
      socket.leave(`channel:${channelId}`);
      logger.info(`User left channel:`, {
        userId,
        channelId,
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
    // Apply rate limiting
    socketRateLimit(socket, 'send_message', async () => {
      try {
        // Validate input first
        if (!messageData || typeof messageData !== 'object') {
          const error = 'Invalid message data';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }
        
        const { channelId, content, replyToId } = messageData;
        
        if (!userId) {
          const error = 'Unauthorized';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }

        if (!channelId || !content) {
          const error = 'Channel ID and content are required';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }

        // Check if channel exists
        const channel = await ArenaChannel.findById(channelId);
        if (!channel) {
          const error = 'Channel not found';
          socket.emit('error', { message: error });
          return callback?.({ success: false, message: error });
        }

        // Check if user can post in this channel
        if (!channel.permissions.canMessage) {
          const error = 'You do not have permission to post in this channel';
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

        // Get user's name (in a real app, fetch from database)
        const username = messageData.username || 'Anonymous';

        // Create message
        const message = await ArenaMessage.create({
          channelId,
          userId,
          username,
          content,
          replyToId: replyToId || null,
          mentions: messageData.mentions || [],
          timestamp: new Date(),
          type: 'text'
        });

        // Populate user info
        const populatedMessage = await ArenaMessage.findById(message._id)
          .populate('userId', 'fullName')
          .populate('replyToId');

        // Update user's last read timestamp
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
        io.to(`channel:${channelId}`).emit('new_message', populatedMessage);
        
        // Send success response to sender
        callback?.({ success: true, message: populatedMessage });
        
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

  // Handle typing indicator with rate limiting
  socket.on('typing', (data: { channelId: string, isTyping: boolean }) => {
    // Apply rate limiting for typing events
    socketRateLimit(socket, 'typing', () => {
      try {
        if (!userId || !data || !data.channelId) return;
        
        // Broadcast to channel that user is typing
        socket.to(`channel:${data.channelId}`).emit('user_typing', {
          userId,
          isTyping: data.isTyping
        });
      } catch (error) {
        logger.error('Error processing typing indicator:', {
          userId,
          data,
          socketId: socket.id,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected:`, {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
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
    io.to(`user:${userId}`).emit(event, data);
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