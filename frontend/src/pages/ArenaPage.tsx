import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Hash, Volume2, User, Trophy, Crown, Star, ArrowLeftFromLine, ArrowRightFromLine, ChevronDown, Sparkles, BookOpen, AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import ArenaErrorBoundary from '@/components/arena/ArenaErrorBoundary';
import { useArenaChannels, Channel as ArenaChannel } from '@/hooks/useArenaChannels';
import { useArenaChat } from '@/hooks/useArenaChat';
import { useUser } from '@clerk/clerk-react';

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

// Helper: Build parent/sub-channel tree for each group
function buildChannelTree(channelList: ArenaChannel[]) {
  const parents = channelList.filter(c => !c.parentChannelId);
  const children = channelList.filter(c => c.parentChannelId);
  const childMap: Record<string, ArenaChannel[]> = {};
  children.forEach(child => {
    if (!child.parentChannelId) return;
    if (!childMap[child.parentChannelId]) childMap[child.parentChannelId] = [];
    childMap[child.parentChannelId].push(child);
  });
  return parents.map(parent => ({
    parent,
    children: childMap[parent._id] || []
  }));
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
  const [showNirvana, setShowNirvana] = useState(true); // Show Nirvana by default
  const { user } = useUser();
  const [broadcastText, setBroadcastText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const allChannels = Object.values(channels).flat();
  // Find all parent channels where user is mod/admin (canMessage)
  const canBroadcastChannels = allChannels.filter(
    c => c.permissions.canMessage && c.type === 'text' && !c.parentChannelId
  );
  // Find announcement subchannels for each parent
  const announcementSubs = allChannels.filter(
    c => c.type === 'announcement' && c.parentChannelId
  );
  // Map parent channelId to announcement subchannelId
  const parentToAnnouncement: Record<string, string> = {};
  announcementSubs.forEach(sub => {
    if (sub.parentChannelId) parentToAnnouncement[sub.parentChannelId] = sub._id;
  });
  // Send message to each selected announcement subchannel
  const handleBroadcast = async () => {
    if (!broadcastText.trim() || selectedChannels.length === 0) return;
    setBroadcasting(true);
    try {
      await Promise.all(selectedChannels.map(parentId => {
        const announcementId = parentToAnnouncement[parentId];
        if (!announcementId) return;
        // Use [OFFICIAL] prefix for visual distinction
        const msg = `[OFFICIAL]\n${broadcastText.trim()}`;
        // Use sendMessage from useArenaChat for each subchannel
        const { sendMessage } = useArenaChat(announcementId);
        sendMessage(msg);
      }));
      setBroadcastText('');
      setSelectedChannels([]);
    } finally {
      setBroadcasting(false);
    }
  };

  // Set initial channel
  useEffect(() => {
    if (!loading && !error && Object.keys(channels).length > 0) {
      // If no channel is selected, show Nirvana by default
      if (!activeChannelId) {
        setShowNirvana(true);
      }
    }
  }, [channels, loading, error, activeChannelId]);

  // When a channel is selected, hide Nirvana
  useEffect(() => {
    if (activeChannelId) setShowNirvana(false);
  }, [activeChannelId]);

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
    if (showNirvana) {
      return <NirvanaChannel />;
    }
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
          {/* Nirvana Page Button */}
          <div className="px-2 py-2">
            <button
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                "hover:bg-base-300 transition-colors",
                showNirvana && !activeChannelId && "bg-base-300"
              )}
              onClick={() => {
                setActiveChannelId(null);
                setShowNirvana(true);
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-base-content/90 font-semibold">Nirvana</span>
            </button>
          </div>
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

                {/* Channels (parent/sub-channel tree) */}
                <AnimatePresence>
                  {!collapsedGroups.includes(group) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-0.5 mt-1"
                    >
                      {buildChannelTree(channelList).map(({ parent, children }) => (
                        <div key={parent._id}>
                        <button
                            onClick={() => setActiveChannelId(parent._id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                            "hover:bg-base-300 transition-colors",
                              activeChannelId === parent._id && "bg-base-300",
                            "justify-between"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="text-base-content/70">
                                {getChannelIcon(parent)}
                              </div>
                              <span className="text-sm text-base-content/90 truncate font-semibold">
                                {parent.name}
                              </span>
                            </div>
                            {parent.unreadCount && (
                              <span className="text-xs bg-primary text-primary-content px-1.5 py-0.5 rounded-full">
                                {parent.unreadCount}
                              </span>
                            )}
                          </button>
                          {/* Sub-channels */}
                          {children.length > 0 && (
                            <div className="ml-6 border-l border-base-300 pl-2 mt-0.5 space-y-0.5">
                              {children.map(child => (
                                <button
                                  key={child._id}
                                  onClick={() => setActiveChannelId(child._id)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                                    "hover:bg-base-300 transition-colors",
                                    activeChannelId === child._id && "bg-base-300",
                                    "justify-between"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="text-base-content/60">
                                      {getChannelIcon(child)}
                                    </div>
                                    <span className="text-sm text-base-content/80 truncate">
                                      {child.name}
                            </span>
                          </div>
                                  {child.unreadCount && (
                            <span className="text-xs bg-primary text-primary-content px-1.5 py-0.5 rounded-full">
                                      {child.unreadCount}
                            </span>
                          )}
                        </button>
                              ))}
                            </div>
                          )}
                        </div>
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
            {/* Broadcast Announcement UI (only for mods/admins) */}
            {canBroadcastChannels.length > 0 && (
              <div className="p-4 border-b border-base-300 bg-base-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-base-content">Broadcast Announcement</span>
                </div>
                <textarea
                  className="w-full border rounded p-2 text-base-content bg-base-100"
                  rows={2}
                  placeholder="Enter announcement..."
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  disabled={broadcasting}
                />
                <div className="flex items-center gap-2">
                  <select
                    multiple
                    className="border rounded p-1 text-base-content bg-base-100"
                    value={selectedChannels}
                    onChange={e => setSelectedChannels(Array.from(e.target.selectedOptions, o => o.value))}
                    disabled={broadcasting}
                  >
                    {canBroadcastChannels.map(ch => (
                      <option key={ch._id} value={ch._id}>{ch.name}</option>
                    ))}
                  </select>
                  <Button
                    className="ml-2"
                    onClick={handleBroadcast}
                    disabled={broadcasting || !broadcastText.trim() || selectedChannels.length === 0}
                  >
                    Post Announcement
                  </Button>
                </div>
                <span className="text-xs text-base-content/60">Only moderators/admins can broadcast. Announcement will be posted to the announcement subchannel of each selected channel.</span>
              </div>
            )}
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