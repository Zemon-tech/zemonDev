import rateLimit from 'express-rate-limit';
import { redisClient } from '../config/redis';
import env from '../config/env';

/**
 * Create a rate limiter using Express Rate Limit
 * 
 * @param options Custom rate limit options
 * @returns Rate limiter middleware
 */
const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  keyGenerator?: (req: any) => string;
}) => {
  // Default options
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Don't use deprecated headers
    message: 'Too many requests, please try again later',
  };

  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };

  return rateLimit(mergedOptions);
};

// Check if we're in development mode
const isDevelopment = env.NODE_ENV === 'development';

// Development rate limiter - very high limits for local development
export const devLimiter = createRateLimiter({
  max: 1000, // Very high limit for development
  windowMs: 1 * 60 * 1000, // 1 minute window
});

// Standard rate limiter - increased to 500 requests per 15 minutes for development
export const standardLimiter = isDevelopment 
  ? devLimiter // Use dev limiter in development
  : createRateLimiter({
      max: 500,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

// Strict rate limiter for sensitive operations
export const strictLimiter = isDevelopment
  ? devLimiter // Use dev limiter in development
  : createRateLimiter({
      max: 30,
      message: 'Too many attempts, please try again after 15 minutes',
    });

// Very strict limiter for auth endpoints
export const authLimiter = isDevelopment
  ? devLimiter // Use dev limiter in development
  : createRateLimiter({
      max: 10,
      message: 'Too many authentication attempts, please try again after 15 minutes',
    });

// AI endpoints limiter
export const aiLimiter = isDevelopment
  ? devLimiter // Use dev limiter in development
  : createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 5,
      message: 'Too many AI requests, please try again after 1 minute',
    });

// Feedback submission limiter - 5 submissions per day
export const feedbackLimiter = isDevelopment
  ? devLimiter // Use dev limiter in development
  : createRateLimiter({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours (1 day)
      max: 5,
      message: 'You can only submit 5 feedback messages per day. Please try again tomorrow.',
      keyGenerator: (req) => {
        // Use user ID from auth token as the key to track per-user limits
        return req.auth?.userId || req.ip;
      },
    }); 