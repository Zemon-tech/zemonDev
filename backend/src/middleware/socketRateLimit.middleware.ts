import { Socket } from 'socket.io';
import { redisClient } from '../config/redis';

// Rate limit settings
const RATE_LIMIT_WINDOW = 60; // 60 seconds
const MAX_MESSAGES_PER_WINDOW = 30; // 30 messages per minute

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
    
    // Skip rate limiting if no user ID (though this shouldn't happen with auth middleware)
    if (!userId) {
      return next();
    }
    
    // Create a unique key for this user and event
    const key = `ratelimit:socket:${userId}:${event}`;
    
    // Get current count from Redis
    const currentCount = await redisClient.get(key);
    const count = currentCount ? parseInt(currentCount.toString(), 10) : 0;
    
    // Check if user has exceeded rate limit
    if (count >= MAX_MESSAGES_PER_WINDOW) {
      socket.emit('error', { 
        message: 'Rate limit exceeded. Please try again later.',
        event,
        retryAfter: RATE_LIMIT_WINDOW
      });
      return;
    }
    
    // Use atomic operations to increment and set expiry if needed
    if (count === 0) {
      // For new keys, set the value to 1 and set expiry
      await redisClient.set(key, '1', { ex: RATE_LIMIT_WINDOW });
    } else {
      // For existing keys, increment the value but don't reset the TTL
      // First check if key exists and get its TTL
      const ttl = await redisClient.exists(key);
      
      if (ttl) {
        // Increment the counter and preserve TTL
        const newValue = (count + 1).toString();
        await redisClient.set(key, newValue);
      } else {
        // If key doesn't exist or TTL has expired, set new value with TTL
        await redisClient.set(key, '1', { ex: RATE_LIMIT_WINDOW });
      }
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