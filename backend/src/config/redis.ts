import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables directly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Access environment variables
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Log Redis configuration for debugging
console.log('Redis URL available:', REDIS_URL ? 'Yes' : 'No');
console.log('Redis Token available:', REDIS_TOKEN ? 'Yes' : 'No');

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
  console.log('Redis client initialized with direct configuration');
} else {
  // Fallback to trying fromEnv method
  try {
    redisClient = Redis.fromEnv();
    console.log('Redis client initialized with fromEnv method');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    // Create a dummy client for development so the app doesn't crash
    redisClient = new Redis({
      url: 'invalid',
      token: 'invalid'
    });
  }
}

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
      console.log('Upstash Redis Connected Successfully');
    } else {
      throw new Error('Redis connection test failed');
    }
  } catch (error) {
    console.error(`Redis Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('Please check that UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are correctly set in your .env file');
  }
};

export { redisClient, connectRedis }; 