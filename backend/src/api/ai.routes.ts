import { Router } from 'express';
import { 
  askAI,
  analyzeUserSolution,
  generateProblemHints
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';
import { aiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Protected routes with strict rate limiting
router.post('/ask', protect, aiLimiter, askAI);
router.post('/analyze-solution', protect, aiLimiter, analyzeUserSolution);
router.post('/generate-hints', protect, aiLimiter, generateProblemHints);

export default router; 