import { Router } from 'express';
import { 
  getAllChallenges, 
  getChallengeById, 
  submitSolution, 
  getSolutions 
} from '../controllers/crucible.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Public routes with rate limiting and caching
router.get('/', standardLimiter, cacheMiddleware(60 * 10), getAllChallenges); // Cache for 10 minutes
router.get('/:id', standardLimiter, cacheMiddleware(60 * 5), getChallengeById); // Cache for 5 minutes
router.get('/:challengeId/solutions', standardLimiter, cacheMiddleware(60 * 5), getSolutions); // Cache for 5 minutes

// Protected routes
router.post('/:challengeId/solutions', protect, submitSolution);

export default router; 