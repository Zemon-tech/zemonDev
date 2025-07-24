import { Router } from 'express';
import { 
  getChannels,
  getChannelMessages,
  createMessage,
  deleteMessage,
  getUnreadMessageCount,
  markAllAsRead,
  getAllUnreadCounts,
  joinChannelRequest,
  getAllJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  acceptAllJoinRequests,
  rejectAllJoinRequests,
  getUserChannelStatus,
  banOrKickUserFromParentChannel
} from '../controllers/arenaChannels.controller';
import { protect, checkRole } from '../middleware/auth.middleware';
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

// Add join channel request route
router.post('/:channelId/join', standardLimiter, protect, joinChannelRequest);

// Admin join request management routes
router.get('/join-requests', standardLimiter, protect, checkRole(['admin', 'moderator']), getAllJoinRequests);
router.post('/join-requests/:userId/:channelId/accept', standardLimiter, protect, checkRole(['admin', 'moderator']), acceptJoinRequest);
router.post('/join-requests/:userId/:channelId/reject', standardLimiter, protect, checkRole(['admin', 'moderator']), rejectJoinRequest);
router.post('/join-requests/:userId/accept-all', standardLimiter, protect, checkRole(['admin', 'moderator']), acceptAllJoinRequests);
router.post('/join-requests/:userId/reject-all', standardLimiter, protect, checkRole(['admin', 'moderator']), rejectAllJoinRequests);

// Ban or kick a user from a parent channel (and all its children)
router.post('/:parentChannelId/ban', standardLimiter, protect, checkRole(['admin', 'moderator']), banOrKickUserFromParentChannel);

// User channel status route
router.get('/user-channel-status', protect, getUserChannelStatus);

export default router; 