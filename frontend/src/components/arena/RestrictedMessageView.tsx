import React from 'react';
import { Shield, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestrictedMessageViewProps {
  channelName?: string;
}

const RestrictedMessageView: React.FC<RestrictedMessageViewProps> = ({ 
  channelName = 'announcement' 
}) => {
  return (
    <div className="p-4 border-t border-base-300 bg-base-200">
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg",
        "bg-warning/10 border border-warning/20",
        "text-warning-content"
      )}>
        <div className="flex-shrink-0">
          <Shield className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-warning">
              Restricted Access
            </h4>
            <Info className="w-4 h-4 text-warning/70" />
          </div>
          <p className="text-sm text-warning/80 leading-relaxed">
            Only <strong>admins and moderators</strong> can send messages in {channelName} channels. 
            This ensures important announcements are properly managed and verified.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-warning/70">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Admins & Moderators</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Verified Content Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestrictedMessageView; 