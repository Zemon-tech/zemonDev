import { Router } from 'express';
import { 
  getCurrentHackathon,
  getHackathonLeaderboard,
  submitHackathonSolution,
  getHackathonHistory
} from '../controllers/arenaHackathons.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Get current/active hackathon
router.get('/current', standardLimiter, cacheMiddleware(300), getCurrentHackathon); // Cache for 5 minutes

// Get hackathon leaderboard
router.get('/:hackathonId/leaderboard', standardLimiter, cacheMiddleware(60), getHackathonLeaderboard); // Cache for 1 minute

// Submit hackathon solution
router.post('/:hackathonId/submit', standardLimiter, protect, submitHackathonSolution);

// Get hackathon history
router.get('/history', standardLimiter, cacheMiddleware(600), getHackathonHistory); // Cache for 10 minutes

export default router; 