import express from 'express';
import { 
  getUserAnalysisHistory,
  getUserActiveDrafts,
  getPublicUserAnalysisHistory,
  getPublicUserActiveDrafts
} from '../controllers/profile.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';

const router = express.Router();

// Profile-related Crucible endpoints
router.get('/crucible/analyses', standardLimiter, protect, getUserAnalysisHistory);
router.get('/crucible/drafts', standardLimiter, protect, getUserActiveDrafts);

// Public profile crucible endpoints
router.get('/public/:username/crucible/analyses', standardLimiter, getPublicUserAnalysisHistory);
router.get('/public/:username/crucible/drafts', standardLimiter, getPublicUserActiveDrafts);

export default router; 