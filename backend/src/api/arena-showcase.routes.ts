import { Router } from 'express';
import { 
  getShowcasedProjects,
  submitProject,
  upvoteProject,
  removeUpvote
} from '../controllers/arenaShowcase.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Get all showcased projects
router.get('/', standardLimiter, cacheMiddleware(300), getShowcasedProjects); // Cache for 5 minutes

// Submit new project
router.post('/', standardLimiter, protect, submitProject);

// Upvote project
router.post('/:projectId/upvote', standardLimiter, protect, upvoteProject);

// Remove upvote
router.delete('/:projectId/upvote', standardLimiter, protect, removeUpvote);

export default router; 