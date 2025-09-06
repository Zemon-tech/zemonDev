import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Archive,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  X,
  Check,
  Filter
} from "lucide-react";
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import * as ScrollArea from '@radix-ui/react-scroll-area';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archive: archiveNotification,
    updateFilters,
  } = useNotifications();

  // Smart navigation handler
  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification._id);
    
    if (notification.data?.entityId) {
      const { entityId } = notification.data;
      
      switch (notification.type) {
        case 'problem':
          navigate(`/${username}/crucible/problem/${entityId}`);
          break;
        case 'resource':
          navigate(`/${username}/forge/${entityId}`);
          break;
        case 'hackathon':
        case 'channel':
        case 'project_approval':
          navigate(`/${username}/arena`);
          break;
      }
    }
    
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'hackathon': return <Rocket className={cn(iconClass, "text-info")} />;
      case 'news': return <Newspaper className={cn(iconClass, "text-success")} />;
      case 'channel': return <Tv className={cn(iconClass, "text-secondary")} />;
      case 'problem': return <Puzzle className={cn(iconClass, "text-warning")} />;
      case 'resource': return <Wrench className={cn(iconClass, "text-primary")} />;
      case 'project_approval': return <CheckCircle className={cn(iconClass, "text-success")} />;
      case 'custom': return <Megaphone className={cn(iconClass, "text-accent")} />;
      case 'system': return <Settings className={cn(iconClass, "text-base-content")} />;
      default: return <Bell className={cn(iconClass, "text-base-content")} />;
    }
  };


  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'hackathon': return 'Hackathon';
      case 'news': return 'News';
      case 'channel': return 'Channel';
      case 'problem': return 'Problem';
      case 'resource': return 'Resource';
      case 'project_approval': return 'Project';
      case 'custom': return 'Custom';
      case 'system': return 'System';
      default: return 'Notification';
    }
  };

  const formatRelativeTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return new Date(d).toLocaleDateString();
  };

  const handleFilterChange = (type: 'type' | 'status', value: string) => {
    if (type === 'type') {
      setFilterType(value);
      updateFilters({ type: value === 'all' ? undefined : value });
    } else {
      setFilterStatus(value);
      updateFilters({ isRead: value === 'all' ? undefined : value === 'read' });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === 'all' || notification.type === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.isRead) ||
      (filterStatus === 'unread' && !notification.isRead);
    return typeMatch && statusMatch;
  });

  const isActionable = (notification: any) => {
    return notification.data?.entityId && 
           ['problem', 'resource', 'hackathon', 'channel', 'project_approval'].includes(notification.type);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-4 top-16 w-80 max-w-[calc(100vw-2rem)] bg-base-100 rounded-xl shadow-xl border border-base-300 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base-content text-sm">Notifications</h3>
                  <p className="text-xs text-base-content/60">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-ghost btn-xs"
                  title="Filters"
                >
                  <Filter className="w-3 h-3" />
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-xs"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="p-3 border-b border-base-300 bg-base-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-base-content/70 mb-1 block">
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="select select-xs w-full"
                    >
                      <option value="all">All Types</option>
                      <option value="problem">Problems</option>
                      <option value="resource">Resources</option>
                      <option value="hackathon">Hackathons</option>
                      <option value="channel">Channels</option>
                      <option value="project_approval">Projects</option>
                      <option value="news">News</option>
                      <option value="custom">Custom</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-base-content/70 mb-1 block">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="select select-xs w-full"
                    >
                      <option value="all">All</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="p-2 border-b border-base-300 bg-base-200">
                <button
                  onClick={markAllAsRead}
                  className="btn btn-primary btn-xs w-full"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea.Root className="max-h-80">
              <ScrollArea.Viewport className="w-full h-full">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-base-content/40" />
                    </div>
                    <h4 className="font-medium text-base-content text-sm mb-1">No notifications</h4>
                    <p className="text-xs text-base-content/60">
                      {filterType !== 'all' || filterStatus !== 'all' 
                        ? 'No notifications match your filters'
                        : "We'll notify you when something important happens"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-base-300">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-3 hover:bg-base-200 transition-colors cursor-pointer group",
                          !notification.isRead && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <h4 className="font-medium text-base-content text-xs leading-tight truncate">
                                    {notification.title}
                                  </h4>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0.5 bg-base-200 text-base-content/70 border-base-300"
                                  >
                                    {getNotificationTypeLabel(notification.type)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-base-content/70 leading-relaxed mb-1.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-base-content/50 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatRelativeTime(notification.createdAt)}
                                  </span>
                                  {isActionable(notification) && (
                                    <span className="text-xs text-primary flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />
                                      Click to view
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className="btn btn-ghost btn-xs p-1"
                                  title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                                >
                                  {notification.isRead ? (
                                    <EyeOff className="w-3 h-3 text-base-content/40" />
                                  ) : (
                                    <Eye className="w-3 h-3 text-base-content/60" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveNotification(notification._id);
                                  }}
                                  className="btn btn-ghost btn-xs p-1"
                                  title="Archive"
                                >
                                  <Archive className="w-3 h-3 text-base-content/60" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <div className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-base-200 transition-colors duration-150 ease-out hover:bg-base-300 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2">
                <ScrollArea.Thumb className="flex-1 bg-base-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-2 border-t border-base-300 bg-base-200">
                <button
                  className="btn btn-ghost btn-xs w-full text-primary hover:text-primary-focus hover:bg-primary/10"
                  onClick={() => {
                    navigate(`/${username}/notifications`);
                    onClose();
                  }}
                >
                  View all notifications
                  <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;