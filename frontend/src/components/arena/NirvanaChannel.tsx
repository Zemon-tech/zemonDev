import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { 
  MessageSquare, 
  Trophy, 
  Users, 
  Code,
  Sparkles,
  Star,
  Crown,
  Hash,
  Target,
  TrendingUp,
  Zap,
  Search,
  CheckCircle2,
  ListChecks,
  // (import icons individually where used)
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useArenaChannels } from '@/hooks/useArenaChannels';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';
import { Calendar } from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ActivityFeed {
  id: string;
  type: 'message' | 'achievement' | 'challenge' | 'showcase';
  content: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  channel?: string;
  metadata?: {
    points?: number;
    badge?: string;
    projectName?: string;
    challengeName?: string;
    rank?: number;
  };
}

interface TrendingTopic {
  id: string;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}



const NirvanaChannel: React.FC = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Sample activity feed data
  const activityFeed: ActivityFeed[] = [
    {
      id: '1',
      type: 'challenge',
      content: 'completed the challenge',
      timestamp: new Date(),
      user: {
        name: 'CodeMaster',
        avatar: 'https://github.com/shadcn.png',
        role: 'Expert'
      },
      metadata: {
        challengeName: 'Binary Tree Traversal',
        points: 500,
        rank: 1
      }
    },
    {
      id: '2',
      type: 'showcase',
      content: 'shared a new project',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: {
        name: 'AlgoNinja',
        avatar: 'https://github.com/shadcn.png',
        role: 'Expert'
      },
      metadata: {
        projectName: 'Real-time Code Collaboration',
        points: 200
      }
    },
    {
      id: '3',
      type: 'achievement',
      content: 'earned a new badge',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: {
        name: 'TechExpert',
        role: 'Advanced'
      },
      metadata: {
        badge: 'Solution Master',
        points: 300
      }
    }
  ];

  // Trending topics
  const trendingTopics: TrendingTopic[] = [
    { id: '1', name: 'React Hooks', count: 156, trend: 'up' },
    { id: '2', name: 'System Design', count: 98, trend: 'up' },
    { id: '3', name: 'GraphQL', count: 72, trend: 'stable' },
    { id: '4', name: 'TypeScript', count: 64, trend: 'down' }
  ];



  // Example leaderboard and events data
  const leaderboard = [
    { id: '1', name: 'CodeMaster', avatar: 'https://github.com/shadcn.png', points: 1520 },
    { id: '2', name: 'AlgoNinja', avatar: '', points: 1340 },
    { id: '3', name: 'TechExpert', avatar: '', points: 1200 },
  ];
  const upcomingEvents = [
    { id: '1', name: 'Weekly Hackathon', date: '2024-07-20T18:00:00Z', description: 'Compete in our weekly coding challenge!' },
    { id: '2', name: 'AMA with AI Experts', date: '2024-07-22T16:00:00Z', description: 'Ask Me Anything with top AI professionals.' },
  ];

  const { channels, loading: channelsLoading } = useArenaChannels();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [userChannelStatuses, setUserChannelStatuses] = useState<Record<string, string>>({}); // channelId -> status
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [joinChannelsOpen, setJoinChannelsOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user channel statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await ApiService.getUserChannelStatuses(getToken);
        // Assume res.data is an array of { channelId, status }
        const map: Record<string, string> = {};
        (res.data || []).forEach((s: any) => {
          map[s.channelId] = s.status;
        });
        setUserChannelStatuses(map);
      } catch (err) {
        setUserChannelStatuses({});
      }
    };
    fetchStatuses();
  }, [getToken, refreshKey]);

  // Flatten all channels for joinable list
  const allChannels = Object.values(channels).flat();
  // Only show top-level channels that are not already joined (no approved UserChannelStatus)
  const joinableChannels = allChannels.filter(
    (c) => (!c.parentChannelId || c.parentChannelId === null) && userChannelStatuses[c._id] !== 'approved'
  );

  // Group channels by group/category
  const groupedChannels = React.useMemo(() => {
    const groups: Record<string, typeof joinableChannels> = {};
    joinableChannels.forEach((ch) => {
      if (!groups[ch.group]) groups[ch.group] = [];
      groups[ch.group].push(ch);
    });
    return groups;
  }, [joinableChannels]);

  // Filter by search
  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groupedChannels;
    const q = search.toLowerCase();
    const filtered: typeof groupedChannels = {};
    Object.entries(groupedChannels).forEach(([group, chans]) => {
      const matches = chans.filter(
        ch => ch.name.toLowerCase().includes(q) || (typeof (ch as any).description === 'string' && (ch as any).description.toLowerCase().includes(q))
      );
      if (matches.length) filtered[group] = matches;
    });
    return filtered;
  }, [groupedChannels, search]);
  // Example: highlight trending/suggested channels (top 2 by member count)
  const trendingChannels = [...joinableChannels]
    .sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0))
    .slice(0, 2);

  // Onboarding steps (example)
  const onboardingSteps = [
    { id: 'join', label: 'Join a channel' },
    { id: 'intro', label: 'Introduce yourself' },
    { id: 'explore', label: 'Explore projects' },
    { id: 'profile', label: 'Complete your profile' },
  ];
  // For demo, mark first as done if user has joined any channel (canRead on any channel)
  const joinedAny = allChannels.some(c => userChannelStatuses[c._id] === 'approved');
  const [completed, setCompleted] = useState<string[]>(joinedAny ? ['join'] : []);
  const progress = Math.round((completed.length / onboardingSteps.length) * 100);

  const handleToggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
      // Send join request for each selected channel
      await Promise.all(
        toRequest.map((channelId) =>
          ApiService.requestJoinChannel(channelId, getToken)
        )
      );
      setRequestStatus('Join request(s) sent! Await moderator approval.');
      setSelected({});
      setRefreshKey((k) => k + 1); // Trigger refresh
    } catch (e) {
      setRequestStatus('Failed to send join request.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nirvana Top Bar */}
      <div className="flex items-center justify-between h-12 px-4 py-1 border-b border-base-300 bg-base-200 sticky top-0 z-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-medium text-base-content">Nirvana</h2>
          <p className="text-[10px] text-base-content/70">Live Community Feed</p>
        </div>
      </div>
      {/* Main Content Layout: Left | Center (Hero) | Right */}
      <div className="flex-1 flex gap-8 p-8">
        {/* Left Sidebar: Join Channels + Live Community Feed (scrollable) */}
        <div className="w-80 min-w-[260px] max-w-xs flex flex-col gap-6 h-[calc(100vh-3rem)] min-h-0 overflow-y-auto">
          {/* Join Channels Section */}
          <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                <span className="text-lg font-bold text-primary">Join Channels</span>
              </div>
              <button
                className="p-1 rounded hover:bg-base-200 transition"
                aria-label={joinChannelsOpen ? 'Collapse' : 'Expand'}
                onClick={() => setJoinChannelsOpen((v) => !v)}
              >
                {joinChannelsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
            {joinChannelsOpen && (
              <>
                {/* Search Bar */}
                <div className="mb-3 flex items-center gap-2 bg-base-200 rounded-lg px-2 py-1">
                  <Search className="w-4 h-4 text-base-content/60" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search channels..."
                    className="bg-transparent outline-none text-sm flex-1"
                  />
                </div>
                {/* Trending/Suggested Channels */}
                {trendingChannels.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-primary font-semibold mb-1">Trending</div>
                    <div className="flex flex-col gap-1">
                      {trendingChannels.map(ch => (
                        <div key={ch._id} className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                          <Hash className="w-3 h-3" /> #{ch.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {channelsLoading ? (
                  <div className="text-xs text-base-content/60">Loading channels...</div>
                ) : Object.keys(filteredGroups).length === 0 ? (
                  <div className="text-xs text-base-content/60">
                    No joinable channels found.<br />
                    <span className="text-xs text-primary">Ask an admin to create a new joinable channel.</span>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handleJoinRequest(); }}>
                    <div className="space-y-4 mb-4">
                      {Object.entries(filteredGroups).map(([group, chans]) => (
                        <div key={group}>
                          <div className="text-xs font-semibold text-base-content/80 mb-1 capitalize">{group.replace(/-/g, ' ')}</div>
                          <div className="flex flex-col gap-2">
                            {chans.map((ch) => (
                              <label key={ch._id} className="flex items-center gap-2 cursor-pointer bg-base-200 rounded-lg px-2 py-1 hover:bg-primary/5 transition">
                                <input
                                  type="checkbox"
                                  checked={!!selected[ch._id]}
                                  onChange={() => handleToggle(ch._id)}
                                  className="accent-primary"
                                  disabled={requesting}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-base-content font-medium truncate">#{ch.name}</span>
                                    {ch.unreadCount ? <span className="ml-1 text-xs bg-primary/20 text-primary rounded px-1">{ch.unreadCount} online</span> : null}
                                  </div>
                                  {typeof (ch as any).description === 'string' && (ch as any).description && (
                                    <div className="text-xs text-base-content/70 truncate">{(ch as any).description}</div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button type="submit" size="sm" className="w-full" disabled={requesting || Object.values(selected).every(v => !v)}>
                      {requesting ? 'Requesting...' : 'Request to Join'}
                    </Button>
                    {requestStatus && <div className="mt-3 text-xs text-error font-semibold">{requestStatus}</div>}
                  </form>
                )}
              </>
            )}
          </div>
          {/* Live Community Feed (Compact) */}
          <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
              <span className="text-base font-semibold text-primary">Live Community Feed</span>
              </div>
              <div className="space-y-2">
                {activityFeed.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                    'flex items-start gap-2 p-2 rounded-lg hover:bg-primary/5 transition',
                    'border border-base-200 bg-base-100/80 shadow-sm'
                    )}
                  >
                      <Avatar className="w-8 h-8">
                        {activity.user.avatar ? (
                          <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        ) : (
                      <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-base-content text-xs">{activity.user.name}</span>
                          <span className="text-xs text-base-content/70">{activity.content}</span>
                          {activity.metadata?.challengeName && (
                        <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 rounded px-1 py-0.5">
                          <Target className="w-3 h-3" /> {activity.metadata.challengeName}
                        </span>
                          )}
                          {activity.metadata?.badge && (
                        <span className="flex items-center gap-1 text-[10px] text-warning bg-warning/10 rounded px-1 py-0.5">
                          <Crown className="w-3 h-3" /> {activity.metadata.badge}
                        </span>
                          )}
                          {activity.metadata?.projectName && (
                        <span className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 rounded px-1 py-0.5">
                          <Sparkles className="w-3 h-3" /> {activity.metadata.projectName}
                        </span>
                          )}
                        </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-base-content/60">
                      <span>{activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {activity.metadata?.points && (
                        <span className="flex items-center gap-1 text-success">
                          <Star className="w-3 h-3" /> +{activity.metadata.points} pts
                          </span>
                          )}
                          {activity.metadata?.rank === 1 && (
                        <span className="flex items-center gap-1 text-warning">
                          <Trophy className="w-3 h-3" /> First Place!
                        </span>
                          )}
                        </div>
                      </div>
                    </div>
              ))}
            </div>
            {/* Upcoming Events (in Live Community Feed) */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-base font-semibold text-primary">Upcoming Events</span>
              </div>
              <div className="space-y-2">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-2 rounded-lg border border-base-200 bg-base-100/80 shadow-sm flex flex-col gap-1 hover:bg-accent/5 transition">
                    <span className="font-medium text-base-content text-xs">{event.name}</span>
                    <span className="text-[10px] text-base-content/60">{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span className="text-[10px] text-base-content/70 mb-1">{event.description}</span>
                    <Button size="sm" className="w-fit h-7 px-3 py-1 text-xs" variant="outline" tabIndex={0}>Join</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Top Contributors (Compact, Below Live Feed) */}
          <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-base font-semibold text-primary">Top Contributors</span>
              </div>
            <div className="space-y-2">
              {leaderboard.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition">
                  <span className="font-bold text-base text-primary w-5 text-center flex-shrink-0">{idx + 1}</span>
                  <Avatar className="w-8 h-8">
                    {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>}
                  </Avatar>
                  <span className="font-medium text-base-content flex-1 truncate text-xs">{user.name}</span>
                  <span className="text-xs text-success font-semibold flex-shrink-0">{user.points} pts</span>
                          </div>
              ))}
                        </div>
                      </div>
                    </div>

        {/* Center: Hero Section (fixed, not scrollable) */}
        <div className="flex-1 flex flex-col items-center justify-start">
          <div className="w-full max-w-2xl mx-auto">
            <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-base-300 flex flex-col items-center gap-2 relative">
              <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading mb-2 text-center">
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p className="text-base md:text-lg text-base-content/80 font-medium mb-2 text-center">
                Find your tribe. Build, learn, and grow with the Zemon community.
              </p>
              <div className="w-full">
                <div className="p-5 rounded-xl border border-base-300 bg-primary/5 text-primary font-bold text-lg shadow-md text-center">
                  Welcome to Nirvana! Stay tuned for featured projects, events, and more.
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Sidebar: Trending Topics, Quick Stats, Onboarding (scrollable) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          className="w-72 space-y-8 hidden lg:flex flex-col h-[calc(100vh-3rem)] overflow-y-auto pt-2"
          >
            {/* Trending Topics */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-primary">Trending Topics</h3>
              </div>
              <div className="space-y-2">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-primary" />
                      <span className="text-sm">{topic.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-base-content/70">{topic.count}</span>
                      <span className={cn(
                        "text-xs",
                        topic.trend === 'up' && "text-success",
                        topic.trend === 'down' && "text-destructive",
                        topic.trend === 'stable' && "text-base-content/70"
                      )}>
                        {topic.trend === 'up' && '↑'}
                        {topic.trend === 'down' && '↓'}
                        {topic.trend === 'stable' && '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
            <SpotlightCard className="p-5 border border-base-300 rounded-xl shadow-md bg-base-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Online</span>
                    </div>
                  <span className="text-sm font-bold">234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Messages Today</span>
                    </div>
                  <span className="text-sm font-bold">1.2k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Solutions</span>
                    </div>
                  <span className="text-sm font-bold">89</span>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          {/* Onboarding/Quick Start Panel */}
          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-5 border border-base-300 rounded-xl shadow-md bg-base-100">
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-base-200 rounded-full mb-2 overflow-hidden" aria-label="Onboarding progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} tabIndex={0}>
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                {/* Checklist */}
                <ul className="space-y-2 mb-2" aria-label="Onboarding checklist">
                  {onboardingSteps.map(step => (
                    <li key={step.id} className="flex items-center gap-2">
                      <button
                        className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center',
                          completed.includes(step.id)
                            ? 'bg-success border-success text-white'
                            : 'bg-base-200 border-base-300 text-base-content/60'
                        )}
                        onClick={() => {
                          if (!completed.includes(step.id)) setCompleted([...completed, step.id]);
                        }}
                        aria-label={completed.includes(step.id) ? 'Completed' : `Mark ${step.label} as done`}
                        tabIndex={0}
                      >
                        {completed.includes(step.id) ? <CheckCircle2 className="w-4 h-4" /> : <ListChecks className="w-4 h-4" />}
                      </button>
                      <span className="text-xs font-medium">{step.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NirvanaChannel; 