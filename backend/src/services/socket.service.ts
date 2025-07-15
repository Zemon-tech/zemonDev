import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { authenticateSocket } from '../middleware/socketAuth.middleware';
import { socketRateLimit } from '../middleware/socketRateLimit.middleware';
import { ArenaMessage, ArenaChannel, UserChannelStatus } from '../models';
import mongoose from 'mongoose';

let io: SocketIOServer;

/**
 * Initialize Socket.IO server
 * @param server HTTP server instance
 */
export const initializeSocketIO = (server: HttpServer) => {
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

  console.log('Socket.IO initialized');
  return io;
};

/**
 * Handle new socket connections
 * @param socket Socket instance
 */
const handleConnection = (socket: any) => {
  const userId = socket.data.user?.userId;
  console.log(`User connected: ${userId} (${socket.id})`);

  // Join user to their private room for direct messages
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Handle joining a channel
  socket.on('join_channel', async (channelId: string) => {
    try {
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
      console.log(`User ${userId} joined channel ${channelId}`);
      
      socket.emit('channel_joined', { channelId });
    } catch (error) {
      console.error('Error joining channel:', error);
      socket.emit('error', { message: 'Failed to join channel' });
    }
  });

  // Handle leaving a channel
  socket.on('leave_channel', (channelId: string) => {
    socket.leave(`channel:${channelId}`);
    console.log(`User ${userId} left channel ${channelId}`);
  });

  // Handle sending a message with rate limiting
  socket.on('send_message', async (messageData: any, callback: Function) => {
    // Apply rate limiting
    socketRateLimit(socket, 'send_message', async () => {
      try {
        const { channelId, content, replyToId } = messageData;
        
        if (!userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return callback({ success: false, message: 'Unauthorized' });
        }

        if (!channelId || !content) {
          socket.emit('error', { message: 'Channel ID and content are required' });
          return callback({ success: false, message: 'Channel ID and content are required' });
        }

        // Check if channel exists
        const channel = await ArenaChannel.findById(channelId);
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' });
          return callback({ success: false, message: 'Channel not found' });
        }

        // Check if user can post in this channel
        if (!channel.permissions.canMessage) {
          socket.emit('error', { message: 'You do not have permission to post in this channel' });
          return callback({ success: false, message: 'You do not have permission to post in this channel' });
        }

        // Check if user is banned from this channel
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
          return callback({ success: false, message: 'You are banned from this channel' });
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
        callback({ success: true, message: populatedMessage });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
        callback({ success: false, message: 'Failed to send message' });
      }
    });
  });

  // Handle typing indicator with rate limiting
  socket.on('typing', (data: { channelId: string, isTyping: boolean }) => {
    // Apply rate limiting for typing events
    socketRateLimit(socket, 'typing', () => {
      if (!userId || !data.channelId) return;
      
      // Broadcast to channel that user is typing
      socket.to(`channel:${data.channelId}`).emit('user_typing', {
        userId,
        isTyping: data.isTyping
      });
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId} (${socket.id})`);
  });
};

/**
 * Get Socket.IO instance
 * @returns Socket.IO server instance
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
 */
export const emitToChannel = (channelId: string, event: string, data: any) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  io.to(`channel:${channelId}`).emit(event, data);
};

/**
 * Emit event to a specific user
 * @param userId User ID
 * @param event Event name
 * @param data Event data
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  io.to(`user:${userId}`).emit(event, data);
}; 