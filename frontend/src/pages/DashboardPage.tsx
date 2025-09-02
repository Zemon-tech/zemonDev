import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Code, Flame, Star, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Aurora } from '@/components/blocks/Aurora';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { Confetti } from '@/components/blocks/Confetti';

import { useState } from 'react';
import { useZemonStreak } from '@/hooks/useZemonStreak';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserScoring } from '@/hooks/useUserScoring';
import { useStreakLeaderboard } from '@/hooks/useStreakLeaderboard';
import { SkillBreakdownCard } from '@/components/dashboard/SkillBreakdownCard';
import { AchievementBadgesCard } from '@/components/dashboard/AchievementBadgesCard';
import { 
  StatCard, 
  DashboardCard, 
  LoadingSkeleton,
  STAT_CARD_CONFIGS,
  HOVER_EFFECTS,
  MOCK_DATA
} from '@/components/dashboard';

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
      <SpotlightCard className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-xl shadow-lg bg-gradient-to-br from-base-200/80 to-base-100/60 backdrop-blur-xl border border-base-300/50">
        {/* Avatar & Greeting */}
        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
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
          <div className="flex flex-col min-w-0 flex-1 sm:flex-none">
            <div className="flex items-center gap-2 flex-wrap">
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
        {/* Compact Quote - Hidden on mobile */}
        <div className="hidden lg:flex flex-col items-end justify-center max-w-xs ml-auto">
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

// --- Responsive Stats Row ---
function DashboardStatsRow() {
  const { streakInfo, loading: streakLoading } = useZemonStreak();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { scoringData, loading: scoringLoading } = useUserScoring();
  
  const solvedCount = profileLoading
    ? 0
    : ((userProfile as any)?.solvedCount ?? userProfile?.stats?.problemsSolved ?? (userProfile?.completedSolutions?.length || 0));
  
  const totalPoints = scoringLoading ? 0 : (scoringData?.totalPoints || 0);
  const averageScore = scoringLoading ? 0 : (scoringData?.averageScore || 0);
  
  if (scoringLoading || profileLoading || streakLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <LoadingSkeleton key={idx} variant="stat" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: Flame,
      value: streakInfo?.currentStreak || 0,
      label: "Zemon Streak",
      color: STAT_CARD_CONFIGS.streak.color,
      bgGradient: STAT_CARD_CONFIGS.streak.bgGradient,
      borderColor: STAT_CARD_CONFIGS.streak.borderColor
    },
    {
      icon: Code,
      value: solvedCount,
      label: "Problems Solved",
      color: STAT_CARD_CONFIGS.problems.color,
      bgGradient: STAT_CARD_CONFIGS.problems.bgGradient,
      borderColor: STAT_CARD_CONFIGS.problems.borderColor
    },
    {
      icon: Star,
      value: totalPoints,
      label: "Total Points",
      color: STAT_CARD_CONFIGS.points.color,
      bgGradient: STAT_CARD_CONFIGS.points.bgGradient,
      borderColor: STAT_CARD_CONFIGS.points.borderColor
    },
    {
      icon: Trophy,
      value: `${averageScore}%`,
      label: "Avg Score",
      color: STAT_CARD_CONFIGS.score.color,
      bgGradient: STAT_CARD_CONFIGS.score.bgGradient,
      borderColor: STAT_CARD_CONFIGS.score.borderColor
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          {...stat}
          delay={idx * 0.1}
        />
      ))}
    </div>
  );
}

