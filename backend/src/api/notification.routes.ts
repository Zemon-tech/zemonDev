import express from 'express';
import {
  getNotifications,
  getNotificationStatsController,
  markAsRead,
  markAllAsRead,
  archiveNotificationController,
  deleteNotificationController,
  createCustomNotification,
  createBulkNotificationsController,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get user's notifications with pagination and filters
router.get('/', standardLimiter, cacheMiddleware(60), getNotifications);

// Get notification statistics
router.get('/stats', standardLimiter, cacheMiddleware(300), getNotificationStatsController);



// Mark notification as read
router.put('/:id/read', standardLimiter, markAsRead);

// Mark all notifications as read
router.put('/read-all', standardLimiter, markAllAsRead);

// Archive a notification
router.put('/:id/archive', standardLimiter, archiveNotificationController);

// Delete a notification
router.delete('/:id', standardLimiter, deleteNotificationController);

// Admin routes (require admin privileges)
// Create custom notification
router.post('/custom', standardLimiter, createCustomNotification);

// Create bulk notifications
router.post('/bulk', standardLimiter, createBulkNotificationsController);



export default router;
