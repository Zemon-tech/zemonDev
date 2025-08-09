import { createNotification, createBulkNotifications, NotificationData, BulkNotificationData } from './notification.service';
import logger from '../utils/logger';

/**
 * Notification Triggers Service
 * Handles automatic notifications for various system events
 */

export interface ForgeResource {
  _id: string;
  title: string;
  type: string;
  description?: string;
}

export interface Hackathon {
  _id: string;
  title: string;
  description?: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  content?: string;
}

export interface Project {
  _id: string;
  title: string;
  ownerId: string;
  description?: string;
}

export interface Channel {
  _id: string;
  name: string;
  type: string;
  description?: string;
}

export interface Problem {
  _id: string;
  title: string;
  difficulty: string;
  description?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
}

/**
 * Trigger notification when new forge resource is created
 */
export const onForgeResourceCreated = async (resource: ForgeResource): Promise<void> => {
  try {
    const notificationData: BulkNotificationData = {
      type: 'resource',
      title: 'New Forge Resource Available! 🛠️',
      message: `A new ${resource.type} resource "${resource.title}" has been added to the Forge. Check it out!`,
      priority: 'medium',
      data: {
        entityId: resource._id,
        entityType: 'forge_resource',
        action: 'created',
        metadata: {
          resourceType: resource.type,
          title: resource.title,
        },
      },
    };

    await createBulkNotifications(notificationData);
    logger.info(`Forge resource notification triggered for: ${resource.title}`);
  } catch (error) {
    logger.error('Error triggering forge resource notification:', error);
  }
};

/**
 * Trigger notification when new hackathon is created
 */
export const onHackathonCreated = async (hackathon: Hackathon): Promise<void> => {
  try {
    const notificationData: BulkNotificationData = {
      type: 'hackathon',
      title: 'New Hackathon Available! 🚀',
      message: `A new hackathon "${hackathon.title}" has been posted. Join the challenge!`,
      priority: 'high',
      data: {
        entityId: hackathon._id,
        entityType: 'hackathon',
        action: 'created',
        metadata: {
          title: hackathon.title,
        },
      },
    };

    await createBulkNotifications(notificationData);
    logger.info(`Hackathon notification triggered for: ${hackathon.title}`);
  } catch (error) {
    logger.error('Error triggering hackathon notification:', error);
  }
};

/**
 * Trigger notification when new news item is posted
 */
export const onNewsCreated = async (news: NewsItem): Promise<void> => {
  try {
    const notificationData: BulkNotificationData = {
      type: 'news',
      title: 'Latest News Update! 📰',
      message: `New news: "${news.title}". Stay updated with the latest!`,
      priority: 'medium',
      data: {
        entityId: news._id,
        entityType: 'news',
        action: 'created',
        metadata: {
          title: news.title,
        },
      },
    };

    await createBulkNotifications(notificationData);
    logger.info(`News notification triggered for: ${news.title}`);
  } catch (error) {
    logger.error('Error triggering news notification:', error);
  }
};

/**
 * Trigger notification when project is approved
 */
export const onProjectApproved = async (project: Project): Promise<void> => {
  try {
    const notificationData: NotificationData = {
      userId: project.ownerId,
      type: 'project_approval',
      title: 'Project Approved! 🎉',
      message: `Your project "${project.title}" has been approved by the admin team. Congratulations!`,
      priority: 'high',
      data: {
        entityId: project._id,
        entityType: 'project',
        action: 'approved',
        metadata: {
          title: project.title,
        },
      },
    };

    await createNotification(notificationData);
    logger.info(`Project approval notification triggered for: ${project.title}`);
  } catch (error) {
    logger.error('Error triggering project approval notification:', error);
  }
};

/**
 * Trigger notification when new channel is created
 */
