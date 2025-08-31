import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Code, Flame, Star, Quote, Users, ArrowRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Aurora } from '@/components/blocks/Aurora';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { CircularProgress } from '@/components/blocks/CircularProgress';
import { GradientText } from '@/components/blocks/GradientText';
import { Confetti } from '@/components/blocks/Confetti';

import { useEffect, useState } from 'react';
import { useZemonStreak } from '@/hooks/useZemonStreak';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserScoring } from '@/hooks/useUserScoring';
import { useStreakLeaderboard } from '@/hooks/useStreakLeaderboard';
import { BookmarkedResourcesCard } from '@/components/dashboard/BookmarkedResourcesCard';
import { SkillTrackingCard } from '@/components/dashboard/SkillTrackingCard';

// --- AnimatedCount Utility ---
function AnimatedCount({ value, duration = 1.2, className = '' }: { value: number; duration?: number; className?: string }) {
  // Ensure value is a valid number
  const safeValue = isNaN(value) || !isFinite(value) ? 0 : Math.max(0, value);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setDisplay(Math.floor(progress * safeValue));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(safeValue);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [safeValue, duration]);
  return <span className={className}>{display}</span>;
}

// --- Achievement System ---
function AchievementNotification({ achievement, onClose }: { achievement: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-2xl p-4 max-w-sm border border-yellow-400/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">Achievement Unlocked!</h3>
            <p className="text-white/90 text-xs">{achievement.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Floating Particles Background ---
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse floating" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-1 h-1 bg-accent/30 rounded-full animate-pulse floating" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-success/25 rounded-full animate-pulse floating" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-warning/20 rounded-full animate-pulse floating" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-60 left-1/2 w-1 h-1 bg-info/25 rounded-full animate-pulse floating" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}

// --- Compact Header Section ---
function DashboardHeader({ user, onAchievement }: { user: any; onAchievement: (achievement: any) => void }) {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerAchievement = () => {
    const achievements = [
      { title: "Welcome Back!", icon: "👋" },
      { title: "Dashboard Explorer", icon: "🎯" },
      { title: "Zemon Champion", icon: "🏆" }
    ];
    const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
    onAchievement(randomAchievement);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Aurora className="absolute inset-0 opacity-20" />
      <SpotlightCard className="flex items-center justify-between gap-4 px-6 py-4 rounded-xl shadow-lg bg-gradient-to-br from-base-200/80 to-base-100/60 backdrop-blur-xl border border-base-300/50">
        {/* Avatar & Greeting */}
        <div className="flex items-center gap-4 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative cursor-pointer"
            onClick={triggerAchievement}
          >
            <Avatar className="h-12 w-12 shadow-xl ring-2 ring-primary/30">
              <AvatarImage src={user?.imageUrl} alt={user?.firstName || 'User'} />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-accent text-primary-content">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </motion.div>
          </motion.div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-base-content">
                Hey {user?.firstName || 'Builder'} 👋
              </span>
              <motion.span 
                className="badge badge-secondary badge-sm px-2 py-1 text-xs font-bold shadow-md"
                whileHover={{ scale: 1.05 }}
              >
                Frontend Apprentice
              </motion.span>
            </div>
            <span className="text-xs text-base-content/70 flex items-center gap-1">
              <span className="badge badge-accent badge-xs align-middle">Zemon</span>
              <span>Dashboard</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-accent" />
              </motion.div>
            </span>
          </div>
        </div>
        {/* Compact Quote */}
        <div className="flex flex-col items-end justify-center max-w-xs ml-auto">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
          >
            <Quote className="absolute -top-1 -left-1 w-4 h-4 text-primary/60" />
            <span className="italic font-serif text-base-content/90 text-xs leading-relaxed block pl-4">
              "Success is the sum of small efforts, repeated day in and day out."
            </span>
          </motion.div>
          <span className="text-xs text-base-content/60 mt-1 font-medium">— Robert Collier</span>
        </div>
      </SpotlightCard>
      
      <Confetti isActive={showConfetti} />
    </motion.div>
  );
}

// --- Compact Stats Row ---
function DashboardStatsRow() {
  const { streakInfo, loading: streakLoading } = useZemonStreak();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { scoringData, loading: scoringLoading } = useUserScoring();
  
  const solvedCount = profileLoading
    ? 0
    : ((userProfile as any)?.solvedCount ?? userProfile?.stats?.problemsSolved ?? (userProfile?.completedSolutions?.length || 0));
  
  const totalPoints = scoringLoading ? 0 : (scoringData?.totalPoints || 0);
  const averageScore = scoringLoading ? 0 : (scoringData?.averageScore || 0);
  
  // Note: Community Rank calculation removed as it's not currently used
  
  // Note: Community Rank value is a string ("Top X%"), others are numbers
  const stats = [
    {
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      value: streakLoading ? 0 : (streakInfo?.currentStreak || 0),
      label: "Zemon Streak",
      color: "text-orange-500",
      bgGradient: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20",
      isProgress: false
    },
    {
      icon: <Code className="w-5 h-5 text-blue-500" />,
      value: solvedCount,
      label: "Problems Solved",
      color: "text-blue-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      isProgress: false
    },
    {
      icon: <Star className="w-5 h-5 text-purple-500" />,
      value: totalPoints,
      label: "Total Points",
      color: "text-purple-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      isProgress: false
    },
    {
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      value: `${averageScore}%`,
      label: "Avg Score",
      color: "text-yellow-500",
      bgGradient: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/20",
      isProgress: false
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ 
            scale: 1.02, 
            y: -2, 
            boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)' 
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className={`relative overflow-hidden group cursor-pointer`}
        >
          <SpotlightCard className={`p-4 rounded-xl shadow-md bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} backdrop-blur-sm h-24 flex items-center justify-center`}>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`${stat.color}`}
              >
                {stat.icon}
              </motion.div>
              
              {stat.isProgress ? (
                <div className="relative">
                  <CircularProgress 
                    value={stat.value as number} 
                    size={32} 
                    strokeWidth={3}
                    className="mb-1"
                  >
                    <span className="text-xs font-bold text-base-content">{stat.value}%</span>
                  </CircularProgress>
                </div>
              ) : (
                <span className={`text-lg font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? (
                    <AnimatedCount value={stat.value} />
                  ) : (
                    stat.value
                  )}
                </span>
              )}
              
              <span className="text-xs text-base-content/80 font-medium">{stat.label}</span>
            </div>
            
            {/* Hover effect overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
          </SpotlightCard>
        </motion.div>
      ))}
    </div>
  );
}

// --- Compact Leaderboard ---
function DashboardLeaderboard() {
  const { data, loading, error } = useStreakLeaderboard(3);
  const fallbackData = [
    { name: 'Aarav Sharma', points: 1200, rank: 1, avatar: 'https://randomuser.me/api/portraits/men/32.jpg', streak: 15 },
    { name: 'Priya Patel', points: 1100, rank: 2, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', streak: 12 },
    { name: 'Rahul Kumar', points: 1050, rank: 3, avatar: 'https://randomuser.me/api/portraits/men/45.jpg', streak: 8 }
  ];

  const leaderboardData = (!loading && !error && data.length > 0)
    ? data.map(u => ({ name: u.name, points: u.points, rank: u.rank, avatar: u.avatar, streak: u.streak }))
    : fallbackData;

  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const rankIcons = ['🥇', '🥈', '🥉'];

  return (
    <SpotlightCard className="bg-gradient-to-br from-base-200/80 to-base-100/60 rounded-xl shadow-lg p-4 border border-base-300/50 h-69">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-accent font-heading flex items-center gap-2">
          <Trophy className="text-accent w-4 h-4" /> 
          <GradientText text="Leaderboard" gradient="from-accent to-primary" className="text-sm" />
          <span className="text-xs text-base-content/60">(Top 3)</span>
        </h2>
      </div>
      
      <div className="space-y-2">
        {leaderboardData.map((user, idx) => (
          <motion.div
            key={user.rank}
            whileHover={{ 
              scale: 1.01, 
              boxShadow: '0 2px 12px 0 rgba(139,92,246,0.15)' 
            }}
            className={`relative flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer bg-gradient-to-r ${idx === 0 ? 'from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'from-base-100/80 to-base-200/60 hover:from-base-100 hover:to-base-200'} shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm w-6 text-center ${rankColors[idx]}`}>
                {user.rank}
              </span>
              <span className="text-lg">{rankIcons[idx]}</span>
            </div>
            
            <Avatar className="h-8 w-8 ring-1 ring-accent/20 shadow-md">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-accent/10 text-accent font-bold text-sm">{user.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <span className="font-semibold truncate text-base-content/90 block text-sm">
                {user.name}
              </span>
              <span className="text-xs text-base-content/60 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-orange-500" />
                {user.streak} day streak
              </span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="badge badge-accent badge-outline text-xs font-mono px-2 py-1 shadow-sm">
                {user.points} pts
              </span>
              {idx === 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs text-yellow-500 font-bold"
                >
                  CHAMPION
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SpotlightCard>
  );
}



// --- Compact Project Showcase ---
function DashboardShowcase() {
  const showcaseProjects = [
    {
      title: 'Distributed Cache System',
      author: 'Aarav Sharma',
      upvotes: 42,
      stack: ['Redis', 'Node.js', 'Docker'],
      description: 'High-performance caching solution with Redis cluster',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'ML Pipeline Automation',
      author: 'Priya Patel',
      upvotes: 35,
      stack: ['Python', 'TensorFlow', 'AWS'],
      description: 'Automated machine learning workflow pipeline',
      color: 'from-purple-500/20 to-pink-500/20'
    },
  ];

  return (
    <SpotlightCard className="bg-gradient-to-br from-base-200/80 to-base-100/60 rounded-xl shadow-lg border border-base-300/50 p-3 h-69">
      <h2 className="text-sm font-bold text-success font-heading mb-2 flex items-center gap-2">
        <Star className="text-success w-4 h-4" /> 
        <GradientText text="Project Showcase" gradient="from-success to-accent" className="text-sm" />
      </h2>
      
      <div className="space-y-2">
        {showcaseProjects.map((project, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -1, scale: 1.01, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="relative cursor-pointer group"
          >
            <div className={`bg-gradient-to-br ${project.color} rounded-lg shadow-sm border border-base-300/50 p-2`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-base-content truncate mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-base-content/70 mb-1 line-clamp-1">
                    {project.description}
                  </p>
                  <span className="text-xs text-base-content/60 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    by {project.author}
                  </span>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-end gap-1"
                >
                  <span className="badge badge-success font-mono px-1.5 py-0.5 text-xs rounded-full shadow-sm bg-gradient-to-r from-success to-accent border-none">
                    +{project.upvotes}
                  </span>
                  <motion.button 
                    whileHover={{ x: 1 }}
                    className="btn btn-xs btn-primary rounded-full px-1.5 py-0.5 text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                  >
                    View
                    <ArrowRight className="w-2.5 h-2.5" />
                  </motion.button>
                </motion.div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {project.stack?.slice(0, 3).map((tag) => (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    className="badge badge-outline badge-primary badge-xs px-1 py-0.5 rounded-full font-medium border-primary/30"
                  >
                    {tag}
                  </motion.span>
                ))}
                {project.stack?.length > 3 && (
                  <span className="badge badge-outline badge-primary badge-xs px-1 py-0.5 rounded-full font-medium border-primary/30">
                    +{project.stack.length - 3}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SpotlightCard>
  );
}

// --- Main Dashboard Page ---
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { scoringData, loading: scoringLoading } = useUserScoring();
  const [achievement, setAchievement] = useState<any>(null);

  const handleAchievement = (newAchievement: any) => {
    setAchievement(newAchievement);
    setTimeout(() => setAchievement(null), 5000);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-background via-base-100 to-base-200 flex flex-col relative overflow-hidden">
      <FloatingParticles />
      
      <div className="flex-1 flex flex-col w-full px-6 py-4 space-y-4 relative z-10 overflow-hidden">
        {/* --- Header Section --- */}
        <DashboardHeader user={user} onAchievement={handleAchievement} />
        
        {/* --- Stats Row --- */}
        <DashboardStatsRow />
        
        {/* --- Main Grid Layout --- */}
        <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
          {/* Leaderboard */}
          <div className="col-span-12 md:col-span-3 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <DashboardLeaderboard />
            </div>
          </div>
          {/* Skill Tracking */}
          <div className="col-span-12 md:col-span-3 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <SkillTrackingCard scoringData={scoringData} loading={scoringLoading} />
            </div>
          </div>
          {/* Project Showcase */}
          <div className="col-span-12 md:col-span-3 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <DashboardShowcase />
            </div>
          </div>
          {/* Bookmarked Resources */}
          <div className="col-span-12 md:col-span-3 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <BookmarkedResourcesCard />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Notification */}
      <AnimatePresence>
        {achievement && (
          <AchievementNotification 
            achievement={achievement} 
            onClose={() => setAchievement(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}