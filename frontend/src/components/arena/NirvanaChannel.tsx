import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';
import { useArenaChannels } from '@/hooks/useArenaChannels';

// UI & Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

// Icons
import {
  MessageSquare, Trophy, Users, Code, Sparkles, Star, Hash, TrendingUp, Zap, Search, Calendar, Bell, Heart, Share2,
  ExternalLink, Award, Briefcase, Globe,
  ChevronDown, ChevronRight, Plus, Eye, Bookmark, BarChart3,
  Clock, CheckCircle, Flame, 
} from 'lucide-react';

// Enhanced interfaces for different feed types
interface FeedItem {
  id: string;
  type: 'news' | 'update' | 'member' | 'hackathon' | 'tool' | 'partnership' | 'achievement' | 'showcase';
  title: string;
  content: string;
  timestamp: Date;
  author?: { name: string; avatar?: string; role: string; };
  metadata?: {
    points?: number;
    badge?: string;
    projectName?: string;
    challengeName?: string;
    rank?: number;
    company?: string;
    toolName?: string;
    hackathonName?: string;
    prize?: string;
    participants?: number;
    category?: string;
    tags?: string[];
    image?: string;
    link?: string;
    deadline?: Date;
    status?: string;
    progress?: number;
    rating?: number;
    views?: number;
    streak?: number;
    problemsSolved?: number;
  };
  reactions?: { likes: number; shares: number; bookmarks: number; };
  isPinned?: boolean;
  isVerified?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface TrendingTopic {
  id: string;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

const NirvanaChannel: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Enhanced feed data with valuable content
  const feedItems: FeedItem[] = [
    {
      id: '1',
      type: 'hackathon',
      title: '🚀 AI Innovation Hackathon 2024',
      content: 'Join our biggest hackathon yet! Build AI-powered solutions and compete for $50,000 in prizes.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      metadata: {
        hackathonName: 'AI Innovation 2024',
        prize: '$50,000',
        participants: 250,
        category: 'AI/ML',
        tags: ['AI', 'Machine Learning', 'Innovation'],
        link: '#',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        status: 'active'
      },
      reactions: { likes: 89, shares: 23, bookmarks: 45 },
      isPinned: true,
      isVerified: true,
      priority: 'high'
    },
    {
      id: '2',
      type: 'news',
      title: '🎉 Community Milestone: 10,000 Members!',
      content: 'We\'ve reached 10,000 active developers in our community! Thank you for being part of this amazing journey.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
      metadata: {
        category: 'Community Milestone',
        tags: ['Milestone', 'Community', 'Growth'],
        progress: 100
      },
      reactions: { likes: 234, shares: 89, bookmarks: 67 },
      isVerified: true,
      priority: 'high'
    },
    {
      id: '3',
      type: 'tool',
      title: '🛠️ New Tool: CodeGPT Assistant',
      content: 'Introducing our AI-powered code assistant. Get instant help with debugging, refactoring, and code reviews.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      metadata: {
        toolName: 'CodeGPT Assistant',
        category: 'Development Tools',
        tags: ['AI', 'Code Assistant', 'Productivity'],
        link: '#',
        rating: 4.9,
        views: 890
      },
      reactions: { likes: 234, shares: 89, bookmarks: 123 },
      isVerified: true
    },
    {
      id: '4',
      type: 'member',
      title: '🏆 Sarah Chen Achieves 100-Day Streak!',
      content: 'Sarah Chen has maintained a 100-day learning streak! Consistency is key to mastery.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      author: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png', role: 'Senior Developer' },
      metadata: {
        streak: 100,
        problemsSolved: 45,
        category: 'Achievement',
        tags: ['Streak', 'Consistency', 'Learning']
      },
      reactions: { likes: 89, shares: 34, bookmarks: 23 }
    },
    {
      id: '5',
      type: 'showcase',
      title: '💡 Trending Project: EcoTracker',
      content: 'EcoTracker is trending with 500+ upvotes! A sustainability tracking app built with React Native and Firebase.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      author: { name: 'Maria Garcia', avatar: 'https://github.com/shadcn.png', role: 'Developer' },
      metadata: {
        projectName: 'EcoTracker',
        category: 'Mobile App',
        tags: ['React Native', 'Firebase', 'Sustainability'],
        link: '#',
        views: 2500
      },
      reactions: { likes: 67, shares: 28, bookmarks: 19 }
    },
    {
      id: '6',
      type: 'hackathon',
      title: '⏰ Registration Deadline: Web3 Challenge',
      content: 'Only 24 hours left to register for the Web3 Development Challenge! Don\'t miss out on $25,000 in prizes.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      metadata: {
        hackathonName: 'Web3 Challenge',
        prize: '$25,000',
        participants: 1200,
        category: 'Blockchain',
        tags: ['Web3', 'Blockchain', 'Smart Contracts'],
        link: '#',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
        status: 'deadline'
      },
      reactions: { likes: 156, shares: 67, bookmarks: 89 },
      isVerified: true,
      priority: 'high'
    },
    {
      id: '7',
      type: 'member',
      title: '👋 Welcome Alex Rodriguez!',
      content: 'Alex Rodriguez joined as a System Design Expert. He has 5+ years of experience building scalable systems.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16),
      author: { name: 'Alex Rodriguez', avatar: 'https://github.com/shadcn.png', role: 'System Design Expert' },
      metadata: {
        category: 'New Member',
        tags: ['System Design', 'Scalability', 'Expert']
      },
      reactions: { likes: 45, shares: 12, bookmarks: 8 }
    }
  ];

  const trendingTopics: TrendingTopic[] = [
    { id: '1', name: 'React 19', count: 234, trend: 'up', category: 'Frontend' },
    { id: '2', name: 'AI Development', count: 189, trend: 'up', category: 'AI/ML' },
    { id: '3', name: 'System Design', count: 156, trend: 'stable', category: 'Architecture' },
    { id: '4', name: 'Web3', count: 98, trend: 'down', category: 'Blockchain' },
    { id: '5', name: 'DevOps', count: 87, trend: 'up', category: 'Infrastructure' }
  ];

  const leaderboard = [
    { id: '1', name: 'CodeMaster', avatar: 'https://github.com/shadcn.png', points: 1520, rank: 1 },
    { id: '2', name: 'AlgoNinja', avatar: '', points: 1340, rank: 2 },
    { id: '3', name: 'TechExpert', avatar: '', points: 1200, rank: 3 },
  ];
  
  const upcomingEvents = [
    { id: '1', name: 'Weekly Hackathon', date: '2024-07-20T18:00:00Z', description: 'Compete in our weekly coding challenge!', participants: 45 },
    { id: '2', name: 'AMA with AI Experts', date: '2024-07-22T16:00:00Z', description: 'Ask Me Anything with top AI professionals.', participants: 120 },
    { id: '3', name: 'Code Review Workshop', date: '2024-07-24T14:00:00Z', description: 'Learn best practices for code reviews.', participants: 67 },
  ];

  const { channels, loading: channelsLoading } = useArenaChannels();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [userChannelStatuses, setUserChannelStatuses] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [joinChannelsOpen, setJoinChannelsOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedFilter, setFeedFilter] = useState<string>('all');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await ApiService.getUserChannelStatuses(getToken);
        const map: Record<string, string> = {};
        (res.data || []).forEach((s: any) => { map[s.channelId] = s.status; });
        setUserChannelStatuses(map);
      } catch (err) { setUserChannelStatuses({}); }
    };
    fetchStatuses();
  }, [getToken, refreshKey]);

  const allChannels = Object.values(channels).flat();
  const joinableChannels = allChannels.filter(c => {
    if (c.parentChannelId && c.parentChannelId !== null) {
      return false;
    }
    
    const userStatus = userChannelStatuses[c._id];
    
    if (!userStatus) {
      return true;
    }
    
    if (userStatus === 'banned' || userStatus === 'kicked') {
      return false;
    }
    
    return userStatus !== 'approved';
  });

  const groupedChannels = React.useMemo(() => {
    const groups: Record<string, typeof joinableChannels> = {};
    joinableChannels.forEach((ch) => {
      if (!groups[ch.group]) groups[ch.group] = [];
      groups[ch.group].push(ch);
    });
    return groups;
  }, [joinableChannels]);

  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groupedChannels;
    const q = search.toLowerCase();
    const filtered: typeof groupedChannels = {};
    Object.entries(groupedChannels).forEach(([group, chans]) => {
      const matches = chans.filter(ch => ch.name.toLowerCase().includes(q) || (ch as any).description?.toLowerCase().includes(q));
      if (matches.length) filtered[group] = matches;
    });
    return filtered;
  }, [groupedChannels, search]);

  const trendingChannels = [...joinableChannels].sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0)).slice(0, 2);

  const onboardingSteps = [
    { id: 'join', label: 'Join a channel' },
    { id: 'intro', label: 'Introduce yourself' },
    { id: 'explore', label: 'Explore projects' },
    { id: 'profile', label: 'Complete your profile' },
  ];
  const joinedAny = allChannels.some(c => userChannelStatuses[c._id] === 'approved');
  const [completed] = useState<string[]>(joinedAny ? ['join'] : []);

  const handleToggle = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleJoinRequest = async () => {
    setRequesting(true);
    setRequestStatus(null);
    try {
      const toRequest = Object.entries(selected).filter(([, v]) => v).map(([id]) => id);
      if (!user || toRequest.length === 0) {
        setRequestStatus('Select at least one channel.');
        setRequesting(false);
        return;
      }
      await Promise.all(toRequest.map((channelId) => ApiService.requestJoinChannel(channelId, getToken)));
      setRequestStatus('Join request(s) sent! Await moderator approval.');
      setSelected({});
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setRequestStatus('Failed to send join request.');
    } finally {
      setRequesting(false);
    }
  };

  const getFeedItemIcon = (type: string) => {
    switch (type) {
      case 'news': return <Bell className="w-4 h-4" />;
      case 'update': return <Zap className="w-4 h-4" />;
      case 'member': return <Users className="w-4 h-4" />;
      case 'hackathon': return <Trophy className="w-4 h-4" />;
      case 'tool': return <Briefcase className="w-4 h-4" />;
      case 'partnership': return <Globe className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      case 'showcase': return <Sparkles className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getFeedItemColor = (type: string) => {
    switch (type) {
      case 'news': return 'text-white bg-blue-500';
      case 'update': return 'text-white bg-purple-500';
      case 'member': return 'text-white bg-green-500';
      case 'hackathon': return 'text-white bg-orange-500';
      case 'tool': return 'text-white bg-indigo-500';
      case 'partnership': return 'text-white bg-cyan-500';
      case 'achievement': return 'text-white bg-yellow-500';
      case 'showcase': return 'text-white bg-pink-500';
      default: return 'text-white bg-gray-500';
    }
  };

  const filteredFeedItems = feedFilter === 'all' 
    ? feedItems 
    : feedItems.filter(item => item.type === feedFilter);

  return (
    <div className="flex flex-col h-full bg-base-100 text-base-content">
      {/* Clean Header */}
      <div className="flex items-center justify-between h-10 px-4 border-b border-base-300 bg-base-100 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary-content" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-base-content">
              Nirvana
            </h2>
            <p className="text-xs text-base-content/70">Community Feed</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-72 min-w-[260px] max-w-xs flex flex-col gap-4 overflow-y-auto pr-2">
          
          {/* Join Channels Card */}
          <div className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <Hash className="w-3.5 h-3.5 text-primary-content" />
                </div>
                <span className="text-sm font-semibold text-base-content">Join Channels</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-base-200" onClick={() => setJoinChannelsOpen((v) => !v)}>
                {joinChannelsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </Button>
            </div>
            {joinChannelsOpen && (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/50" />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search channels..."
                    className="w-full bg-base-200 border border-base-300 rounded-md pl-8 pr-3 py-2 text-xs focus:bg-base-100 focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                
                {trendingChannels.length > 0 && !search && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-base-content/60 mb-1.5">TRENDING</h4>
                    <div className="flex flex-col gap-1">
                      {trendingChannels.map(ch => (
                        <div key={ch._id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-base-200 text-base-content/80 text-xs">
                          <Hash className="w-3 h-3" /> #{ch.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {channelsLoading ? (
                  <div className="text-center text-xs text-base-content/60 py-3">Loading...</div>
                ) : Object.keys(filteredGroups).length === 0 ? (
                  <div className="text-center text-xs text-base-content/60 p-3 bg-base-200 rounded-md">
                    <p>No joinable channels found.</p>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handleJoinRequest(); }}>
                    <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                      {Object.entries(filteredGroups).map(([group, chans]) => (
                        <div key={group}>
                          <h4 className="text-xs font-medium text-base-content/60 mb-1.5 capitalize">{group.replace(/-/g, ' ')}</h4>
                          <div className="flex flex-col gap-1">
                            {chans.map((ch) => (
                              <label key={ch._id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-base-200 transition-colors duration-200">
                                <input type="checkbox" checked={!!selected[ch._id]} onChange={() => handleToggle(ch._id)} className="rounded border-base-300 text-primary focus:ring-primary" disabled={requesting} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium truncate">#{ch.name}</span>
                                    {(ch.unreadCount ?? 0) > 0 && (
                                      <StatusBadge
                                        leftLabel=""
                                        rightLabel={(ch.unreadCount ?? 0).toString()}
                                        status="success"
                                        className="text-xs px-1.5 py-0.5"
                                      />
                                    )}
                                  </div>
                                  {(ch as any).description && <p className="text-xs text-base-content/60 truncate mt-0.5">{(ch as any).description}</p>}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button type="submit" className="w-full btn-primary" size="sm" disabled={requesting || Object.values(selected).every(v => !v)}>
                      {requesting ? 'Requesting...' : 'Request to Join'}
                    </Button>
                    {requestStatus && <p className="mt-2 text-xs text-center text-success font-medium">{requestStatus}</p>}
                  </form>
                )}
              </>
            )}
          </div>
          
          {/* Upcoming Events Card */}
          <div className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-primary-content" />
              </div>
              <span className="text-sm font-semibold text-base-content">Upcoming Events</span>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-3 rounded-md border border-base-300 bg-base-200 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="font-medium text-base-content text-xs">{event.name}</p>
                    <StatusBadge
                      leftLabel=""
                      rightLabel={`${event.participants} joined`}
                      status="success"
                      className="text-xs px-1.5 py-0.5"
                    />
                  </div>
                  <p className="text-xs text-base-content/60 mb-1.5">{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  <p className="text-xs text-base-content/80 mb-2">{event.description}</p>
                  <Button size="sm" className="h-6 px-2 text-xs btn-primary" variant="default">Learn More</Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Contributors Card */}
          <div className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-primary-content" />
              </div>
              <span className="text-sm font-semibold text-base-content">Top Contributors</span>
            </div>
            <div className="space-y-1.5">
              {leaderboard.map((u) => (
                <div key={u.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-base-200 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-medium">
                    {u.rank}
                  </div>
                  <Avatar className="w-6 h-6"><AvatarImage src={u.avatar} /><AvatarFallback className="bg-base-300 text-base-content text-xs">{u.name.charAt(0)}</AvatarFallback></Avatar>
                  <span className="font-medium text-base-content flex-1 truncate text-xs">{u.name}</span>
                  <span className="text-xs text-base-content/70 font-medium flex-shrink-0">{u.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Feed Section */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* Feed Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-sm font-semibold text-base-content">
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}
              </h1>
              <p className="text-xs text-base-content/60">Stay updated with the latest from the Zemon community</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Feed Filters */}
          <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
            <button
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                feedFilter === 'all' 
                  ? "bg-primary text-primary-content shadow-sm" 
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
              )}
              onClick={() => setFeedFilter('all')}
            >
              All
            </button>
            <button
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                feedFilter === 'hackathon' 
                  ? "bg-primary text-primary-content shadow-sm" 
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
              )}
              onClick={() => setFeedFilter('hackathon')}
            >
              Hackathons
            </button>
            <button
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                feedFilter === 'news' 
                  ? "bg-primary text-primary-content shadow-sm" 
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
              )}
              onClick={() => setFeedFilter('news')}
            >
              News
            </button>
            <button
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                feedFilter === 'tool' 
                  ? "bg-primary text-primary-content shadow-sm" 
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
              )}
              onClick={() => setFeedFilter('tool')}
            >
              Tools
            </button>
            <button
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                feedFilter === 'member' 
                  ? "bg-primary text-primary-content shadow-sm" 
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
              )}
              onClick={() => setFeedFilter('member')}
            >
              Members
            </button>
            <button
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                feedFilter === 'showcase' 
                  ? "bg-primary text-primary-content shadow-sm" 
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"
              )}
              onClick={() => setFeedFilter('showcase')}
            >
              Projects
            </button>
          </div>

          {/* Feed Content */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {filteredFeedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={cn(
                  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm transition-all duration-200",
                  item.priority === 'high' && item.id !== '1' ? "border-0" : "border border-base-300",
                  item.isPinned && "ring-1 ring-primary/30 bg-primary/5"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getFeedItemColor(item.type))}>
                          {getFeedItemIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-semibold text-base-content line-clamp-1">
                              {item.title}
                            </h3>
                            {item.isVerified && (
                              <StatusBadge
                                leftIcon={CheckCircle}
                                leftLabel=""
                                rightLabel="Verified"
                                status="success"
                                className="text-xs"
                              />
                            )}
                            {item.isPinned && (
                              <StatusBadge
                                leftIcon={Bookmark}
                                leftLabel=""
                                rightLabel="Pinned"
                                status="default"
                                className="text-xs"
                              />
                            )}
                            {item.priority === 'high' && (
                              <StatusBadge
                                leftIcon={Flame}
                                leftLabel=""
                                rightLabel="Hot"
                                status="error"
                                className="text-xs"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                            {item.author && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Avatar className="w-3.5 h-3.5">
                                    <AvatarImage src={item.author.avatar} />
                                    <AvatarFallback className="text-xs">{item.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-base-content/80">{item.author.name}</span>
                                </div>
                                <span>•</span>
                              </>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {item.timestamp.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-base-200">
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-3">
                    <p className="text-base-content/80 text-xs leading-relaxed mb-3 line-clamp-2">{item.content}</p>
                    
                    {/* Compact Metadata Display */}
                    {item.metadata && (
                      <div className="space-y-2">
                        {/* Important Metadata Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.metadata.prize && (
                            <StatusBadge
                              leftIcon={Trophy}
                              leftLabel=""
                              rightLabel={item.metadata.prize}
                              status="success"
                              className="text-xs"
                            />
                          )}
                          {item.metadata.participants && (
                            <StatusBadge
                              leftIcon={Users}
                              leftLabel=""
                              rightLabel={item.metadata.participants.toString()}
                              status="success"
                              className="text-xs"
                            />
                          )}
                          {item.metadata.rating && (
                            <StatusBadge
                              leftIcon={Star}
                              leftLabel=""
                              rightLabel={`${item.metadata.rating}/5`}
                              status="success"
                              className="text-xs"
                            />
                          )}
                          {item.metadata.streak && (
                            <StatusBadge
                              leftIcon={Flame}
                              leftLabel=""
                              rightLabel={`${item.metadata.streak}d`}
                              status="success"
                              className="text-xs"
                            />
                          )}
                          {item.metadata.views && (
                            <StatusBadge
                              leftIcon={Eye}
                              leftLabel=""
                              rightLabel={item.metadata.views > 1000 ? `${(item.metadata.views/1000).toFixed(1)}k` : item.metadata.views.toString()}
                              status="default"
                              className="text-xs"
                            />
                          )}
                          {item.metadata.deadline && (
                            <StatusBadge
                              leftIcon={Clock}
                              leftLabel=""
                              rightLabel={item.metadata.deadline.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              status="error"
                              className="text-xs"
                            />
                          )}
                        </div>

                        {/* Tags */}
                        {item.metadata.tags && (
                          <div className="flex flex-wrap gap-1">
                            {item.metadata.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs border-none">
                                #{tag}
                              </Badge>
                            ))}
                            {item.metadata.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs border-none">
                                +{item.metadata.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compact Action Buttons */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-base-300">
                      <div className="flex items-center gap-1.5">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-base-content/60 hover:text-base-content">
                          <Heart className="w-3 h-3 mr-1" />
                          {item.reactions?.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-base-content/60 hover:text-base-content">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {item.reactions?.shares || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-base-content/60 hover:text-base-content">
                          <Bookmark className="w-3 h-3 mr-1" />
                          {item.reactions?.bookmarks || 0}
                        </Button>
                      </div>
                      {item.metadata?.link && (
                        <Button variant="secondary" size="sm" className="h-6 px-2 text-xs border-none">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Learn More
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Right Sidebar */}
        <motion.aside variants={containerVariants} initial="hidden" animate="visible" className="w-64 space-y-4 hidden lg:flex flex-col overflow-y-auto pr-2">
          
          {/* Trending Topics Card */}
          <motion.div variants={itemVariants} className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary-content" />
              </div>
              <h3 className="text-sm font-semibold text-base-content">Trending Topics</h3>
            </div>
            <div className="space-y-1.5">
              {trendingTopics.map((topic) => (
                <a href="#" key={topic.id} className="flex items-center justify-between p-2 rounded-md hover:bg-base-200 transition-colors group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-base-200 rounded-md flex items-center justify-center">
                      <Hash className="w-3 h-3 text-base-content/70" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-base-content">{topic.name}</span>
                      <p className="text-xs text-base-content/60">{topic.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-base-content/60">{topic.count}</span>
                    <span className={cn("text-xs", topic.trend === 'up' && "text-success", topic.trend === 'down' && "text-error", topic.trend === 'stable' && "text-base-content/40")}>
                      {topic.trend === 'up' && '▲'} {topic.trend === 'down' && '▼'} {topic.trend === 'stable' && '—'}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div variants={itemVariants} className="bg-base-100 border border-base-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-primary-content" />
              </div>
              <h3 className="text-sm font-semibold text-base-content">Community Stats</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-base-200 rounded-md">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-base-content/70" />
                  <span className="text-xs font-medium text-base-content">Active Members</span>
                </div>
                <span className="text-sm font-semibold text-base-content">2,847</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-base-200 rounded-md">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-base-content/70" />
                  <span className="text-xs font-medium text-base-content">Projects Shared</span>
                </div>
                <span className="text-sm font-semibold text-base-content">156</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-base-200 rounded-md">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-base-content/70" />
                  <span className="text-xs font-medium text-base-content">Hackathons</span>
                </div>
                <span className="text-sm font-semibold text-base-content">24</span>
              </div>
            </div>
          </motion.div>
        </motion.aside>
      </div>
    </div>
  );
};

export default NirvanaChannel;