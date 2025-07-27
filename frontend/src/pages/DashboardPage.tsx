import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, BookOpen, Code, Flame, Star, ChevronUp, Quote, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { useEffect, useState } from 'react';

// --- AnimatedCount Utility ---
function AnimatedCount({ value, duration = 1.2, className = '' }: { value: number; duration?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [value]);
  return <span className={className}>{display}</span>;
}

// --- Header Section ---
function DashboardHeader({ user }: { user: any }) {
  return (
    <motion.div
      className="flex items-center justify-between gap-6 px-6 py-3 rounded-xl shadow-md bg-base-200/70 backdrop-blur border border-base-200/60"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Avatar & Greeting */}
      <div className="flex items-center gap-4 min-w-0">
        <Avatar className="h-12 w-12 shadow ring-1 ring-primary/20">
          <AvatarImage src={user?.imageUrl} alt={user?.firstName || 'User'} />
          <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-base-content truncate">
              Hey {user?.firstName || 'Builder'} <span className="inline-block">👋</span>
            </span>
            <span className="badge badge-secondary badge-outline px-2 py-1 text-xs font-semibold ml-1">
              Frontend Apprentice
            </span>
          </div>
          <span className="text-xs text-base-content/70 mt-0.5">
            <span className="badge badge-accent badge-sm align-middle mr-1">Zemon</span> Dashboard
          </span>
        </div>
      </div>
      {/* Quote */}
      <div className="flex flex-col items-end justify-center max-w-xs ml-auto">
        <span className="flex items-center gap-2 text-primary/80 text-xs font-medium mb-1">
          <Quote className="w-4 h-4" />
          <span className="italic font-serif text-base-content/80">"Success is the sum of small efforts, repeated day in and day out."</span>
        </span>
        <span className="text-xs text-base-content/60 mt-0.5">— Robert Collier</span>
      </div>
    </motion.div>
  );
}

// --- Stats Row ---
function DashboardStatsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Zemon Streak */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2, boxShadow: '0 4px 16px 0 rgba(80,80,120,0.10)' }}
        className="flex flex-col items-center justify-center bg-base-100/80 rounded-lg shadow-md p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg"
      >
        <Flame className="w-6 h-6 text-base-content opacity-70 mb-1" />
        <span className="text-lg font-bold text-primary">
          <AnimatedCount value={12} />
        </span>
        <span className="text-xs text-base-content/70 font-medium mt-0.5">Zemon Streak</span>
      </motion.div>
      {/* Problems Solved */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2, boxShadow: '0 4px 16px 0 rgba(80,80,120,0.10)' }}
        className="flex flex-col items-center justify-center bg-base-100/80 rounded-lg shadow-md p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg"
      >
        <Code className="w-6 h-6 text-base-content opacity-70 mb-1" />
        <span className="text-lg font-bold text-accent">
          <AnimatedCount value={24} />
        </span>
        <span className="text-xs text-base-content/70 font-medium mt-0.5">Problems Solved</span>
      </motion.div>
      {/* Frontend Path % */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2, boxShadow: '0 4px 16px 0 rgba(80,80,120,0.10)' }}
        className="flex flex-col items-center justify-center bg-base-100/80 rounded-lg shadow-md p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg"
      >
        <div className="relative flex items-center justify-center mb-1">
          <div className="radial-progress text-info" style={{ '--value': 65, '--size': '2.5rem', '--thickness': '5px' } as any}>
            <span className="text-xs font-bold text-info">65%</span>
          </div>
        </div>
        <span className="text-xs text-base-content/70 font-medium mt-0.5">Frontend Path</span>
      </motion.div>
      {/* Top 10% */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2, boxShadow: '0 4px 16px 0 rgba(80,80,120,0.10)' }}
        className="flex flex-col items-center justify-center bg-base-100/80 rounded-lg shadow-md p-4 transition-all duration-200 cursor-pointer group hover:shadow-lg"
      >
        <Trophy className="w-6 h-6 text-base-content opacity-70 mb-1" />
        <span className="text-lg font-bold text-warning">Top 10%</span>
        <span className="text-xs text-base-content/70 font-medium mt-0.5">Community Rank</span>
      </motion.div>
    </div>
  );
}

