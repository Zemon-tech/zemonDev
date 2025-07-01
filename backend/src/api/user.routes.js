import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserProfile,
  handleClerkWebhook,
  getUserSolutions,
  getUserBookmarks,
} from '../controllers/user.controller.js';
import { requireAuth, verifyWebhookSignature } from '../middleware/auth.js';
import { validateBody } from '../utils/validation.js';
import { userProfileSchema } from '../utils/validation.js';
import { webhookLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.post('/webhook', webhookLimiter, verifyWebhookSignature, handleClerkWebhook);
router.get('/profile/:clerkId', getUserProfile);
router.get('/solutions/:clerkId', getUserSolutions);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);
router.patch('/me', requireAuth, validateBody(userProfileSchema), updateCurrentUser);
router.get('/me/bookmarks', requireAuth, getUserBookmarks);

export default router; 