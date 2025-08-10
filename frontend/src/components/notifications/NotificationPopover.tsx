

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const popoverRef = useRef<HTMLDivElement>(null);
  
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
        return <Rocket className="w-4 h-4 text-blue-600" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-green-600" />;
      case 'channel':
        return <Tv className="w-4 h-4 text-purple-600" />;
      case 'problem':
        return <Puzzle className="w-4 h-4 text-orange-600" />;
      case 'resource':
        return <Wrench className="w-4 h-4 text-indigo-600" />;
      case 'project_approval':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'custom':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'system':
        return <Settings className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNotificationVariant = (type: string, priority: string) => {
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
      const variant = getNotificationVariant(notification.type, notification.priority);
      const typeLabel = notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace('_', ' ');
      toasterRef.current.show({
        title: `${typeLabel} - ${notification.title}`,
        message: `${notification.message} (${notification.priority} priority)`,
        variant,
        duration: 6000,
      });
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

  // Close expanded notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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
    if (notifications.length > 0) {
      // Get the most recent notification
      const latestNotification = notifications[0];
      
      // Check if it's a new unread notification (created in the last 10 seconds)
      const now = new Date();
      const notificationTime = new Date(latestNotification.createdAt);
      const timeDiff = now.getTime() - notificationTime.getTime();
      
      if (timeDiff < 10000 && !latestNotification.isRead) {
        showNotificationToast(latestNotification);
      }
    }
  }, [notifications, toasterRef]);

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
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className={`relative h-9 w-9 p-0 rounded-lg transition-all duration-200 ${className} ${
            theme === 'dark' 
              ? 'hover:bg-gray-800 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`} 
          aria-label="Open notifications"
        >
          <Bell size={18} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold border-2 border-white rounded-full shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        side="bottom"
        align="end"
        sideOffset={8}
        alignOffset={-20}
        className={`w-80 p-0 border-0 shadow-xl rounded-xl overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-100'
        }`}>
          <div className={`text-sm font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Notifications
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                className={`text-xs font-medium hover:underline transition-colors ${
                  theme === 'dark' 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
            {transformedNotifications.length > 0 && (
              <>
                <button 
                  className={`text-xs font-medium hover:underline transition-colors ${
                    theme === 'dark' 
                      ? 'text-orange-400 hover:text-orange-300' 
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                  onClick={handleArchiveAllNotifications}
                  title="Archive all notifications"
                >
                  Archive all
                </button>
                <button 
                  className={`text-xs font-medium hover:underline transition-colors ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-red-600 hover:text-red-700'
                  }`}
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
          <div className={`p-6 text-center ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            <Bell className={`w-10 h-10 mx-auto mb-2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p className={`font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No notifications yet
            </p>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className={`max-h-96 overflow-y-auto ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          }`}>
            {transformedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-3 py-2.5 text-sm transition-all duration-200 hover:bg-opacity-80 border-b last:border-b-0 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-800 border-gray-700' 
                    : 'hover:bg-gray-50 border-gray-100'
                }`}
              >
                <div className="relative flex items-start gap-2.5">
                  {/* Notification Icon */}
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    {notification.icon}
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm leading-tight ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </span>
                        {/* Type Badge */}
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0.5 ${
                            theme === 'dark' 
                              ? 'bg-gray-800 text-gray-300 border-gray-600' 
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
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
                          className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                          title={notification.unread ? 'Mark as read' : 'Mark as unread'}
                        >
                          {notification.unread ? (
                            <Eye className="w-3 h-3 text-gray-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                        
                        {/* More actions dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNotificationExpanded(notification.id);
                            }}
                            className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                            }`}
                            title="More actions"
                          >
                            <MoreVertical className="w-3 h-3 text-gray-400" />
                          </button>
                          
                          {/* Actions dropdown */}
                          {expandedNotifications.has(notification.id) && (
                            <div className={`absolute right-0 top-full mt-1 py-1 rounded-md shadow-lg z-10 ${
                              theme === 'dark' 
                                ? 'bg-gray-800 border border-gray-700' 
                                : 'bg-white border border-gray-200'
                            }`}>
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
                                className={`w-full px-3 py-1.5 text-xs text-left hover:bg-opacity-80 transition-colors flex items-center gap-2 ${
                                  theme === 'dark' 
                                    ? 'text-gray-300 hover:bg-gray-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
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
                                className={`w-full px-3 py-1.5 text-xs text-left hover:bg-opacity-80 transition-colors flex items-center gap-2 ${
                                  theme === 'dark' 
                                    ? 'text-gray-300 hover:bg-gray-700' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-xs leading-tight ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {expandedNotifications.has(notification.id) 
                        ? notification.message
                        : (notification.message.length > 60 
                            ? notification.message.substring(0, 60) + '...' 
                            : notification.message
                          )
                      }
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                  
                  {/* Unread Indicator */}
                  {notification.unread && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        {transformedNotifications.length > 0 && (
          <div className={`px-4 py-3 border-t ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-100'
          }`}>
            <button 
              className={`text-xs font-medium transition-colors w-full text-center ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300 hover:underline' 
                  : 'text-blue-600 hover:text-blue-700 hover:underline'
              }`}
            >
              View all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
