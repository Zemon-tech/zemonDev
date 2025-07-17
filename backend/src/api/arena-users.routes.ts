import { Router } from 'express';
import { 
  banUser,
  unbanUser,
  kickUser,
  makeModerator
} from '../controllers/arenaUsers.controller';
import { protect, checkRole } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Ban user from channel
router.post('/:userId/ban', standardLimiter, protect, checkRole(['admin', 'moderator'], true), banUser);

// Unban user from channel
router.post('/:userId/unban', standardLimiter, protect, checkRole(['admin', 'moderator'], true), unbanUser);

// Kick user from channel
router.post('/:userId/kick', standardLimiter, protect, checkRole(['admin', 'moderator'], true), kickUser);

// Make user moderator (admin only)
router.post('/:userId/make-moderator', standardLimiter, protect, checkRole(['admin'], true), makeModerator);

export default router; 