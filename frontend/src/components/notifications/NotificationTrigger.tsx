import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

interface NotificationTriggerProps {
  className?: string;
}

const NotificationTrigger: React.FC<NotificationTriggerProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <Button 
        size="icon" 
        variant="ghost" 
        className={`relative h-9 w-9 p-0 rounded-lg transition-all duration-200 ${className} hover:bg-base-200 text-base-content`}
        aria-label="Open notifications"
        onClick={() => setIsOpen(true)}
      >
        <Bell size={18} strokeWidth={2} aria-hidden="true" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 py-0.5 bg-error text-error-content text-xs font-bold border-2 border-base-100 rounded-full shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
      
      <NotificationDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationTrigger;
