import { Router } from 'express';
import {
  analyzeSolution,
  generateHints
} from '../controllers/ai.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// AI analysis routes
router.post('/analyze/solution/:solutionId', requireAuth, analyzeSolution);
router.post('/generate/hints/:problemId', requireAuth, requireAdmin, generateHints);

export default router; 