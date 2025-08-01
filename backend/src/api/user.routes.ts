import { Router } from 'express';
import { getCurrentUser, updateCurrentUser, handleClerkWebhook, getUserRole, updateProfileBackground } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/webhooks/clerk', handleClerkWebhook);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/me/role', protect, getUserRole);
router.patch('/me', protect, updateCurrentUser);
router.patch('/me/background', protect, updateProfileBackground);

export default router;