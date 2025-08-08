import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useArenaChannels } from '@/hooks/useArenaChannels';
import { ApiService } from '@/services/api.service';
import { 
  getNirvanaFeed, 
  updateNirvanaReaction,
  createNirvanaHackathon,
  createNirvanaNews,
  createNirvanaTool,
  type INirvanaFeedItem,
  type INirvanaFeedResponse,
  type INirvanaHackathonData,
  type INirvanaNewsData,
  type INirvanaToolData
} from '@/lib/nirvanaApi';

// UI & Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// import { CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';

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
  type: 'hackathon' | 'news' | 'tool' | 'update' | 'member' | 'partnership' | 'achievement' | 'showcase';
  title: string;
  content: string;
  timestamp: Date;
  author?: { name?: string; username?: string; avatar?: string; profilePicture?: string; role?: string };
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
  reactions: { likes: number; shares: number; bookmarks: number; };
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

  // Live feed state from backend
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number } | null>(null);

  const mapBackendItemToFeedItem = (raw: any): FeedItem => {
    return {
      id: raw.id,
      type: raw.type,
      title: raw.title,
      content: raw.content,
      timestamp: new Date(raw.timestamp),
      author: raw.author,
      metadata: raw.metadata,
      reactions: raw.reactions,
      isPinned: raw.isPinned,
      isVerified: raw.isVerified,
      priority: raw.priority,
    } as FeedItem;
  };

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostType, setCreatePostType] = useState<'hackathon' | 'news' | 'tool'>('hackathon');
  const [createPostData, setCreatePostData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
    tags: '',
    prize: '',
    participants: 0,
    deadline: '',
    toolName: '',
    rating: 5,
    views: 0,
    link: '',
  });
  const [creatingPost, setCreatingPost] = useState(false);

  // Fetch feed from backend
  useEffect(() => {
    const loadFeed = async () => {
      try {
        setFeedLoading(true);
        const res = await getNirvanaFeed(getToken, { type: feedFilter === 'all' ? undefined : (feedFilter as 'hackathon' | 'news' | 'tool'), page, limit: 10 });
        const items = res.items.map(mapBackendItemToFeedItem);
        if (page === 1) setFeedItems(items); else setFeedItems(prev => [...prev, ...items]);
        const pg = res.pagination;
        if (pg) {
          setPagination(pg);
          setHasMore(items.length === 10);
        } else {
          setHasMore(items.length === 10);
        }
      } catch (e) {
        // fail silently
      } finally {
        setFeedLoading(false);
      }
    };
    loadFeed();
  }, [getToken, feedFilter, page]);

  const handleReact = async (item: FeedItem, reactionType: 'likes' | 'shares' | 'bookmarks') => {
    if (!['hackathon', 'news', 'tool'].includes(item.type)) return;
    try {
      const result = await updateNirvanaReaction(
        item.type as 'hackathon' | 'news' | 'tool', 
        item.id, 
        reactionType, 
        'increment',
        getToken
      );
      if (result.success) {
        setFeedItems(prev => prev.map(fi => fi.id === item.id ? {
          ...fi,
          reactions: {
            likes: fi.reactions?.likes || 0,
            shares: fi.reactions?.shares || 0,
            bookmarks: fi.reactions?.bookmarks || 0,
            [reactionType]: result.newCount,
          }
        } : fi));
      }
    } catch {}
  };

  const handleCreatePost = async () => {
    if (!createPostData.title || !createPostData.content) return;
    
    setCreatingPost(true);
    try {
      let newPost: FeedItem;
      
      if (createPostType === 'hackathon') {
        const data: INirvanaHackathonData = {
          title: createPostData.title,
          content: createPostData.content,
          description: createPostData.description,
          prize: createPostData.prize,
          participants: createPostData.participants,
          category: createPostData.category,
          tags: createPostData.tags.split(',').map(t => t.trim()).filter(t => t),
          deadline: new Date(createPostData.deadline),
          status: 'active',
          hackathonName: createPostData.title,
          link: createPostData.link || undefined,
        };
        const result = await createNirvanaHackathon(data, getToken);
        newPost = mapBackendItemToFeedItem(result);
      } else if (createPostType === 'news') {
        const data: INirvanaNewsData = {
          title: createPostData.title,
          content: createPostData.content,
          category: createPostData.category,
          tags: createPostData.tags.split(',').map(t => t.trim()).filter(t => t),
          link: createPostData.link || undefined,
        };
        const result = await createNirvanaNews(data, getToken);
        newPost = mapBackendItemToFeedItem(result);
      } else {
        const data: INirvanaToolData = {
          title: createPostData.title,
          content: createPostData.content,
          toolName: createPostData.toolName,
          category: createPostData.category,
          tags: createPostData.tags.split(',').map(t => t.trim()).filter(t => t),
          rating: createPostData.rating,
          views: createPostData.views,
          link: createPostData.link || undefined,
        };
        const result = await createNirvanaTool(data, getToken);
        newPost = mapBackendItemToFeedItem(result);
      }
      
      // Add new post to the beginning of the feed
      setFeedItems(prev => [newPost, ...prev]);
      setShowCreatePost(false);
      setCreatePostData({
        title: '',
        content: '',
        description: '',
        category: '',
        tags: '',
        prize: '',
        participants: 0,
        deadline: '',
        toolName: '',
        rating: 5,
        views: 0,
        link: '',
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setCreatingPost(false);
    }
  };

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
    : feedItems.filter(item => item.type === (feedFilter as any));

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
                                      <span className="text-xs bg-primary/20 text-primary font-medium rounded-full px-1.5 py-0.5">
                                        {ch.unreadCount}
                                      </span>
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
                    <span className="text-xs bg-primary/20 text-primary font-medium rounded-full px-1.5 py-0.5">
                      {event.participants} joined
                    </span>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setShowCreatePost(true)}
              >
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
              onClick={() => { setFeedFilter('all'); setPage(1); }}
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
              onClick={() => { setFeedFilter('hackathon'); setPage(1); }}
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
              onClick={() => { setFeedFilter('news'); setPage(1); }}
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
              onClick={() => { setFeedFilter('tool'); setPage(1); }}
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
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {filteredFeedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={cn(
                  "bg-card text-card-foreground flex flex-col gap-3 rounded-lg py-3 px-4 shadow-sm transition-all duration-200",
                  item.priority === 'high' && item.id !== '1' ? "border-0" : "border border-base-300",
                  item.isPinned && "ring-1 ring-primary/30 bg-primary/5"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", getFeedItemColor(item.type))}>
                        {getFeedItemIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
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
                                <Avatar className="w-3 h-3">
                                  <AvatarImage src={item.author.avatar ?? (item.author as any)?.profilePicture} />
                                  <AvatarFallback className="text-xs">{(item.author.name ?? (item.author as any)?.username ?? 'U').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-base-content/80">{item.author.name ?? (item.author as any)?.username ?? 'User'}</span>
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
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-base-200">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <p className="text-base-content/80 text-xs leading-relaxed mb-2 line-clamp-2">{item.content}</p>
                    
                    {/* Compact Metadata Display */}
                    {item.metadata && (
                      <div className="space-y-1.5">
                        {/* Important Metadata Badges */}
                        <div className="flex flex-wrap gap-1">
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
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-base-300">
                      <div className="flex items-center gap-1">
                        <Button onClick={() => handleReact(item, 'likes')} variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-base-content/60 hover:text-base-content">
                          <Heart className="w-2.5 h-2.5 mr-0.5" />
                          {item.reactions?.likes || 0}
                        </Button>
                        <Button onClick={() => handleReact(item, 'shares')} variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-base-content/60 hover:text-base-content">
                          <MessageSquare className="w-2.5 h-2.5 mr-0.5" />
                          {item.reactions?.shares || 0}
                        </Button>
                        <Button onClick={() => handleReact(item, 'bookmarks')} variant="ghost" size="sm" className="h-5 px-1.5 text-xs text-base-content/60 hover:text-base-content">
                          <Bookmark className="w-2.5 h-2.5 mr-0.5" />
                          {item.reactions?.bookmarks || 0}
                        </Button>
                      </div>
                      {item.metadata?.link && (
                        <Button variant="secondary" size="sm" className="h-5 px-1.5 text-xs border-none">
                          <ExternalLink className="w-2.5 h-2.5 mr-0.5" />
                          Learn More
                        </Button>
                      )}
                    </div>
                </div>
              </motion.div>
            ))}
            {/* Load more */}
            <div className="flex items-center justify-center py-2">
              {!feedLoading && hasMore && (
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => setPage((p) => p + 1)}>
                  Load more
                </Button>
              )}
              {feedLoading && (
                <span className="text-xs text-base-content/60">Loading...</span>
              )}
            </div>
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

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Post</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCreatePost(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Post Type</label>
                <div className="flex gap-2">
                  {(['hackathon', 'news', 'tool'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={createPostType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCreatePostType(type)}
                      className="text-xs capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={createPostData.title}
                  onChange={(e) => setCreatePostData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title..."
                  className="text-sm"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  value={createPostData.content}
                  onChange={(e) => setCreatePostData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter content..."
                  className="w-full p-2 border border-base-300 rounded-md text-sm min-h-[80px] resize-none bg-base-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  value={createPostData.category}
                  onChange={(e) => setCreatePostData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., AI/ML, Web Development..."
                  className="text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <Input
                  value={createPostData.tags}
                  onChange={(e) => setCreatePostData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., React, AI, Hackathon..."
                  className="text-sm"
                />
              </div>

              {/* Type-specific fields */}
              {createPostType === 'hackathon' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prize Pool</label>
                    <Input
                      value={createPostData.prize}
                      onChange={(e) => setCreatePostData(prev => ({ ...prev, prize: e.target.value }))}
                      placeholder="e.g., $10,000"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Participants</label>
                    <Input
                      type="number"
                      value={createPostData.participants}
                      onChange={(e) => setCreatePostData(prev => ({ ...prev, participants: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <Input
                      type="datetime-local"
                      value={createPostData.deadline}
                      onChange={(e) => setCreatePostData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                </>
              )}

              {createPostType === 'tool' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tool Name</label>
                    <Input
                      value={createPostData.toolName}
                      onChange={(e) => setCreatePostData(prev => ({ ...prev, toolName: e.target.value }))}
                      placeholder="e.g., CodeGPT Assistant"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={createPostData.rating}
                      onChange={(e) => setCreatePostData(prev => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Views</label>
                    <Input
                      type="number"
                      value={createPostData.views}
                      onChange={(e) => setCreatePostData(prev => ({ ...prev, views: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                </>
              )}

              {/* Link */}
              <div>
                <label className="block text-sm font-medium mb-2">Link (optional)</label>
                <Input
                  value={createPostData.link}
                  onChange={(e) => setCreatePostData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://..."
                  className="text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreatePost}
                  disabled={creatingPost || !createPostData.title || !createPostData.content}
                  className="flex-1"
                >
                  {creatingPost ? 'Creating...' : 'Create Post'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePost(false)}
                  disabled={creatingPost}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NirvanaChannel;