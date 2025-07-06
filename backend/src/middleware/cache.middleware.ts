import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import ApiResponse from '../utils/ApiResponse';
import env from '../config/env';
import logger from '../utils/logger';

/**
 * Generate cache key from request
 */
const generateCacheKey = (req: Request): string => {
  const path = req.originalUrl || req.url;
  
  // Include user ID in cache key for personalized content
  const userId = req.user?._id ? req.user._id.toString() : 'anonymous';
  
  // Include query parameters in cache key
  return `api:${userId}:${path}`;
};

/**
 * Cache middleware for API responses
 * @param ttl Time to live in seconds
 */
export const cacheMiddleware = (ttl = 600) => { // Increased to 10 minutes
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching in development mode if CACHE_ENABLED is not true
    if (env.NODE_ENV === 'development' && process.env.CACHE_ENABLED !== 'true') {
      return next();
    }

    const key = generateCacheKey(req);

    try {
      // Try to get cached response
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        // Return cached response
        const data = JSON.parse(cachedResponse as string);
        return res.status(200).json(data);
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json method to cache the response before sending
      res.json = function (body: any) {
        // Store the response in cache
        if (res.statusCode === 200 || res.statusCode === 201) {
          redisClient.set(key, JSON.stringify(body), { ex: ttl })
            .catch(err => logger.error('Redis cache error:', err));
        }

        // Restore original method
        res.json = originalJson;
        
        // Call the original method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next(); // Continue without caching
    }
  };
};

/**
 * Clear cache for a specific pattern
 * @param pattern Cache key pattern to clear
 */
export const clearCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(`api:${pattern}*`);
    if (keys && keys.length > 0) {
      await redisClient.del(...keys);
      logger.log(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
  }
}; 