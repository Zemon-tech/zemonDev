import express from 'express';
import { 
  getUserAnalysisHistory,
  getUserActiveDrafts
} from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';

const router = express.Router();

// Profile-related Crucible endpoints
router.get('/crucible/analyses', standardLimiter, protect, getUserAnalysisHistory);
router.get('/crucible/drafts', standardLimiter, protect, getUserActiveDrafts);

export default router; 