import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';
import { useArenaChannels } from '@/hooks/useArenaChannels';

// UI & Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';

// Icons
import {
  MessageSquare, Trophy, Users, Code, Sparkles, Star, Crown, Hash,
  Target, TrendingUp, Zap, Search, CheckCircle2, Calendar,
  ChevronDown, ChevronRight
} from 'lucide-react';

// --- I have not altered your interfaces or data structures ---
interface ActivityFeed {
  id: string;
  type: 'message' | 'achievement' | 'challenge' | 'showcase';
  content: string;
  timestamp: Date;
  user: { name: string; avatar?: string; role: string; };
  channel?: string;
  metadata?: { points?: number; badge?: string; projectName?: string; challengeName?: string; rank?: number; };
}

interface TrendingTopic {
  id:string; name: string; count: number; trend: 'up' | 'down' | 'stable';
}

const NirvanaChannel: React.FC = () => {
  // --- All original logic and data are preserved ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const activityFeed: ActivityFeed[] = [
    { id: '1', type: 'challenge', content: 'completed the challenge', timestamp: new Date(), user: { name: 'CodeMaster', avatar: 'https://github.com/shadcn.png', role: 'Expert' }, metadata: { challengeName: 'Binary Tree Traversal', points: 500, rank: 1 } },
    { id: '2', type: 'showcase', content: 'shared a new project', timestamp: new Date(Date.now() - 1000 * 60 * 15), user: { name: 'AlgoNinja', avatar: 'https://github.com/shadcn.png', role: 'Expert' }, metadata: { projectName: 'Real-time Code Collaboration', points: 200 } },
    { id: '3', type: 'achievement', content: 'earned a new badge', timestamp: new Date(Date.now() - 1000 * 60 * 30), user: { name: 'TechExpert', role: 'Advanced' }, metadata: { badge: 'Solution Master', points: 300 } }
  ];

  const trendingTopics: TrendingTopic[] = [
    { id: '1', name: 'React Hooks', count: 156, trend: 'up' },
    { id: '2', name: 'System Design', count: 98, trend: 'up' },
    { id: '3', name: 'GraphQL', count: 72, trend: 'stable' },
    { id: '4', name: 'TypeScript', count: 64, trend: 'down' }
  ];

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
  const [userChannelStatuses, setUserChannelStatuses] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [joinChannelsOpen, setJoinChannelsOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

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
    // Only show parent channels (no parentChannelId)
    if (c.parentChannelId && c.parentChannelId !== null) {
      return false;
    }
    
    // Check user status for this channel
    const userStatus = userChannelStatuses[c._id];
    
    // If no status record, channel is joinable
    if (!userStatus) {
      return true;
    }
    
    // Hide if banned or kicked
    if (userStatus === 'banned' || userStatus === 'kicked') {
      return false;
    }
    
    // Only show if not already approved
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
  const [completed, setCompleted] = useState<string[]>(joinedAny ? ['join'] : []);
  const progress = Math.round((completed.length / onboardingSteps.length) * 100);

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

  return (
    <div className="flex flex-col h-full bg-base-100 text-base-content">
      {/* --- UI POLISH: Top Bar --- */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-base-300/80 bg-base-200/60 sticky top-0 z-10 flex-shrink-0 backdrop-blur-sm">
        <div>
          <h2 className="text-sm font-semibold text-base-content">Nirvana</h2>
          <p className="text-xs text-base-content/70">Live Community Feed</p>
        </div>
        {/* Placeholder for potential actions */}
      </div>

      {/* --- UI POLISH: Main Content Layout with adjusted padding and gap --- */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        
        {/* --- UI POLISH: Left Sidebar with better spacing and scrollbar handling --- */}
        <aside className="w-80 min-w-[280px] max-w-xs flex flex-col gap-6 overflow-y-auto pr-2">
          
          <div className="bg-base-100 border border-base-300/80 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Hash className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold">Join Channels</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setJoinChannelsOpen((v) => !v)}>
                {joinChannelsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Button>
            </div>
            {joinChannelsOpen && (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search channels..."
                    className="w-full bg-base-200 border border-transparent rounded-lg pl-9 pr-3 py-1.5 text-sm focus:bg-base-100 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
                
                {trendingChannels.length > 0 && !search && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-primary/80 tracking-wider mb-2">TRENDING</h4>
                    <div className="flex flex-col gap-1.5">
                      {trendingChannels.map(ch => (
                        <div key={ch._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                          <Hash className="w-3.5 h-3.5" /> #{ch.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {channelsLoading ? ( <div className="text-center text-xs text-base-content/60 py-4">Loading...</div>
                ) : Object.keys(filteredGroups).length === 0 ? (
                  <div className="text-center text-xs text-base-content/60 p-4 bg-base-200/80 rounded-lg">
                    <p>No joinable channels found.</p>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handleJoinRequest(); }}>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                      {Object.entries(filteredGroups).map(([group, chans]) => (
                        <div key={group}>
                          <h4 className="text-xs font-semibold text-base-content/60 mb-2 capitalize tracking-wide">{group.replace(/-/g, ' ')}</h4>
                          <div className="flex flex-col gap-1.5">
                            {chans.map((ch) => (
                              <label key={ch._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200 transition-colors duration-200">
                                <input type="checkbox" checked={!!selected[ch._id]} onChange={() => handleToggle(ch._id)} className="checkbox checkbox-primary checkbox-sm" disabled={requesting} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">#{ch.name}</span>
                                    {ch.unreadCount > 0 && <span className="text-xs bg-primary/20 text-primary font-bold rounded-full px-2 py-0.5">{ch.unreadCount}</span>}
                                  </div>
                                  {(ch as any).description && <p className="text-xs text-base-content/70 truncate mt-0.5">{(ch as any).description}</p>}
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
                    {requestStatus && <p className="mt-3 text-xs text-center text-success font-semibold">{requestStatus}</p>}
                  </form>
                )}
              </>
            )}
          </div>
          
          <div className="bg-base-100 border border-base-300/80 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-base font-bold text-primary">Live Feed</span>
            </div>
            <div className="space-y-2.5">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-base-200/70 transition-colors duration-200">
                  <Avatar className="w-9 h-9 mt-0.5">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap text-sm">
                      <span className="font-semibold text-base-content">{activity.user.name}</span>
                      <span className="text-base-content/80">{activity.content}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {activity.metadata?.challengeName && <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 rounded-full px-2.5 py-0.5 font-medium"><Target className="w-3 h-3" />{activity.metadata.challengeName}</span>}
                      {activity.metadata?.badge && <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 rounded-full px-2.5 py-0.5 font-medium"><Crown className="w-3 h-3" />{activity.metadata.badge}</span>}
                      {activity.metadata?.projectName && <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 rounded-full px-2.5 py-0.5 font-medium"><Sparkles className="w-3 h-3" />{activity.metadata.projectName}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-base-content/60">
                      <span>{activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {activity.metadata?.points && <span className="flex items-center gap-1 text-success font-semibold"><Star className="w-3.5 h-3.5" />+{activity.metadata.points} pts</span>}
                      {activity.metadata?.rank === 1 && <span className="flex items-center gap-1 text-amber-500 font-bold"><Trophy className="w-3.5 h-3.5" />#1 Place</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-base-300/80">
                <div className="flex items-center gap-2.5 mb-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-base font-bold text-primary">Upcoming Events</span>
                </div>
                <div className="space-y-2.5">
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="p-3 rounded-lg border border-base-300/80 bg-base-200/60 hover:border-primary/40 transition-colors">
                            <p className="font-semibold text-base-content text-sm">{event.name}</p>
                            <p className="text-xs text-base-content/70 mt-0.5">{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            <p className="text-xs text-base-content/80 mt-1.5 mb-2">{event.description}</p>
                            <Button size="sm" className="h-7 px-3 text-xs" variant="outline">Learn More</Button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="bg-base-100 border border-base-300/80 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-base font-bold text-primary">Top Contributors</span>
              </div>
              <div className="space-y-1.5">
                  {leaderboard.map((u, idx) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/70 transition-colors">
                          <span className="font-bold text-lg text-primary/70 w-5 text-center flex-shrink-0">{idx + 1}</span>
                          <Avatar className="w-9 h-9"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name.charAt(0)}</AvatarFallback></Avatar>
                          <span className="font-medium text-base-content flex-1 truncate text-sm">{u.name}</span>
                          <span className="text-sm text-success font-semibold flex-shrink-0">{u.points.toLocaleString()} pts</span>
                      </div>
                  ))}
              </div>
          </div>
        </aside>

        {/* --- UI POLISH: Center Hero Section with enhanced styling --- */}
        <section className="flex-1 flex flex-col items-center pt-8">
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="px-6 py-10 bg-gradient-to-br from-primary/5 via-base-100 to-accent/5 border border-base-300/50 rounded-2xl shadow-sm">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
                </h1>
                <p className="text-base md:text-lg text-base-content/80 max-w-xl mx-auto mb-6">
                  Find your tribe. Build, learn, and grow with the Zemon community.
                </p>
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/10 text-primary font-semibold text-base">
                  Featured projects, events, and challenges will appear here. Stay tuned!
                </div>
            </div>
          </div>
        </section>
        
        {/* --- UI POLISH: Right Sidebar with refined cards --- */}
        <motion.aside variants={containerVariants} initial="hidden" animate="visible" className="w-72 space-y-6 hidden lg:flex flex-col overflow-y-auto pr-2">
          
          <motion.div variants={itemVariants} className="bg-base-100 border border-base-300/80 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-primary">Trending Topics</h3>
            </div>
            <div className="space-y-1">
              {trendingTopics.map((topic) => (
                <a href="#" key={topic.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-base-200/70 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <Hash className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-base-content/60">{topic.count}</span>
                    <span className={cn("text-xs", topic.trend === 'up' && "text-success", topic.trend === 'down' && "text-error", topic.trend === 'stable' && "text-base-content/50")}>
                      {topic.trend === 'up' && '▲'} {topic.trend === 'down' && '▼'} {topic.trend === 'stable' && '—'}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-4 border border-base-300/80 rounded-xl shadow-sm bg-base-100">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Users className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">Online</span></div><span className="text-sm font-bold">234</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><MessageSquare className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">Messages Today</span></div><span className="text-sm font-bold">1.2k</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Code className="w-4 h-4 text-primary" /><span className="text-sm font-semibold">Solutions</span></div><span className="text-sm font-bold">89</span></div>
              </div>
            </SpotlightCard>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-4 border border-base-300/80 rounded-xl shadow-sm bg-base-100">
              <h3 className="text-base font-bold text-primary mb-3">Getting Started</h3>
              <div className="space-y-3">
                <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden" title={`Onboarding progress: ${progress}%`}>
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <ul className="space-y-2.5">
                  {onboardingSteps.map(step => (
                    <li key={step.id} className="flex items-center gap-2.5">
                      <button className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center transition-all',
                        completed.includes(step.id) ? 'bg-success text-white' : 'bg-base-200/80 border border-base-300'
                      )} onClick={() => { if (!completed.includes(step.id)) setCompleted([...completed, step.id]); }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={cn("text-sm", completed.includes(step.id) ? "text-base-content/60 line-through" : "text-base-content font-medium")}>{step.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>
          </motion.div>

        </motion.aside>
      </div>
    </div>
  );
};

export default NirvanaChannel;