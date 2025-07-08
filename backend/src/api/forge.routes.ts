import { Router } from 'express';
import { 
  getAllResources, 
  getResourceById, 
  bookmarkResource,
  reviewResource,
  incrementResourceView
} from '../controllers/forge.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Public routes with rate limiting and caching
router.get('/', standardLimiter, cacheMiddleware(600), getAllResources); // Cache for 10 minutes
router.get('/:id', standardLimiter, cacheMiddleware(300), getResourceById); // Cache for 5 minutes

// Protected routes
router.post('/:id/view', protect, incrementResourceView);
router.post('/:id/bookmark', protect, bookmarkResource);
router.post('/:id/review', protect, reviewResource);

export default router; 