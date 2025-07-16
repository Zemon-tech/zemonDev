import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Hash, Volume2, User, Trophy, Crown, Star, ArrowLeftFromLine, ArrowRightFromLine, ChevronDown, Sparkles, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import ArenaErrorBoundary from '@/components/arena/ArenaErrorBoundary';
import { useArenaChannels, Channel as ArenaChannel } from '@/hooks/useArenaChannels';

// Import channel components
import AnnouncementsChannel from '@/components/arena/AnnouncementsChannel';
import ChatChannel from '@/components/arena/ChatChannel';
import HackathonChannel from '@/components/arena/HackathonChannel';
import DirectMessageChannel from '@/components/arena/DirectMessageChannel';
import ShowcaseChannel from '@/components/arena/ShowcaseChannel';
import RulesChannel from '@/components/arena/RulesChannel';
import StartHereChannel from '@/components/arena/StartHereChannel';
// Import NirvanaChannel
import NirvanaChannel from '@/components/arena/NirvanaChannel';

// Types
type ArenaTab = 'Chat' | 'Showcase' | 'Leaderboard';
type TimeFilter = 'Weekly' | 'Monthly' | 'All Time';

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  badges: string[];
  points: number;
  trend: 'up' | 'down' | 'none';
  isOnline: boolean;
  role: string;
}

const ArenaPage: React.FC = () => {
  const { theme } = useTheme();
  const { channels, loading, error } = useArenaChannels();
  const [activeTab, setActiveTab] = useState<ArenaTab>('Chat');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Set initial channel
  useEffect(() => {
    if (!loading && !error && !activeChannelId && Object.keys(channels).length > 0) {
      const firstGroupKey = Object.keys(channels)[0];
      if (firstGroupKey && channels[firstGroupKey]?.length > 0) {
        setActiveChannelId(channels[firstGroupKey][0]._id);
      }
    }
  }, [channels, loading, error, activeChannelId]);


  // Listen for tab change events from AppLayout
  useEffect(() => {
    const handleTabChange = (event: CustomEvent<ArenaTab>) => {
      setActiveTab(event.detail);
    };

    const handleSidebarToggle = () => {
      setIsLeftSidebarCollapsed(prev => !prev);
    };

    window.addEventListener('arena-switch-tab', handleTabChange as EventListener);
    window.addEventListener('toggle-arena-sidebar', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('arena-switch-tab', handleTabChange as EventListener);
      window.removeEventListener('toggle-arena-sidebar', handleSidebarToggle);
    };
  }, []);

  // Toggle group collapse
  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const getChannelIcon = (channel: ArenaChannel) => {
    switch (channel.name) {
      case 'nirvana': return <Sparkles className="w-4 h-4" />;
      case 'start-here': return <BookOpen className="w-4 h-4" />;
      case 'rules': return <AlertCircle className="w-4 h-4" />;
      case 'announcements': return <Volume2 className="w-4 h-4" />;
      case 'showcase': return <Sparkles className="w-4 h-4" />;
      case 'weekly-challenge': return <Trophy className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const activeChannel = activeChannelId
    ? Object.values(channels).flat().find(c => c._id === activeChannelId)
    : null;

  const renderChannelContent = () => {
    if (!activeChannel) {
      // Find and render nirvana channel by default if available
      const nirvanaChannel = Object.values(channels).flat().find(c => c.name === 'nirvana');
      if (nirvanaChannel) {
        return <NirvanaChannel />;
      }
      return <div className="flex-1 flex items-center justify-center"><p>Select a channel</p></div>;
    }

    switch (activeChannel.name) {
      case 'nirvana': return <NirvanaChannel />;
      case 'start-here': return <StartHereChannel />;
      case 'rules': return <RulesChannel />;
      case 'announcements': return <AnnouncementsChannel isAdmin={activeChannel.permissions.canMessage} />;
      case 'showcase': return <ShowcaseChannel />;
      case 'weekly-challenge': return <HackathonChannel isAdmin={activeChannel.permissions.canMessage} />;
      default:
        return (
          <ChatChannel
            channelId={activeChannel._id}
            channelName={activeChannel.name}
            canMessage={activeChannel.permissions.canMessage}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-base-100 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Arena...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-base-100 items-center justify-center text-center">
        <div>
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-4" />
          <p className="text-lg text-error mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <ArenaErrorBoundary>
      <div className="h-full flex bg-base-100">
        {/* Left Sidebar */}
        <motion.aside 
          className={cn(
            "h-full border-r border-base-300",
            "bg-base-200 transition-all duration-200 relative",
            isLeftSidebarCollapsed ? "w-0 overflow-hidden" : "w-[240px]"
          )}
          animate={{ width: isLeftSidebarCollapsed ? 0 : 240 }}
        >
          {/* Channel Groups */}
          <div className="space-y-2 py-2">
            {Object.entries(channels).map(([group, channelList]) => (
              <div key={group} className="px-2">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroupCollapse(group)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1 rounded-md",
                    "hover:bg-base-300 transition-colors",
                    "justify-between"
                  )}
                >
                  <span className="text-xs font-semibold text-base-content/70 uppercase">
                    {group.replace('-', ' ')}
                  </span>
                  <motion.div
                    animate={{ rotate: collapsedGroups.includes(group) ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-base-content/60" />
                  </motion.div>
                </button>

                {/* Channels */}
                <AnimatePresence>
                  {!collapsedGroups.includes(group) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-0.5 mt-1"
                    >
                      {channelList.map((channel) => (
                        <button
                          key={channel._id}
                          onClick={() => setActiveChannelId(channel._id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                            "hover:bg-base-300 transition-colors",
                            activeChannelId === channel._id && "bg-base-300",
                            "justify-between"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="text-base-content/70">
                              {getChannelIcon(channel)}
                            </div>
                            <span className="text-sm text-base-content/90 truncate">
                              {channel.name}
                            </span>
                          </div>
                          {channel.unreadCount && (
                            <span className="text-xs bg-primary text-primary-content px-1.5 py-0.5 rounded-full">
                              {channel.unreadCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Main Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Channel Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {renderChannelContent()}
            </div>
          </div>
        </div>
      </div>
    </ArenaErrorBoundary>
  );
};

export default ArenaPage; 