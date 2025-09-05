import { useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Code, Flame, Star, Quote} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Aurora } from '@/components/blocks/Aurora';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { Confetti } from '@/components/blocks/Confetti';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZemonStreak } from '@/hooks/useZemonStreak';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserScoring } from '@/hooks/useUserScoring';
// import { SkillBreakdownCard } from '@/components/dashboard/SkillBreakdownCard';
// import { AchievementBadgesCard } from '@/components/dashboard/AchievementBadgesCard';
import { 
  StatCard, 
  LoadingSkeleton,
  STAT_CARD_CONFIGS
} from '@/components/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/dashboard/sections/OverviewTab';
import { FocusTab } from '@/components/dashboard/sections/FocusTab';
import { InsightsTab } from '@/components/dashboard/sections/InsightsTab';
import { ActivityTab } from '@/components/dashboard/sections/ActivityTab';

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


// --- Collapsible Section Component ---
// Note: CollapsibleSection is not currently used; keeping for potential reuse
/*
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
*/

// --- Main Dashboard Page ---
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { scoringData, loading: scoringLoading } = useUserScoring();
  const [achievement, setAchievement] = useState<any>(null);
  const [nextUp, setNextUp] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loadingDash, setLoadingDash] = useState<boolean>(true);
  const [errorDash, setErrorDash] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleAchievement = (newAchievement: any) => {
    setAchievement(newAchievement);
    setTimeout(() => setAchievement(null), 5000);
  };

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (!isLoaded || !user?.id) return;
      try {
        setLoadingDash(true);
        setErrorDash(null);
        const token = await getToken();
        if (!token) throw new Error('No token');
        const base = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:3001/api';
        const headers = { 'Authorization': `Bearer ${token}` } as const;
        const [r1, r2, r3] = await Promise.all([
          fetch(`${base}/users/me/dashboard`, { headers }),
          fetch(`${base}/users/me/insights`, { headers }),
          fetch(`${base}/users/me/next-up`, { headers })
        ]);
        if (!r1.ok || !r2.ok || !r3.ok) throw new Error('Failed to load dashboard data');
        const j1 = await r1.json();
        const j2 = await r2.json();
        const j3 = await r3.json();
        if (!mounted) return;
        setSummary(j1.data || null);
        setInsights(j2.data || null);
        setNextUp(j3.data || null);
      } catch (e: any) {
        if (!mounted) return;
        setErrorDash(e?.message || 'Failed to load');
      } finally {
        if (mounted) setLoadingDash(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  // We intentionally omit getToken to avoid identity changes causing refetch loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  const handleNextUpAction = async () => {
    if (!nextUp?.action) return;
    const action = nextUp.action || {};
    if (action.kind === 'open_bookmarks') {
      navigate('/forge?bookmarked=1');
      return;
    }
    if (action.kind === 'solve_problem') {
      const q = new URLSearchParams();
      if (action.difficulty) q.set('difficulty', action.difficulty);
      if (action.category) q.set('category', action.category);
      navigate(`/crucible?${q.toString()}`);
      return;
    }
    if (action.kind === 'explore_category') {
      const q = new URLSearchParams();
      if (action.category) q.set('category', action.category);
      navigate(`/crucible?${q.toString()}`);
      return;
    }
  };

  const onRecomputeAnalytics = async () => {
    try {
      setIsRefreshing(true);
      const token = await getToken();
      const base = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:3001/api';
      await fetch(`${base}/users/me/recompute-analytics`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      // re-fetch after recompute
      const headers = { 'Authorization': `Bearer ${token}` } as const;
      const [r1, r2, r3] = await Promise.all([
        fetch(`${base}/users/me/dashboard`, { headers }),
        fetch(`${base}/users/me/insights`, { headers }),
        fetch(`${base}/users/me/next-up`, { headers })
      ]);
      const [j1, j2, j3] = await Promise.all([r1.json(), r2.json(), r3.json()]);
      setSummary(j1.data || null);
      setInsights(j2.data || null);
      setNextUp(j3.data || null);
    } catch (e) {
      // ignore; UI shows previous
    } finally {
      setIsRefreshing(false);
    }
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
    <div className="h-full w-full bg-gradient-to-br from-background via-base-100 to-base-200 flex flex-col relative">
      <FloatingParticles />
      
      <div className="flex-1 flex flex-col w-full px-3 sm:px-6 py-4 space-y-4 relative z-10">
        {/* --- Header Section --- */}
        <DashboardHeader user={user} onAchievement={handleAchievement} />
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList variant="default" size="sm" className="w-full overflow-x-auto bg-base-100/60 border border-base-200/60 rounded-lg p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/50">
            <TabsTrigger value="overview" className="flex-1 rounded-md px-3 py-2 text-xs sm:text-sm transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="focus" className="flex-1 rounded-md px-3 py-2 text-xs sm:text-sm transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Focus</TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 rounded-md px-3 py-2 text-xs sm:text-sm transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Insights</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 rounded-md px-3 py-2 text-xs sm:text-sm transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm">Activity</TabsTrigger>
            </TabsList>
          <TabsContent value="overview" className="mt-3">
            <OverviewTab
              loadingDash={loadingDash}
              errorDash={errorDash}
              nextUp={nextUp}
              onNextUpAction={handleNextUpAction}
              onRecompute={onRecomputeAnalytics}
              isRefreshing={isRefreshing}
              DashboardStatsRow={DashboardStatsRow}
              scoringData={scoringData}
              scoringLoading={scoringLoading}
            />
            </TabsContent>
            <TabsContent value="focus" className="mt-3">
            <FocusTab loading={loadingDash} summary={summary} />
          </TabsContent>
          <TabsContent value="insights" className="mt-3">
            <InsightsTab loading={loadingDash} insights={insights} />
          </TabsContent>
          <TabsContent value="activity" className="mt-3">
            <ActivityTab loadingDash={loadingDash} summary={insights || summary} />
            </TabsContent>
          </Tabs>
        
        {/* Old responsive grids replaced by Activity tab */}
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