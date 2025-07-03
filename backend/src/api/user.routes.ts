import { Router } from 'express';
import { getCurrentUser, updateCurrentUser, handleClerkWebhook } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/webhooks/clerk', handleClerkWebhook);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.patch('/me', protect, updateCurrentUser);

export default router; 