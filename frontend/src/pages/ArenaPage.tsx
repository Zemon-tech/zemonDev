import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Hash, Volume2, User, Trophy, Crown, Star, ArrowLeftFromLine, ArrowRightFromLine, ChevronDown, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

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
type ChannelGroup = 'GETTING STARTED' | 'COMMUNITY' | 'HACKATHONS' | 'DIRECT MESSAGES';
type ArenaTab = 'Chat' | 'Showcase' | 'Leaderboard';
type TimeFilter = 'Weekly' | 'Monthly' | 'All Time';

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  unreadCount?: number;
  group: ChannelGroup;
  showTabs?: ArenaTab[];
  description?: string;
}

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
  const [activeTab, setActiveTab] = useState<ArenaTab>('Chat');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<ChannelGroup[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('nirvana');

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
  const toggleGroupCollapse = (group: ChannelGroup) => {
    setCollapsedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  // Channel groups data
  const channelGroups: Record<ChannelGroup, Channel[]> = {
    'GETTING STARTED': [
      { id: 'nirvana', name: 'nirvana', icon: <Sparkles />, group: 'GETTING STARTED' },
      { id: 'start-here', name: 'start-here', icon: <BookOpen />, group: 'GETTING STARTED' },
      { id: 'rules', name: 'rules', icon: <AlertCircle />, group: 'GETTING STARTED' },
      { id: 'announcements', name: 'announcements', icon: <Hash />, unreadCount: 2, group: 'GETTING STARTED' },
    ],
    'COMMUNITY': [
      { id: 'general-chat', name: 'general-chat', icon: <Hash />, group: 'COMMUNITY' },
      { id: 'showcase', name: 'showcase', icon: <Sparkles />, unreadCount: 5, group: 'COMMUNITY' },
    ],
    'HACKATHONS': [
      { id: 'weekly-challenge', name: 'weekly-challenge', icon: <Trophy />, group: 'HACKATHONS' },
      { id: 'hackathon-chat', name: 'hackathon-chat', icon: <Hash />, group: 'HACKATHONS' },
    ],
    'DIRECT MESSAGES': [
      { id: 'codemaster', name: 'CodeMaster', icon: <User />, unreadCount: 1, group: 'DIRECT MESSAGES' },
      { id: 'techexpert', name: 'TechExpert', icon: <User />, group: 'DIRECT MESSAGES' },
    ],
  };

  // Sample leaderboard data
  const leaderboardUsers: LeaderboardUser[] = [
    {
      rank: 1,
      username: 'CodeMaster',
      avatar: 'https://github.com/shadcn.png',
      badges: ['Champion', 'Streak'],
      points: 15420,
      trend: 'up',
      isOnline: true,
      role: 'Expert'
    },
    {
      rank: 2,
      username: 'AlgoNinja',
      avatar: 'https://github.com/shadcn.png',
      badges: ['Expert', 'Speed'],
      points: 14950,
      trend: 'down',
      isOnline: true,
      role: 'Expert'
    }
  ];

  // Get current channel
  const currentChannel = Object.values(channelGroups)
    .flat()
    .find(channel => channel.id === activeChannel);

  // Check if tab should be visible for current channel
  const isTabVisible = (tab: ArenaTab) => {
    return currentChannel?.showTabs?.includes(tab) || false;
  };

  return (
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
          {(Object.keys(channelGroups) as ChannelGroup[]).map((group) => (
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
                <span className="text-xs font-semibold text-base-content/70">
                  {group}
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
                    {channelGroups[group].map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md",
                          "hover:bg-base-300 transition-colors",
                          activeChannel === channel.id && "bg-base-300",
                          "justify-between"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="text-base-content/70">
                            {channel.icon}
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
            {activeChannel === 'nirvana' && <NirvanaChannel />}
            {activeChannel === 'start-here' && <StartHereChannel />}
            {activeChannel === 'rules' && <RulesChannel />}
            {activeChannel === 'announcements' && <AnnouncementsChannel isAdmin={true} />}
            {activeChannel === 'general-chat' && <ChatChannel channelName="general-chat" description="General discussion" />}
            {activeChannel === 'showcase' && <ShowcaseChannel />}
            {activeChannel === 'weekly-challenge' && <HackathonChannel isAdmin={true} />}
            {activeChannel === 'hackathon-chat' && <ChatChannel channelName="hackathon-chat" description="Hackathon discussions" />}
            {activeChannel === 'codemaster' && (
              <DirectMessageChannel
                recipientName="CodeMaster"
                recipientAvatar="https://github.com/shadcn.png"
                recipientStatus="online"
                recipientRole="Expert"
              />
            )}
            {activeChannel === 'techexpert' && (
              <DirectMessageChannel
                recipientName="TechExpert"
                recipientAvatar="https://github.com/shadcn.png"
                recipientStatus="away"
                recipientRole="Advanced"
              />
            )}
            {!Object.values(channelGroups).flat().find(channel => channel.id === activeChannel) && <NirvanaChannel />}

            {/* Leaderboard View */}
            {activeTab === 'Leaderboard' && isTabVisible('Leaderboard') && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-primary" />
                    <div>
                      <h1 className="text-2xl font-bold text-base-content">Leaderboard</h1>
                      <p className="text-sm text-base-content/70">Top performers in the arena</p>
                    </div>
                  </div>

                  {/* Time Filter */}
                  <div className="flex gap-2 bg-base-200 rounded-lg p-1">
                    {(['Weekly', 'Monthly', 'All Time'] as TimeFilter[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTimeFilter(filter)}
                        className={cn(
                          "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                          timeFilter === filter
                            ? "bg-base-300 text-base-content"
                            : "text-base-content/70 hover:text-base-content"
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaderboard List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-2">
                    {leaderboardUsers.map((user) => (
                      <div
                        key={user.username}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg",
                          "bg-base-200 hover:bg-base-300 transition-colors"
                        )}
                      >
                        {/* Rank */}
                        <div className="w-8 text-center font-bold text-lg text-base-content">
                          {user.rank === 1 && <Crown className="w-6 h-6 text-yellow-500" />}
                          {user.rank === 2 && <Trophy className="w-6 h-6 text-gray-400" />}
                          {user.rank === 3 && <Star className="w-6 h-6 text-amber-700" />}
                          {user.rank > 3 && user.rank}
                        </div>

                        {/* User Info */}
                        <Avatar className="w-10 h-10">
                          <img src={user.avatar} alt={user.username} />
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base-content">{user.username}</span>
                            {user.badges.map((badge) => (
                              <span
                                key={badge}
                                className="px-2 py-0.5 rounded-full text-xs bg-primary text-primary-content"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-base-content/70">{user.role}</span>
                        </div>

                        {/* Points */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-bold text-base-content">{user.points.toLocaleString()}</div>
                            <div className="text-xs text-base-content/70">points</div>
                          </div>
                          {user.trend === 'up' && <div className="text-success">↑</div>}
                          {user.trend === 'down' && <div className="text-error">↓</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <AnimatePresence>
          {!isRightSidebarCollapsed && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full border-l border-base-300 bg-base-200 relative"
            >
              {/* Collapse Right Sidebar Button */}
              <button
                onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
                className="absolute -left-3 top-[60px] bg-base-200 border border-base-300 rounded-full p-1 z-50 hover:bg-base-300 transition-colors"
              >
                <ArrowRightFromLine className="w-4 h-4 text-base-content" />
              </button>

              {/* Panel Content */}
              <div className="p-4 space-y-6">
                {/* Search Members */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="w-full bg-base-300 text-sm rounded-md pl-8 pr-3 py-1.5 text-base-content placeholder:text-base-content/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                  />
                </div>

                {/* Members List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-base-content">Members</h3>
                    <span className="text-xs text-base-content/70">{leaderboardUsers.length}</span>
                  </div>
                  <div className="space-y-1">
                    {leaderboardUsers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center gap-2 p-2 rounded hover:bg-base-300 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <img src={user.avatar} alt={user.username} />
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-base-content">{user.username}</div>
                          <div className="text-xs text-base-content/70">{user.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Right Sidebar Button (when collapsed) */}
        {isRightSidebarCollapsed && (
          <button
            onClick={() => setIsRightSidebarCollapsed(false)}
            className="absolute right-2 top-[60px] bg-base-200 border border-base-300 rounded-full p-1 z-50 hover:bg-base-300 transition-colors"
          >
            <ArrowLeftFromLine className="w-4 h-4 text-base-content" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ArenaPage; 