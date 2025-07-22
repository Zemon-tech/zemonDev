import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Search, Hash, Volume2, User, Trophy, Crown, Star, ArrowLeftFromLine, ArrowRightFromLine, ChevronDown, Sparkles, BookOpen, AlertCircle, Loader2, PlusCircle, Settings } from 'lucide-react';
import ArenaErrorBoundary from '@/components/arena/ArenaErrorBoundary';
import { useArenaChannels, Channel as ArenaChannel } from '@/hooks/useArenaChannels';
import { useArenaChat } from '@/hooks/useArenaChat';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useUserRole } from '@/context/UserRoleContext';
import { ApiService } from '@/services/api.service';


// Import channel components
import AnnouncementsChannel from '@/components/arena/AnnouncementsChannel';
import ChatChannel from '@/components/arena/ChatChannel';
import HackathonChannel from '@/components/arena/HackathonChannel';
import ShowcaseChannel from '@/components/arena/ShowcaseChannel';
import RulesChannel from '@/components/arena/RulesChannel';
import StartHereChannel from '@/components/arena/StartHereChannel';
// Import NirvanaChannel
import NirvanaChannel from '@/components/arena/NirvanaChannel';
import AdminPage from '@/pages/AdminPage';

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userChannelStatuses, setUserChannelStatuses] = useState<Record<string, string>>({}); // channelId -> status
  const [refreshKey, setRefreshKey] = useState(0);

  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { hasAdminAccess } = useUserRole();

  const [broadcastText, setBroadcastText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    setShowNirvana(false);
    setShowAdminPanel(false);
  };
  const allChannels = Object.values(channels).flat();
  // Find all parent channels where user is mod/admin (canMessage)

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
        const { sendMessage } = useArenaChat(announcementId, userChannelStatuses);
        sendMessage(msg);
      }));
      setBroadcastText('');
      setSelectedChannels([]);
    } finally {
      setBroadcasting(false);
    }
  };

  // Fetch user channel statuses
  useEffect(() => {
    console.log('Fetching user channel statuses, isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);
    const fetchStatuses = async () => {
      try {
        const res = await ApiService.getUserChannelStatuses(getToken); // Use real getToken from useAuth
        console.log('Raw user channel status response:', res.data);
        const map: Record<string, string> = {};
        (res.data || []).forEach((s: any) => {
          map[String(s.channelId)] = s.status;
        });
        console.log('Mapped userChannelStatuses:', map);
        setUserChannelStatuses(map);
      } catch (err) {
        setUserChannelStatuses({});
        console.error('Failed to fetch user channel statuses:', err);
      }
    };
    if (isLoaded && isSignedIn) fetchStatuses();
  }, [isLoaded, isSignedIn, refreshKey]);

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
    if (showAdminPanel) {
      return <AdminPage />;
    }
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
      case 'announcements': return <AnnouncementsChannel />;
      case 'showcase': return <ShowcaseChannel />;
      case 'weekly-challenge': return <HackathonChannel />;
      default:
        // TODO: Pass UserChannelStatus to ChatChannel for membership/posting logic
        return (
          <ChatChannel
            channelId={activeChannel._id}
            channelName={activeChannel.name}
            userChannelStatuses={userChannelStatuses}
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
      <div className="h-full flex bg-base-100 relative">
        {/* Left Sidebar */}
        <motion.aside
          className={cn(
            "h-full border-r border-base-300",
            "bg-base-200 transition-all duration-200 relative",
            isLeftSidebarCollapsed ? "w-0 overflow-hidden" : "w-[240px]"
          )}
          animate={{ width: isLeftSidebarCollapsed ? 0 : 240 }}
        >
          <div className="flex flex-col h-full">
            <div className="p-2">
              {/* Nirvana Page Button */}
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                  "hover:bg-base-300 transition-colors",
                  showNirvana && "bg-base-300"
                )}
                onClick={() => {
                  setShowNirvana(true);
                  setShowAdminPanel(false);
                  setActiveChannelId(null);
                }}
                title="Nirvana"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-base-content/90 font-semibold">Nirvana</span>
              </button>

              {/* Admin Panel Button - Only visible to admins/moderators */}
              {hasAdminAccess() && (
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md mt-1",
                    "hover:bg-base-300 transition-colors",
                    showAdminPanel && "bg-base-300"
                  )}
                  onClick={() => {
                    setShowAdminPanel(true);
                    setShowNirvana(false);
                    setActiveChannelId(null);
                  }}
                  title="Admin Panel"
                >
                  <Settings className="w-4 h-4 text-warning" />
                  <span className="text-sm text-base-content/90 font-semibold">Admin Panel</span>
                </button>
              )}
            </div>

            {/* Channel Groups */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2">
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
                              onClick={() => handleChannelSelect(parent._id)}
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
                                    onClick={() => handleChannelSelect(child._id)}
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
          </div>
        </motion.aside>

        {/* Main Panel */}
        <div className="flex-1 flex h-full overflow-hidden relative">
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