// --- Responsive Leaderboard ---
function DashboardLeaderboard() {
  const { data, loading, error } = useStreakLeaderboard(3);
  const leaderboardData = (!loading && !error && data.length > 0)
    ? data.map(u => ({ name: u.name, points: u.points, rank: u.rank, avatar: u.avatar, streak: u.streak }))
    : MOCK_DATA.leaderboard;

  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const rankIcons = ['🥇', '🥈', '🥉'];

  return (
    <DashboardCard variant="default" className="p-3 sm:p-4 h-auto sm:h-69">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-accent font-heading flex items-center gap-2">
          <Trophy className="text-accent w-4 h-4" /> 
          <span className="text-sm">Leaderboard</span>
          <span className="text-xs text-base-content/60">(Top 3)</span>
        </h2>
      </div>
      
      <div className="space-y-2">
        {leaderboardData.map((user, idx) => (
          <motion.div
            key={user.rank}
            whileHover={HOVER_EFFECTS.card}
            className={`relative flex items-center gap-2 sm:gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer bg-gradient-to-r ${idx === 0 ? 'from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'from-base-100/80 to-base-200/60 hover:from-base-100 hover:to-base-200'} shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`font-bold text-xs sm:text-sm w-4 sm:w-6 text-center ${rankColors[idx]}`}>
                {user.rank}
              </span>
              <span className="text-sm sm:text-lg">{rankIcons[idx]}</span>
            </div>
            
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-1 ring-accent/20 shadow-md">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-accent/10 text-accent font-bold text-xs sm:text-sm">{user.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <span className="font-semibold truncate text-base-content/90 block text-xs sm:text-sm">
                {user.name}
              </span>
              <span className="text-xs text-base-content/60 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-orange-500" />
                <span className="hidden sm:inline">{user.streak} day streak</span>
                <span className="sm:hidden">{user.streak}d</span>
              </span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="badge badge-accent badge-outline text-xs font-mono px-1 sm:px-2 py-1 shadow-sm">
                <span className="hidden sm:inline">{user.points} pts</span>
                <span className="sm:hidden">{user.points}</span>
              </span>
              {idx === 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs text-yellow-500 font-bold hidden sm:block"
                >
                  CHAMPION
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardCard>
  );
}

// --- Collapsible Section Component ---
function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ComponentType<any>; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-base-300/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-base-100/50 hover:bg-base-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-base-content">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-base-content/60" />
        ) : (
          <ChevronDown className="w-4 h-4 text-base-content/60" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
      
      <div className="flex-1 flex flex-col w-full px-3 sm:px-6 py-4 space-y-4 relative z-10 overflow-hidden">
        {/* --- Header Section --- */}
        <DashboardHeader user={user} onAchievement={handleAchievement} />
        
        {/* --- Stats Row --- */}
        <DashboardStatsRow />
        
        {/* --- Mobile Layout: Collapsible Sections --- */}
        <div className="block lg:hidden space-y-4">
          <CollapsibleSection title="Leaderboard" icon={Trophy} defaultOpen={true}>
            <div className="p-3">
              <DashboardLeaderboard />
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Skill Focus" icon={Code} defaultOpen={true}>
            <div className="p-3">
              <SkillBreakdownCard scoringData={scoringData || undefined} loading={scoringLoading} />
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Achievements" icon={Star} defaultOpen={true}>
            <div className="p-3">
              <AchievementBadgesCard scoringData={scoringData || undefined} loading={scoringLoading} />
            </div>
          </CollapsibleSection>
        </div>

        {/* --- Tablet Layout: 2x2 Grid --- */}
        <div className="hidden lg:block xl:hidden">
          <div className="grid grid-cols-2 gap-4">
            {/* Leaderboard */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <DashboardLeaderboard />
              </div>
            </div>
            {/* Skill Breakdown */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <SkillBreakdownCard scoringData={scoringData || undefined} loading={scoringLoading} />
              </div>
            </div>
            {/* Achievements - Full Width */}
            <div className="col-span-2 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <AchievementBadgesCard scoringData={scoringData || undefined} loading={scoringLoading} />
              </div>
            </div>
          </div>
        </div>

        {/* --- Desktop Layout: 3 Column Grid --- */}
        <div className="hidden xl:block">
          <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
            {/* Leaderboard */}
            <div className="col-span-3 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <DashboardLeaderboard />
              </div>
            </div>
            {/* Skill Breakdown */}
            <div className="col-span-4 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <SkillBreakdownCard scoringData={scoringData || undefined} loading={scoringLoading} />
              </div>
            </div>
            {/* Achievements */}
            <div className="col-span-5 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <AchievementBadgesCard scoringData={scoringData || undefined} loading={scoringLoading} />
              </div>
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