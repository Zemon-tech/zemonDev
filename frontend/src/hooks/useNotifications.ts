import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSocket } from '@/context/SocketContext';
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
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
  });
  // Track seen notification ids to avoid duplicates (e.g., service + change stream emits)
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Fetch notifications
  const fetchNotifications = useCallback(async (newFilters?: NotificationFilters) => {
    if (!isLoaded || !isSignedIn) return;
    
    try {
      setLoading(true);
      const currentFilters = newFilters || filters;
      const response = await getNotifications(getToken, currentFilters);
      console.log('[Notifications] Fetched', response.notifications?.length);
      // Merge server list with any locally inserted items to avoid overwriting optimistic updates
      setNotifications((prev) => {
        const byId = new Map<string, Notification>();
        // include existing (may contain optimistic new item)
        prev.forEach((n) => byId.set(n._id, n));
        // overlay with server data
        response.notifications.forEach((n) => byId.set(n._id, n as any));
        const merged = Array.from(byId.values());
        // sort by createdAt desc
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // apply limit
        const limit = currentFilters.limit || 20;
        return merged.slice(0, limit);
      });
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
      console.log('[Notifications] Stats', response);
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

  // Socket listeners for real-time updates (Phase 1)
  useEffect(() => {
    if (!socket || !isLoaded || !isSignedIn) return;

    const handleConnect = () => {
      console.log('[Notifications] Socket connected, reconcile fetch');
      // Reconcile on reconnect
      fetchNotifications();
      fetchStats();
    };

    const handleNotificationReceived = (payload: any) => {
      console.log('[Notifications] notification_received', payload);
      try {
        const id: string | undefined = payload?.id;
        if (!id) return;
        // Deduplicate across events within this session
        if (seenIdsRef.current.has(id)) return;
        seenIdsRef.current.add(id);

        // Check filters quickly to decide visibility in current list
        const matchesType = !filters.type || filters.type === payload?.type;
        const matchesRead =
          filters.isRead === undefined || filters.isRead === false; // newly received are unread
        const matchesPriority = !filters.priority || filters.priority === payload?.priority;

        // Optimistically update stats
        setStats((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          next.total = (prev.total || 0) + 1;
          next.unread = (prev.unread || 0) + 1;
          if (payload?.type && prev.byType && payload.type in prev.byType) {
            next.byType = { ...prev.byType, [payload.type]: (prev.byType as any)[payload.type] + 1 } as any;
          }
          if (payload?.priority && prev.byPriority && payload.priority in prev.byPriority) {
            next.byPriority = { ...prev.byPriority, [payload.priority]: (prev.byPriority as any)[payload.priority] + 1 } as any;
          }
          return next;
        });

        if (!(matchesType && matchesRead && matchesPriority)) {
          return; // Do not insert into current list if it doesn't match filters
        }

        const newItem: Notification = {
          _id: id,
          userId: payload?.userId || '',
          type: payload?.type,
          title: payload?.title,
          message: payload?.message,
          priority: payload?.priority || 'medium',
          isRead: false,
          isArchived: false,
          data: payload?.data,
          readAt: undefined,
          expiresAt: undefined,
          createdAt: payload?.createdAt ? new Date(payload.createdAt) : new Date(),
          updatedAt: payload?.createdAt ? new Date(payload.createdAt) : new Date(),
        } as Notification;

        setNotifications((prev) => {
          // Prepend and trim to page limit
          const limit = filters.limit || 20;
          const deduped = prev.find((n) => n._id === id) ? prev : [newItem, ...prev];
          return deduped.slice(0, limit);
        });
        // Ensure unread badge updates even if stats were not yet fetched
        fetchStats();
      } catch (e) {
        // On any mismatch, fallback to full refetch to remain consistent
        fetchNotifications();
        fetchStats();
      }
    };

    const handleNotificationUpdated = (payload: any) => {
      console.log('[Notifications] notification_updated', payload);
      const id: string | undefined = payload?.id;
      if (!id) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? {
                ...n,
                isRead: payload?.isRead ?? n.isRead,
                readAt: payload?.readAt ? new Date(payload.readAt) : n.readAt,
              }
            : n
        )
      );
      // Adjust unread count if needed
      fetchStats();
    };

    const handleNotificationArchived = (payload: any) => {
      console.log('[Notifications] notification_archived', payload);
      const id: string | undefined = payload?.id;
      if (!id) return;
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isArchived: true } : n)));
      // If current filter excludes archived, remove from visible list via refetch
      if (filters?.type || filters?.isRead !== undefined || filters?.priority) {
        fetchNotifications(filters);
      }
      fetchStats();
    };

    const handleNotificationDeleted = (payload: any) => {
      console.log('[Notifications] notification_deleted', payload);
      const id: string | undefined = payload?.id;
      if (!id) return;
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      fetchStats();
    };

    const handleAllNotificationsRead = (_payload: any) => {
      console.log('[Notifications] all_notifications_read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || new Date() })));
      setStats((prev) => (prev ? { ...prev, unread: 0 } : prev));
    };

    socket.on('connect', handleConnect);
    socket.on('notification_received', handleNotificationReceived);
    socket.on('notification_updated', handleNotificationUpdated);
    socket.on('notification_archived', handleNotificationArchived);
    socket.on('notification_deleted', handleNotificationDeleted);
    socket.on('all_notifications_read', handleAllNotificationsRead);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification_received', handleNotificationReceived);
      socket.off('notification_updated', handleNotificationUpdated);
      socket.off('notification_archived', handleNotificationArchived);
      socket.off('notification_deleted', handleNotificationDeleted);
      socket.off('all_notifications_read', handleAllNotificationsRead);
    };
  }, [socket, isLoaded, isSignedIn, fetchNotifications, fetchStats, filters]);

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
