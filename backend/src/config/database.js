import mongoose from 'mongoose';
import Redis from 'ioredis';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

// MongoDB Connection
export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Redis Client for Caching
export const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Redis connection failed');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

// Redis Client for Socket.IO (separate instance)
export const socketRedis = createClient({
  url: process.env.REDIS_URL,
});

socketRedis.on('error', (err) => {
  logger.error('Socket.IO Redis Client Error:', err);
});

// Export a function to close all connections
export const closeConnections = async () => {
  try {
    await mongoose.connection.close();
    await redisClient.quit();
    await socketRedis.quit();
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    process.exit(1);
  }
}; 