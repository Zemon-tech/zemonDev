import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Load environment variables directly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Access environment variables
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Log Redis configuration for debugging
logger.info('Redis URL available:', REDIS_URL ? 'Yes' : 'No');
logger.info('Redis Token available:', REDIS_TOKEN ? 'Yes' : 'No');

/**
 * Create and configure Upstash Redis client
 */
let redisClient: Redis;

if (REDIS_URL && REDIS_TOKEN) {
  // Direct configuration with the environment variables
  redisClient = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN
  });
  logger.info('Redis client initialized with direct configuration');
} else {
  // Fallback to trying fromEnv method
  try {
    redisClient = Redis.fromEnv();
    logger.info('Redis client initialized with fromEnv method');
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
    // Create a dummy client for development so the app doesn't crash
    redisClient = new Redis({
      url: 'invalid',
      token: 'invalid'
    });
  }
}

/**
 * Enhanced Redis client with better error handling
 * This wrapper adds proper error handling and logging to Redis operations
 */
const enhancedRedisClient = {
  /**
   * Set a key with value and optional expiration
   */
  async set(key: string, value: any, options?: { ex?: number }): Promise<string | null> {
    try {
      // Always serialize value to JSON string if it's an object
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      if (options?.ex) {
        return await redisClient.set(key, serializedValue, { ex: options.ex });
      }
      return await redisClient.set(key, serializedValue);
    } catch (error) {
      logger.error(`Redis SET Error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Get a value by key
   */
  async get(key: string): Promise<any> {
    try {
      const value = await redisClient.get(key);
      
      // If no value, return null
      if (value === null) return null;
      
      // Try to parse as JSON if it looks like a JSON string
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          return JSON.parse(value);
        } catch (parseError) {
          logger.warn(`Failed to parse Redis value as JSON for key ${key}: ${value}`);
          // Return the raw value if parsing fails
          return value;
        }
      }
      
      // Return as is for non-JSON values
      return value;
    } catch (error) {
      logger.error(`Redis GET Error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    try {
      return await redisClient.del(key);
    } catch (error) {
      logger.error(`Redis DEL Error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<number> {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS Error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Set key expiration in seconds
   */
  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE Error for key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string): Promise<number> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await redisClient.del(...keys);
    } catch (error) {
      logger.error(`Redis CLEAR Error for pattern ${pattern}:`, error);
      return 0;
    }
  }
};

/**
 * Initialize Redis connection
 * @returns Promise<void>
 */
const connectRedis = async (): Promise<void> => {
  try {
    // Test connection by setting and getting a value
    await redisClient.set('connection_test', 'connected');
    const value = await redisClient.get('connection_test');
    
    if (value === 'connected') {
      logger.info('Upstash Redis Connected Successfully');
    } else {
      throw new Error('Redis connection test failed');
    }
  } catch (error) {
    logger.error(`Redis Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logger.info('Please check that UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are correctly set in your .env file');
  }
};

export { enhancedRedisClient as redisClient, connectRedis }; 