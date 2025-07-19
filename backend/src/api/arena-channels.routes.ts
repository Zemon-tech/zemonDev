import { Router } from 'express';
import { 
  getChannels,
  getChannelMessages,
  createMessage,
  deleteMessage,
  getUnreadMessageCount,
  markAllAsRead,
  getAllUnreadCounts
} from '../controllers/arenaChannels.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Get all channels grouped by category (user-specific permissions)
router.get('/', standardLimiter, protect, cacheMiddleware(300), getChannels); // Cache for 5 minutes

// Get all unread counts for all channels
router.get('/unread-counts', standardLimiter, protect, getAllUnreadCounts);

// Get messages for a channel
router.get('/:channelId/messages', standardLimiter, protect, getChannelMessages);

// Send message to channel
router.post('/:channelId/messages', standardLimiter, protect, createMessage);

// Delete message
router.delete('/:channelId/messages/:messageId', standardLimiter, protect, deleteMessage);

// Get unread message count
router.get('/:channelId/unread-count', standardLimiter, protect, getUnreadMessageCount);

// Mark all messages as read
router.post('/:channelId/mark-read', standardLimiter, protect, markAllAsRead);

export default router; 