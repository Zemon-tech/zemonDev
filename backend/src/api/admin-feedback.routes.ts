import express from 'express';
import { getAllFeedback, updateFeedbackStatus } from '../controllers/feedback.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(isAdmin);

// Get all feedback (admin only)
router.get('/', getAllFeedback);

// Update feedback status (admin only)
router.patch('/:id', updateFeedbackStatus);

export default router;
