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

// Standard rate limiter - 100 requests per 15 minutes
export const standardLimiter = createRateLimiter({});

// Strict rate limiter for sensitive operations - 30 requests per 15 minutes
export const strictLimiter = createRateLimiter({
  max: 30,
  message: 'Too many attempts, please try again after 15 minutes',
});

// Very strict limiter for auth endpoints - 10 requests per 15 minutes
export const authLimiter = createRateLimiter({
  max: 10,
  message: 'Too many authentication attempts, please try again after 15 minutes',
});

// AI endpoints limiter - 5 requests per minute
export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many AI requests, please try again after 1 minute',
}); 