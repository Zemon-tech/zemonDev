import { Request } from 'express';
import Notification, { INotification } from '../models/notification.model';
import User from '../models/user.model';
import { emitToUser } from './socket.service';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export interface NotificationData {
  userId: string;
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  expiresAt?: Date;
}

export interface BulkNotificationData {
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  expiresAt?: Date;
  excludeUserIds?: string[]; // Users to exclude from notification
}

/**
 * Create a single notification for a user
 */
export const createNotification = async (notificationData: NotificationData): Promise<INotification> => {
  try {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(notificationData.userId),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority || 'medium',
      data: notificationData.data,
      expiresAt: notificationData.expiresAt,
    });

    const savedNotification = await notification.save();

    // Emit real-time notification to user
    emitToUser(notificationData.userId, 'notification_received', {
      id: savedNotification._id,
      type: savedNotification.type,
      title: savedNotification.title,
      message: savedNotification.message,
      priority: savedNotification.priority,
      data: savedNotification.data,
      createdAt: savedNotification.createdAt,
    });

    logger.info(`Notification created for user ${notificationData.userId}:`, {
      type: notificationData.type,
      title: notificationData.title,
      userId: notificationData.userId,
    });

    return savedNotification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users (bulk notification)
 */
export const createBulkNotifications = async (notificationData: BulkNotificationData): Promise<INotification[]> => {
  try {
    // Get all active users
    const users = await User.find({}).select('_id');
    
    // Filter out excluded users
    const targetUserIds = users
      .map(user => (user as any)._id.toString())
      .filter(userId => !notificationData.excludeUserIds?.includes(userId));

    // Create notifications for all target users
    const notifications = targetUserIds.map(userId => ({
      userId: new mongoose.Types.ObjectId(userId),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority || 'medium',
      data: notificationData.data,
      expiresAt: notificationData.expiresAt,
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    // Emit real-time notifications to all users
    savedNotifications.forEach(notification => {
      emitToUser(notification.userId.toString(), 'notification_received', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        createdAt: notification.createdAt,
      });
    });

    logger.info(`Bulk notifications created:`, {
      type: notificationData.type,
      title: notificationData.title,
      count: savedNotifications.length,
    });

    return savedNotifications;
  } catch (error) {
    logger.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Get notifications for a user with pagination
 */
export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    type?: string;
    isRead?: boolean;
    priority?: string;
  }
): Promise<{
  notifications: INotification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}> => {
  try {
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (filters?.type) query.type = filters.type;
    if (filters?.isRead !== undefined) query.isRead = filters.isRead;
    if (filters?.priority) query.priority = filters.priority;

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });

    return {
      notifications,
      total,
      unreadCount,
      hasMore: skip + notifications.length < total,
    };
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<INotification | null> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (notification) {
      // Emit real-time update
      emitToUser(userId, 'notification_updated', {
        id: notification._id,
        isRead: notification.isRead,
        readAt: notification.readAt,
      });
    }

    return notification;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<{ modifiedCount: number }> => {
  try {
    const result = await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Emit real-time update
    emitToUser(userId, 'all_notifications_read', {
      count: result.modifiedCount,
    });

    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Archive a notification
 */
export const archiveNotification = async (userId: string, notificationId: string): Promise<INotification | null> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        isArchived: true,
      },
      { new: true }
    );

    if (notification) {
      // Emit real-time update
      emitToUser(userId, 'notification_archived', {
        id: notification._id,
      });
    }

    return notification;
  } catch (error) {
    logger.error('Error archiving notification:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (userId: string, notificationId: string): Promise<boolean> => {
  try {
    const result = await Notification.deleteOne({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount > 0) {
      // Emit real-time update
      emitToUser(userId, 'notification_deleted', {
        id: notificationId,
      });
    }

    return result.deletedCount > 0;
  } catch (error) {
    logger.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get notification statistics for a user
 */
export const getNotificationStats = async (userId: string): Promise<{
  total: number;
  unread: number;
  archived: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}> => {
  try {
    const [
      total,
      unread,
      archived,
      byType,
      byPriority,
    ] = await Promise.all([
      Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
      Notification.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId), 
        isRead: false 
      }),
      Notification.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId), 
        isArchived: true 
      }),
      Notification.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Notification.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    const byTypeMap = byType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const byPriorityMap = byPriority.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      archived,
      byType: byTypeMap,
      byPriority: byPriorityMap,
    };
  } catch (error) {
    logger.error('Error getting notification stats:', error);
    throw error;
  }
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async (): Promise<{ deletedCount: number }> => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
    return { deletedCount: result.deletedCount };
  } catch (error) {
    logger.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};