// --- Leaderboard ---
function DashboardLeaderboard({ leaderboardOpen, setLeaderboardOpen }: { leaderboardOpen: boolean; setLeaderboardOpen: (open: boolean) => void }) {
  const leaderboardData = [
    { name: 'Aarav Sharma', points: 1200, rank: 1, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Priya Patel', points: 1100, rank: 2, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Rahul Kumar', points: 1050, rank: 3, avatar: 'https://randomuser.me/api/portraits/men/45.jpg' }
  ];
  return (
    <div className="flex justify-end">
      <motion.div
        className="w-full max-w-md bg-base-200 rounded-xl shadow-md p-4 flex flex-col min-h-[320px] max-h-[320px]"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-accent font-heading flex items-center gap-2">
            <ChevronUp className="text-accent w-5 h-5" /> Leaderboard (Top 3)
          </h2>
          <button
            className="rounded-full p-1 bg-base-100 hover:bg-base-300 transition-colors"
            onClick={() => setLeaderboardOpen(!leaderboardOpen)}
            aria-label={leaderboardOpen ? 'Collapse leaderboard' : 'Expand leaderboard'}
          >
            {leaderboardOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <motion.div
          initial={false}
          animate={{ height: leaderboardOpen ? 'auto' : 180, opacity: leaderboardOpen ? 1 : 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="space-y-2">
            {leaderboardData.map((user, idx) => (
              <motion.div
                key={user.rank}
                whileHover={{ scale: 1.01, boxShadow: '0 4px 16px 0 rgba(139,92,246,0.10)' }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer bg-base-100/80 hover:shadow-lg ${idx === 0 ? 'relative' : ''}`}
              >
                <span className={`font-bold text-base w-6 text-center ${idx === 0 ? 'text-warning' : 'text-base-content/80'}`}>{user.rank}</span>
                <Avatar className="h-8 w-8 ring-1 ring-accent/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-accent/10 text-accent font-bold">{user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium truncate text-base-content/90 flex items-center gap-1">
                  {user.name}
                  {idx === 0 && <span className="ml-1 text-lg" title="Top Rank">🥇</span>}
                </span>
                <span className="badge badge-accent badge-outline text-sm font-mono px-2 py-1">{user.points} pts</span>
              </motion.div>
            ))}
          </div>
          {leaderboardOpen && (
            <div className="mt-3 border-t border-base-300 pt-2 text-xs text-base-content/60">
              <span>Leaderboard updates every 24h. Only top 3 shown here.</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- Activity Timeline ---
function DashboardActivityTimeline() {
  const activityTimeline = [
    {
      title: 'Completed React Hooks Tutorial',
      category: 'Learning',
      time: '2h ago',
      icon: <BookOpen className="w-5 h-5 text-info" />, badge: 'info',
    },
    {
      title: 'Solved "Binary Tree Traversal"',
      category: 'Crucible',
      time: 'Yesterday',
      icon: <Code className="w-5 h-5 text-accent" />, badge: 'success',
    },
    {
      title: 'Joined Weekly Coding Challenge',
      category: 'Arena',
      time: '3d ago',
      icon: <Trophy className="w-5 h-5 text-warning" />, badge: 'warning',
    },
  ];
  return (
    <motion.div
      className="relative bg-base-100/90 rounded-xl shadow-md border border-base-200/60 p-4 flex flex-col min-h-[320px] max-h-[320px] overflow-y-auto"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
    >
      <h2 className="text-base font-bold text-primary font-heading mb-3 flex items-center gap-2">
        <Sparkles className="text-primary w-5 h-5" /> Recent Activity
      </h2>
      <div className="relative pl-7">
        {/* Timeline vertical bar */}
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-base-300 rounded-full" />
        <ul className="space-y-3">
          {activityTimeline.map((activity, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -1, scale: 1.01, boxShadow: '0 2px 12px 0 rgba(80,80,120,0.08)' }}
              className="relative flex items-start gap-3 group bg-transparent cursor-pointer"
            >
              {/* Timeline dot */}
              <span className="absolute left-[-1.35rem] top-2 w-4 h-4 rounded-full bg-base-100 border-2 border-primary flex items-center justify-center shadow-md">
                {activity.icon}
              </span>
              <div className="flex-1 min-w-0 bg-base-200/60 rounded-lg px-3 py-2 shadow-sm group-hover:bg-base-200/80 transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base font-medium text-base-content truncate">
                    {activity.title}
                  </span>
                  <span className="badge badge-sm badge-neutral ml-2">{activity.category}</span>
                </div>
                <span className="badge badge-xs badge-neutral mt-1">{activity.time}</span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// --- Project Showcase ---
function DashboardShowcase() {
  const showcaseProjects = [
    {
      title: 'Distributed Cache System',
      author: 'Aarav Sharma',
      upvotes: 42,
      stack: ['Redis', 'Node.js', 'Docker'],
    },
    {
      title: 'ML Pipeline Automation',
      author: 'Priya Patel',
      upvotes: 35,
      stack: ['Python', 'TensorFlow', 'AWS'],
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 min-h-[320px] max-h-[320px] overflow-y-auto">
      <h2 className="text-base font-bold text-success font-heading mb-3 flex items-center gap-2">
        <Star className="text-success w-5 h-5" /> Project Showcase
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {showcaseProjects.map((project, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2, scale: 1.01, boxShadow: '0 4px 16px 0 rgba(80,80,120,0.10)' }}
            className="relative flex flex-col md:flex-row items-center md:items-stretch gap-4 p-4 border border-base-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-base-100/80 cursor-pointer group"
            tabIndex={0}
            aria-label={`View details for ${project.title}`}
          >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-lg font-bold text-base-content truncate mb-1">
                {project.title}
              </span>
              <span className="text-xs text-neutral/70 mb-2">by {project.author}</span>
              <div className="flex flex-wrap gap-2 mb-1">
                {project.stack?.map((tag) => (
                  <span key={tag} className="badge badge-outline badge-primary badge-xs px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end justify-between min-w-[60px] gap-2">
              <span className="badge badge-success font-mono px-3 py-2 text-base rounded-full shadow text-white bg-gradient-to-tr from-success to-accent border-none">
                +{project.upvotes}
              </span>
              <button className="btn btn-xs btn-primary rounded-full px-4 py-1 mt-1 font-semibold shadow-sm hover:shadow transition-all">View</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Main Dashboard Page ---
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="min-h-screen h-full w-full bg-background flex flex-col">
      <div className="flex-1 flex flex-col w-full px-6 py-4 space-y-6">
        {/* --- Header Section --- */}
        <DashboardHeader user={user} />
        {/* --- Stats Row --- */}
        <DashboardStatsRow />
        {/* --- Main Grid Layout --- */}
        <div className="grid grid-cols-12 gap-6 gap-y-6 mt-2">
          {/* Leaderboard */}
          <div className="col-span-12 md:col-span-4 flex flex-col">
            <DashboardLeaderboard leaderboardOpen={leaderboardOpen} setLeaderboardOpen={setLeaderboardOpen} />
          </div>
          {/* Activity Timeline */}
          <div className="col-span-12 md:col-span-4 flex flex-col">
            <DashboardActivityTimeline />
          </div>
          {/* Project Showcase */}
          <div className="col-span-12 md:col-span-4 flex flex-col">
            <DashboardShowcase />
          </div>
        </div>
      </div>
    </div>
  );
}