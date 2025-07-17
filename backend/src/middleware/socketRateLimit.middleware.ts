import { Socket } from 'socket.io';
import { redisClient } from '../config/redis';

// Rate limit settings
const RATE_LIMIT_WINDOW = 60; // 60 seconds
const MAX_MESSAGES_PER_WINDOW = 300; // Increased to 300 messages per minute for development

/**
 * Rate limit middleware for Socket.IO connections
 * Limits the number of messages a user can send in a given time window
 * Uses atomic Redis operations to prevent race conditions
 * 
 * @param socket - Socket.IO socket instance
 * @param event - Event name being rate limited
 * @param next - Function to call when rate limiting is complete
 */
export const socketRateLimit = async (socket: Socket, event: string, next: Function) => {
  try {
    const userId = socket.data.user?.userId;
    
    console.log('Rate limiting check for:', { userId, event, socketId: socket.id });
    
    // Skip rate limiting if no user ID (though this shouldn't happen with auth middleware)
    if (!userId) {
      console.log('Skipping rate limit - no userId found');
      return next();
    }
    
    // Create a unique key for this user and event
    const key = `ratelimit:socket:${userId}:${event}`;
    
    // Use atomic INCR and set expiry if first message in window
    const count = await redisClient.incr(key);
    if (count === 1) {
      // Set expiration only when the key is first created
      await redisClient.expire(key, RATE_LIMIT_WINDOW);
    }
    console.log('Current rate limit count:', { userId, event, count, max: MAX_MESSAGES_PER_WINDOW });
    
    // Check if user has exceeded rate limit
    if (count > MAX_MESSAGES_PER_WINDOW) {
      console.log('Rate limit exceeded:', { userId, event, count });
      socket.emit('error', { 
        message: 'Rate limit exceeded. Please try again later.',
        event,
        retryAfter: RATE_LIMIT_WINDOW
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', {
      userId: socket.data.user?.userId,
      event,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    
    // Continue even if rate limiting fails to prevent blocking legitimate requests
    next();
  }
}; 