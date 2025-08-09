import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  getNotifications, 
  getNotificationStats, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  Notification,
  NotificationStats,
  NotificationFilters
} from '@/lib/notificationApi';

export const useNotifications = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (newFilters?: NotificationFilters) => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      setLoading(true);
      const currentFilters = newFilters || filters;
      const response = await getNotifications(getToken, currentFilters);
      setNotifications(response.notifications);
      setFilters(currentFilters);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn, filters]);

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      const response = await getNotificationStats(getToken);
      setStats(response);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [getToken, isLoaded, isSignedIn]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      await markNotificationAsRead(notificationId, getToken);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [getToken, isLoaded, isSignedIn, fetchStats]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      await markAllNotificationsAsRead(getToken);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: new Date() 
        }))
      );
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [getToken, isLoaded, isSignedIn, fetchStats]);

  // Archive notification
  const archive = useCallback(async (notificationId: string) => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      await archiveNotification(notificationId, getToken);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isArchived: true }
            : notification
        )
      );
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  }, [getToken, isLoaded, isSignedIn, fetchStats]);

  // Delete notification
  const remove = useCallback(async (notificationId: string) => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      await deleteNotification(notificationId, getToken);
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [getToken, isSignedIn, fetchStats]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filters change
    fetchNotifications(updatedFilters);
  }, [filters, fetchNotifications]);

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (loading) return;
    const nextPage = (filters.page || 1) + 1;
    fetchNotifications({ ...filters, page: nextPage });
  }, [filters, loading, fetchNotifications]);

  // Initial load
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchNotifications();
      fetchStats();
    }
  }, [isLoaded, isSignedIn, fetchNotifications, fetchStats]);

  return {
    notifications,
    stats,
    loading,
    error,
    filters,
    unreadCount: stats?.unread || 0,
    markAsRead,
    markAllAsRead,
    archive,
    remove,
    updateFilters,
    loadMore,
    refetch: () => {
      fetchNotifications();
      fetchStats();
    },
  };
};