export const onChannelCreated = async (channel: Channel): Promise<void> => {
  try {
    const notificationData: BulkNotificationData = {
      type: 'channel',
      title: 'New Channel Created! 📺',
      message: `A new ${channel.type} channel "${channel.name}" has been created. Join the conversation!`,
      priority: 'medium',
      data: {
        entityId: channel._id,
        entityType: 'channel',
        action: 'created',
        metadata: {
          channelType: channel.type,
          name: channel.name,
        },
      },
    };

    await createBulkNotifications(notificationData);
    logger.info(`Channel notification triggered for: ${channel.name}`);
  } catch (error) {
    logger.error('Error triggering channel notification:', error);
  }
};

/**
 * Trigger notification when new problem is added
 */
export const onProblemCreated = async (problem: Problem): Promise<void> => {
  try {
    const notificationData: BulkNotificationData = {
      type: 'problem',
      title: 'New Problem Available! 🧩',
      message: `A new ${problem.difficulty} problem "${problem.title}" has been added to the Crucible. Take on the challenge!`,
      priority: 'high',
      data: {
        entityId: problem._id,
        entityType: 'problem',
        action: 'created',
        metadata: {
          difficulty: problem.difficulty,
          title: problem.title,
        },
      },
    };

    await createBulkNotifications(notificationData);
    logger.info(`Problem notification triggered for: ${problem.title}`);
  } catch (error) {
    logger.error('Error triggering problem notification:', error);
  }
};

/**
 * Send system-wide notification
 */
export const sendSystemNotification = async (
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  data?: any
): Promise<void> => {
  try {
    const notificationData: BulkNotificationData = {
      type: 'custom',
      title,
      message,
      priority,
      data: {
        entityType: 'system',
        action: 'announcement',
        metadata: data,
      },
    };

    await createBulkNotifications(notificationData);
    logger.info(`System notification sent: ${title}`);
  } catch (error) {
    logger.error('Error sending system notification:', error);
  }
};

/**
 * Send custom notification to specific user
 */
export const sendCustomNotification = async (
  userId: string,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  data?: any
): Promise<void> => {
  try {
    const notificationData: NotificationData = {
      userId,
      type: 'custom',
      title,
      message,
      priority,
      data: {
        entityType: 'custom',
        action: 'manual',
        metadata: data,
      },
    };

    await createNotification(notificationData);
    logger.info(`Custom notification sent to user ${userId}: ${title}`);
  } catch (error) {
    logger.error('Error sending custom notification:', error);
  }
};

/**
 * Send welcome notification for new user registration
 */
export const onUserRegistered = async (user: User): Promise<void> => {
  try {
    const notificationData: NotificationData = {
      userId: user._id,
      type: 'custom',
      title: 'Welcome to Zemon! 🎉',
      message: `Welcome ${user.username}! We're excited to have you join our community. Start exploring the Forge, take on challenges in the Crucible, and connect with others in the Arena!`,
      priority: 'high',
      data: {
        entityType: 'user',
        action: 'registered',
        metadata: {
          username: user.username,
        },
      },
    };

    await createNotification(notificationData);
    logger.info(`Welcome notification sent to new user: ${user.username}`);
  } catch (error) {
    logger.error('Error sending welcome notification:', error);
  }
};

/**
 * Send achievement notification
 */
export const onUserAchievement = async (
  userId: string,
  achievementTitle: string,
  achievementDescription: string
): Promise<void> => {
  try {
    const notificationData: NotificationData = {
      userId,
      type: 'custom',
      title: 'Achievement Unlocked! 🏆',
      message: `Congratulations! You've earned the "${achievementTitle}" achievement: ${achievementDescription}`,
      priority: 'high',
      data: {
        entityType: 'achievement',
        action: 'unlocked',
        metadata: {
          title: achievementTitle,
          description: achievementDescription,
        },
      },
    };

    await createNotification(notificationData);
    logger.info(`Achievement notification sent to user ${userId}: ${achievementTitle}`);
  } catch (error) {
    logger.error('Error sending achievement notification:', error);
  }
};

export default {
  onForgeResourceCreated,
  onHackathonCreated,
  onNewsCreated,
  onProjectApproved,
  onChannelCreated,
  onProblemCreated,
  sendSystemNotification,
  sendCustomNotification,
  onUserRegistered,
  onUserAchievement,
};
