import { logger } from './utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('API Error:', response.status, errorBody);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  try {
    const data = await response.json();
    return (data.data || data) as T;
  } catch (error) {
    logger.error('Error parsing JSON response:', error);
    throw new Error('Invalid JSON response from server.');
  }
}

async function getAuthHeader(getToken: () => Promise<string | null>) {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<T> {
  const authHeader = await getAuthHeader(getToken);
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authHeader.Authorization) {
    headers.set('Authorization', authHeader.Authorization);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byType: {
    hackathon: number;
    news: number;
    channel: number;
    problem: number;
    resource: number;
    project_approval: number;
    custom: number;
    system: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    hackathon: boolean;
    news: boolean;
    channel: boolean;
    problem: boolean;
    resource: boolean;
    project_approval: boolean;
    custom: boolean;
  };
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface CreateNotificationData {
  userId?: string; // Required for custom notifications
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
  excludeUserIds?: string[];
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export interface CleanupResponse {
  deletedCount: number;
}

/**
 * Get user notifications with pagination and filters
 */
export const getNotifications = async (
  getToken: () => Promise<string | null>,
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.type) params.append('type', filters.type);
  if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest<NotificationsResponse>(`/notifications?${params.toString()}`, {}, getToken);
};

/**
 * Get notification statistics for user
 */
export const getNotificationStats = async (getToken: () => Promise<string | null>): Promise<NotificationStats> => {
  return apiRequest<NotificationStats>('/notifications/stats', {}, getToken);
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  getToken: () => Promise<string | null>
): Promise<Notification> => {
  return apiRequest<Notification>(`/notifications/${notificationId}/read`, { method: 'PUT' }, getToken);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  getToken: () => Promise<string | null>
): Promise<{ modifiedCount: number }> => {
  return apiRequest<{ modifiedCount: number }>('/notifications/read-all', { method: 'PUT' }, getToken);
};

/**
 * Archive a notification
 */
export const archiveNotification = async (
  notificationId: string,
  getToken: () => Promise<string | null>
): Promise<Notification> => {
  return apiRequest<Notification>(`/notifications/${notificationId}/archive`, { method: 'PUT' }, getToken);
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string,
  getToken: () => Promise<string | null>
): Promise<void> => {
  return apiRequest<void>(`/notifications/${notificationId}`, { method: 'DELETE' }, getToken);
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (
  getToken: () => Promise<string | null>
): Promise<NotificationPreferences> => {
  return apiRequest<NotificationPreferences>('/notifications/preferences', {}, getToken);
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>,
  getToken: () => Promise<string | null>
): Promise<NotificationPreferences> => {
  return apiRequest<NotificationPreferences>('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  }, getToken);
};

// Admin functions

/**
 * Get all notifications (admin only)
 */
export const getAllNotifications = async (
  getToken: () => Promise<string | null>,
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.type) params.append('type', filters.type);
  if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  return apiRequest<NotificationsResponse>(`/notifications/all?${params.toString()}`, {}, getToken);
};

/**
 * Create custom notification for specific user (admin only)
 */
export const createCustomNotification = async (
  data: CreateNotificationData,
  getToken: () => Promise<string | null>
): Promise<Notification> => {
  return apiRequest<Notification>('/notifications/custom', {
    method: 'POST',
    body: JSON.stringify(data),
  }, getToken);
};

/**
 * Create bulk notifications for all users (admin only)
 */
export const createBulkNotifications = async (
  data: BulkNotificationData,
  getToken: () => Promise<string | null>
): Promise<{ count: number; notifications: Notification[] }> => {
  return apiRequest<{ count: number; notifications: Notification[] }>('/notifications/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  }, getToken);
};

/**
 * Clean up expired notifications (admin only)
 */
export const cleanupExpiredNotifications = async (
  getToken: () => Promise<string | null>
): Promise<CleanupResponse> => {
  return apiRequest<CleanupResponse>('/notifications/cleanup', { method: 'DELETE' }, getToken);
};

export const notificationApi = {
  // User functions
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  
  // Admin functions
  getAllNotifications,
  createCustomNotification,
  createBulkNotifications,
  cleanupExpiredNotifications,
};

export default notificationApi;
