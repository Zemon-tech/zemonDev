import { Router } from 'express';
import { 
  banUser,
  kickUser,
  makeModerator
} from '../controllers/arenaUsers.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Ban user from channel
router.post('/:userId/ban', standardLimiter, protect, banUser);

// Kick user from channel
router.post('/:userId/kick', standardLimiter, protect, kickUser);

// Make user moderator
router.post('/:userId/make-moderator', standardLimiter, protect, makeModerator);

export default router; 