import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationStats,
  createBulkNotifications,
  NotificationData,
  BulkNotificationData,
} from '../services/notification.service';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    clerkId: string;
    email: string;
    username: string;
    fullName: string;
  };
}

/**
 * Get user's notifications with pagination and filters
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const priority = req.query.priority as string;

    const filters = {
      type,
      isRead,
      priority,
    };

    const result = await getUserNotifications(userId, page, limit, filters);

    res.status(200).json(
      new ApiResponse(200, 'Notifications retrieved successfully', {
        notifications: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: result.hasMore,
        },
        unreadCount: result.unreadCount,
      })
    );
  }
);

/**
 * Get notification statistics for user
 * GET /api/notifications/stats
 */
export const getNotificationStatsController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const stats = await getNotificationStats(userId);

    res.status(200).json(
      new ApiResponse(200, 'Notification statistics retrieved successfully', stats)
    );
  }
);

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError('Notification ID is required', 400));
    }

    const notification = await markNotificationAsRead(userId, id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json(
      new ApiResponse(200, 'Notification marked as read', notification)
    );
  }
);

/**
 * Mark all notifications as read for user
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const result = await markAllNotificationsAsRead(userId);

    res.status(200).json(
      new ApiResponse(200, 'All notifications marked as read', {
        modifiedCount: result.modifiedCount,
      })
    );
  }
);

/**
 * Archive a notification
 * PUT /api/notifications/:id/archive
 */
export const archiveNotificationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError('Notification ID is required', 400));
    }

    const notification = await archiveNotification(userId, id);

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json(
      new ApiResponse(200, 'Notification archived successfully', notification)
    );
  }
);

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotificationController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError('Notification ID is required', 400));
    }

    const deleted = await deleteNotification(userId, id);

    if (!deleted) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json(
      new ApiResponse(200, 'Notification deleted successfully', null)
    );
  }
);

/**
 * Create a custom notification (Admin only)
 * POST /api/notifications/custom
 */
export const createCustomNotification = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is admin
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { title, message, priority, data, expiresAt } = req.body;

    if (!title || !message) {
      return next(new AppError('Title and message are required', 400));
    }

    const notificationData: NotificationData = {
      userId: req.user._id,
      type: 'custom',
      title,
      message,
      priority: priority || 'medium',
      data,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };

    const notification = await createNotification(notificationData);

    res.status(201).json(
      new ApiResponse(201, 'Custom notification created successfully', notification)
    );
  }
);

/**
 * Create bulk notifications (Admin only)
 * POST /api/notifications/bulk
 */
export const createBulkNotificationsController = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if user is admin
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { type, title, message, priority, data, expiresAt, excludeUserIds } = req.body;

    if (!type || !title || !message) {
      return next(new AppError('Type, title, and message are required', 400));
    }

    const notificationData: BulkNotificationData = {
      type,
      title,
      message,
      priority: priority || 'medium',
      data,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      excludeUserIds,
    };

    const notifications = await createBulkNotifications(notificationData);

    res.status(201).json(
      new ApiResponse(201, 'Bulk notifications created successfully', {
        count: notifications.length,
        notifications: notifications.slice(0, 10), // Return first 10 for preview
      })
    );
  }
);


