import express from 'express';
import { submitFeedback, getUserFeedback } from '../controllers/feedback.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { feedbackLimiter } from '../middleware/rateLimiter.middleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Submit feedback (with rate limiting)
router.post('/', feedbackLimiter, submitFeedback);

// Get user's feedback history
router.get('/', getUserFeedback);

export default router;
