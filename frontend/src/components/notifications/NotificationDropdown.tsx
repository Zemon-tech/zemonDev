import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Archive, Trash2, Filter, MoreHorizontal } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/lib/notificationApi';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    stats,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archive,
    remove,
    updateFilters,
  } = useNotifications();

  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleFilterChange = (type: 'type' | 'status', value: string) => {
    if (type === 'type') {
      setFilterType(value);
      updateFilters({ type: value === 'all' ? undefined : value });
    } else {
      setFilterStatus(value);
      updateFilters({ isRead: value === 'all' ? undefined : value === 'read' });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'hackathon':
        return '🚀';
      case 'news':
        return '📰';
      case 'channel':
        return '📺';
      case 'problem':
        return '🧩';
      case 'resource':
        return '🛠️';
      case 'project_approval':
        return '✅';
      case 'custom':
        return '📢';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
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
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 max-h-96 bg-base-100 border border-base-300 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-content text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1 hover:bg-base-200 rounded"
                  title="Filters"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-base-200 rounded"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="p-4 border-b border-base-300 bg-base-200/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-base-content/70 mb-1 block">
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="select select-sm select-bordered w-full"
                    >
                      <option value="all">All Types</option>
                      <option value="hackathon">Hackathons</option>
                      <option value="news">News</option>
                      <option value="channel">Channels</option>
                      <option value="problem">Problems</option>
                      <option value="resource">Resources</option>
                      <option value="project_approval">Project Approvals</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-base-content/70 mb-1 block">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="select select-sm select-bordered w-full"
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
              <div className="p-3 border-b border-base-300 bg-base-200/30">
                <button
                  onClick={markAllAsRead}
                  className="btn btn-sm btn-primary w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="loading loading-spinner loading-md"></div>
                  <p className="text-sm text-base-content/70 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                  <p className="text-base-content/70">No notifications yet</p>
                  <p className="text-sm text-base-content/50">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="divide-y divide-base-300">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onArchive={archive}
                      onDelete={remove}
                      getNotificationIcon={getNotificationIcon}
                      getPriorityColor={getPriorityColor}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-base-300 bg-base-200/30">
                <div className="flex items-center justify-between text-xs text-base-content/70">
                  <span>
                    {stats?.total || 0} total • {unreadCount} unread
                  </span>
                  <button
                    onClick={() => {/* TODO: Navigate to full notifications page */}}
                    className="text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  getNotificationIcon: (type: string) => string;
  getPriorityColor: (priority: string) => string;
  formatTime: (date: Date) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete,
  getNotificationIcon,
  getPriorityColor,
  formatTime,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`p-4 hover:bg-base-200/50 transition-colors ${
        !notification.isRead ? 'bg-primary/5 border-l-2 border-primary' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-lg">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </span>
                <span className="text-xs text-base-content/50">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-base-200 rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-32">
                  {!notification.isRead && (
                    <button
                      onClick={() => {
                        onMarkAsRead(notification._id);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onArchive(notification._id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  <button
                    onClick={() => {
                      onDelete(notification._id);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-base-200 flex items-center gap-2 text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
