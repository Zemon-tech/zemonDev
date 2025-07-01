import rateLimit from 'express-rate-limit';
import { redisClient } from '../config/database.js';
import logger from '../utils/logger.js';

// Create a Redis store for rate limiting
const RedisStore = {
  incr: async (key) => {
    try {
      const result = await redisClient
        .multi()
        .incr(key)
        .expire(key, Math.floor(process.env.RATE_LIMIT_WINDOW_MS / 1000))
        .exec();
      return result[0][1];
    } catch (err) {
      logger.error('Redis rate limit error:', err);
      return 1; // Fallback to allowing the request
    }
  },
  decrement: async (key) => {
    try {
      await redisClient.decrby(key, 1);
    } catch (err) {
      logger.error('Redis rate limit decrement error:', err);
    }
  },
};

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisStore,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },
});

// Stricter rate limiter for AI endpoints
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisStore,
  handler: (req, res) => {
    logger.warn(`AI rate limit exceeded for user: ${req.auth?.userId}`);
    res.status(429).json({
      error: 'AI request limit exceeded. Please wait before making more requests.',
    });
  },
});

// Webhook rate limiter
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: RedisStore,
  handler: (req, res) => {
    logger.warn('Webhook rate limit exceeded');
    res.status(429).json({
      error: 'Too many webhook requests.',
    });
  },
}); 