
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Rocket, 
  Newspaper, 
  Tv, 
  Puzzle, 
  Wrench, 
  CheckCircle, 
  Megaphone, 
  Settings,
  Clock,
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/lib/ThemeContext';
import { useState, useEffect, useRef } from 'react';



interface NotificationPopoverProps {
  className?: string;
  toasterRef?: React.RefObject<any>;
}

export function NotificationPopover({ className, toasterRef }: NotificationPopoverProps) {
  const { theme } = useTheme();
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archive: archiveNotification,
    remove: deleteNotification,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hackathon':
        return <Rocket className="w-4 h-4 text-info" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-success" />;
      case 'channel':
        return <Tv className="w-4 h-4 text-secondary" />;
      case 'problem':
        return <Puzzle className="w-4 h-4 text-warning" />;
      case 'resource':
        return <Wrench className="w-4 h-4 text-primary" />;
      case 'project_approval':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'custom':
        return <Megaphone className="w-4 h-4 text-accent" />;
      case 'system':
        return <Settings className="w-4 h-4 text-error" />;
      default:
        return <Bell className="w-4 h-4 text-base-content" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-base-content';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'badge-error badge-sm';
      case 'high':
        return 'badge-warning badge-sm';
      case 'medium':
        return 'badge-warning badge-sm';
      case 'low':
        return 'badge-success badge-sm';
      default:
        return 'badge-neutral badge-sm';
    }
  };

  const getNotificationVariant = (type: string, _priority: string) => {
    // Map notification types to toast variants based on backend types
    switch (type) {
      case 'hackathon':
      case 'project_approval':
        return 'success';
      case 'error':
      case 'system':
        return 'error';
      case 'warning':
      case 'high':
        return 'warning';
      case 'news':
      case 'channel':
      case 'problem':
      case 'resource':
      case 'custom':
      default:
        return 'default';
    }
  };

  const showNotificationToast = (notification: any) => {
    if (!notification.isRead && toasterRef?.current) {
      try {
        const variant = getNotificationVariant(notification.type, notification.priority);
        const typeLabel = notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace('_', ' ');
        
        toasterRef.current.show({
          title: `${typeLabel} - ${notification.title}`,
          message: `${notification.message} (${notification.priority} priority)`,
          variant,
          duration: 6000,
        });
        
        console.log('[NotificationPopover] Toast shown for notification:', notification._id);
      } catch (error) {
        console.error('[NotificationPopover] Error showing toast:', error);
      }
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }
    
    return new Date(d).toLocaleDateString();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    if (toasterRef?.current) {
      toasterRef.current.show({
        title: 'Notification marked as read',
        message: 'The notification has been marked as read',
        variant: 'success',
        duration: 3000,
      });
    }
  };

  const handleArchiveNotification = (id: string) => {
    archiveNotification(id);
    if (toasterRef?.current) {
      toasterRef.current.show({
        title: 'Notification archived',
        message: 'The notification has been moved to archive',
        variant: 'default',
        duration: 3000,
      });
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    if (toasterRef?.current) {
      toasterRef.current.show({
        title: 'Notification deleted',
        message: 'The notification has been permanently removed',
        variant: 'default',
        duration: 3000,
      });
    }
  };

  const handleArchiveAllNotifications = async () => {
    try {
      // Archive all notifications one by one
      const archivePromises = transformedNotifications.map(notification => 
        archiveNotification(notification.id)
      );
      await Promise.all(archivePromises);
      
      if (toasterRef?.current) {
        toasterRef.current.show({
          title: 'All notifications archived',
          message: `${transformedNotifications.length} notifications have been moved to archive`,
          variant: 'success',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error archiving all notifications:', error);
      if (toasterRef?.current) {
        toasterRef.current.show({
          title: 'Archive failed',
          message: 'Some notifications could not be archived',
          variant: 'error',
          duration: 4000,
        });
      }
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      // Delete all notifications one by one
      const deletePromises = transformedNotifications.map(notification => 
        deleteNotification(notification.id)
      );
      await Promise.all(deletePromises);
      
      if (toasterRef?.current) {
        toasterRef.current.show({
          title: 'All notifications deleted',
          message: `${transformedNotifications.length} notifications have been permanently removed`,
          variant: 'success',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      if (toasterRef?.current) {
        toasterRef.current.show({
          title: 'Delete failed',
          message: 'Some notifications could not be deleted',
          variant: 'error',
          duration: 4000,
        });
      }
    }
  };

  const toggleNotificationExpanded = (id: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setExpandedNotifications(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show toast notifications for new unread notifications
  useEffect(() => {
    if (notifications.length > 0 && toasterRef?.current) {
      // Get the most recent notification
      const latestNotification = notifications[0];
      
      // Check if we've already processed this notification
      if (processedNotifications.has(latestNotification._id)) {
        return;
      }
      
      // Check if it's a new unread notification (created in the last 60 seconds)
      const now = new Date();
      const notificationTime = new Date(latestNotification.createdAt);
      const timeDiff = now.getTime() - notificationTime.getTime();
      
      console.log('[NotificationPopover] Checking notification:', {
        id: latestNotification._id,
        isRead: latestNotification.isRead,
        timeDiff,
        shouldShow: timeDiff < 60000 && !latestNotification.isRead
      });
      
      // Show toast for unread notifications that are recent (within 60 seconds)
      if (timeDiff < 60000 && !latestNotification.isRead) {
        // Mark as processed
        setProcessedNotifications(prev => new Set([...prev, latestNotification._id]));
        
        // Add a small delay to ensure the notification is properly processed
        setTimeout(() => {
          showNotificationToast(latestNotification);
        }, 100);
      }
    }
  }, [notifications, toasterRef, processedNotifications]);

  // Transform notifications to display format
  const transformedNotifications = notifications.map((notification) => ({
    id: notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    timestamp: formatRelativeTime(notification.createdAt),
    unread: !notification.isRead,
    icon: getNotificationIcon(notification.type),
    priorityColor: getPriorityColor(notification.priority),
  }));

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        size="icon" 
        variant="ghost" 
        className={`relative h-9 w-9 p-0 rounded-lg transition-all duration-200 ${className} hover:bg-base-200 text-base-content`}
        aria-label="Open notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} strokeWidth={2} aria-hidden="true" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 py-0.5 bg-error text-error-content text-xs font-bold border-2 border-base-100 rounded-full shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
      
      {/* Custom Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 p-0 border-0 shadow-xl rounded-xl overflow-hidden z-[9999] bg-base-100 border border-base-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200">
            <div className="text-sm font-semibold text-base-content">
              Notifications
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  className="text-xs font-medium hover:underline transition-colors text-primary hover:text-primary-focus"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              {transformedNotifications.length > 0 && (
                <>
                  <button 
                    className="text-xs font-medium hover:underline transition-colors text-warning hover:text-warning-focus"
                    onClick={handleArchiveAllNotifications}
                    title="Archive all notifications"
                  >
                    Archive all
                  </button>
                  <button 
                    className="text-xs font-medium hover:underline transition-colors text-error hover:text-error-focus"
                    onClick={handleDeleteAllNotifications}
                    title="Delete all notifications"
                  >
                    Delete all
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Notifications List */}
          {transformedNotifications.length === 0 ? (
            <div className="p-6 text-center bg-base-100">
              <Bell className="w-10 h-10 mx-auto mb-2 text-base-content/50" />
              <p className="font-medium text-base-content">
                No notifications yet
              </p>
              <p className="text-sm mt-1 text-base-content/60">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto bg-base-100">
              {transformedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-3 py-2.5 text-sm transition-all duration-200 border-b border-base-300 last:border-b-0 hover:bg-base-200"
                >
                  <div className="relative flex items-start gap-2.5">
                    {/* Notification Icon */}
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-base-200">
                      {notification.icon}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm leading-tight text-base-content">
                            {notification.title}
                          </span>
                          {/* Type Badge */}
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 bg-base-200 text-base-content border-base-300"
                          >
                            {notification.type}
                          </Badge>
                          {/* Priority Badge */}
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0.5 ${getPriorityBadgeColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {/* Mark as read/unread */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification.id);
                            }}
                            className="p-1 rounded transition-colors hover:bg-base-300"
                            title={notification.unread ? 'Mark as read' : 'Mark as unread'}
                          >
                            {notification.unread ? (
                              <Eye className="w-3 h-3 text-base-content/60" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-base-content/40" />
                            )}
                          </button>
                          
                          {/* More actions dropdown */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNotificationExpanded(notification.id);
                              }}
                              className="p-1 rounded transition-colors hover:bg-base-300"
                              title="More actions"
                            >
                              <MoreVertical className="w-3 h-3 text-base-content/60" />
                            </button>
                            
                            {/* Actions dropdown */}
                            {expandedNotifications.has(notification.id) && (
                              <div className="absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-10 bg-base-100 border border-base-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveNotification(notification.id);
                                    setExpandedNotifications(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(notification.id);
                                      return newSet;
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-left transition-colors flex items-center gap-2 text-base-content hover:bg-base-200"
                                >
                                  <Archive className="w-3 h-3" />
                                  Archive
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification.id);
                                    setExpandedNotifications(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(notification.id);
                                      return newSet;
                                    });
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-left transition-colors flex items-center gap-2 text-base-content hover:bg-base-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs leading-tight text-base-content/70">
                        {expandedNotifications.has(notification.id) 
                          ? notification.message
                          : (notification.message.length > 60 
                              ? notification.message.substring(0, 60) + '...' 
                              : notification.message
                            )
                        }
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium flex items-center gap-1 text-base-content/60">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    {/* Unread Indicator */}
                    {notification.unread && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Footer */}
          {transformedNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-base-300 bg-base-200">
              <button 
                className="text-xs font-medium transition-colors w-full text-center text-primary hover:text-primary-focus hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
