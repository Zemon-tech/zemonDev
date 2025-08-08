import { Router } from 'express';
import {
  getNirvanaFeed,
  createHackathon,
  createNews,
  createTool,
  updateReaction,
  togglePin,
  toggleVerification,
  updatePriority,
  updateItem,
  deleteItem
} from '../controllers/nirvanaFeed.controller';
import { protect, checkRole } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Get all Nirvana feed items
router.get('/feed', standardLimiter, cacheMiddleware(300), getNirvanaFeed);

// Create new items (requires authentication)
router.post('/hackathons', standardLimiter, protect, createHackathon);
router.post('/news', standardLimiter, protect, createNews);
router.post('/tools', standardLimiter, protect, createTool);

// Update reactions (requires authentication)
router.patch('/:type/:id/reaction', standardLimiter, protect, updateReaction);

// Admin/Moderator routes
router.patch('/:type/:id/pin', standardLimiter, protect, checkRole(['admin', 'moderator']), togglePin);
router.patch('/:type/:id/verify', standardLimiter, protect, checkRole(['admin', 'moderator']), toggleVerification);
router.patch('/:type/:id/priority', standardLimiter, protect, checkRole(['admin', 'moderator']), updatePriority);

// Update item (owner or admin/moderator)
router.put('/:type/:id', standardLimiter, protect, updateItem);

// Delete item (owner or admin/moderator)
router.delete('/:type/:id', standardLimiter, protect, deleteItem);

export default router;
