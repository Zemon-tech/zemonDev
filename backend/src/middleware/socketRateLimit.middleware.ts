import { Socket } from 'socket.io';
import { createClient } from 'redis';
import { connectRedis } from '../config/redis';

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Error connecting to Redis for rate limiting:', error);
  }
})();

// Rate limit settings
const RATE_LIMIT_WINDOW = 60; // 60 seconds
const MAX_MESSAGES_PER_WINDOW = 30; // 30 messages per minute

/**
 * Rate limit middleware for Socket.IO connections
 * Limits the number of messages a user can send in a given time window
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
    const count = await redisClient.get(key);
    const currentCount = count ? parseInt(count, 10) : 0;
    
    // Check if user has exceeded rate limit
    if (currentCount >= MAX_MESSAGES_PER_WINDOW) {
      socket.emit('error', { 
        message: 'Rate limit exceeded. Please try again later.',
        event 
      });
      return;
    }
    
    // Increment count and set expiry if it doesn't exist
    if (currentCount === 0) {
      await redisClient.set(key, '1', { EX: RATE_LIMIT_WINDOW });
    } else {
      await redisClient.incr(key);
    }
    
    next();
  } catch (error) {
    console.error('Error in socket rate limiting:', error);
    next(); // Continue even if rate limiting fails
  }
}; 