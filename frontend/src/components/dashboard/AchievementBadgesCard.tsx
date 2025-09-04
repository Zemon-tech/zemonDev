import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Flame, 
  Brain, 
  Code, 
  Lightbulb
} from 'lucide-react';
import { DashboardCard } from '@/components/dashboard';
import { UserScoringData } from '@/lib/userScoringApi';

// Achievement Badge Component inspired by 21st.dev
const AchievementBadge = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  level = "gold",
  unlocked = false,
  progress = 0,
  onClick
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  level?: "bronze" | "silver" | "gold" | "platinum";
  unlocked?: boolean;
  progress?: number;
  onClick?: () => void;
}) => {
  const levelColors = {
    bronze: "from-amber-600 to-amber-800",
    silver: "from-gray-400 to-gray-600", 
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-slate-300 to-slate-500"
  };

  const levelIcons = {
    bronze: "🥉",
    silver: "🥈", 
    gold: "🥇",
    platinum: "💎"
  };

  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 ${
        unlocked ? 'opacity-100' : 'opacity-50'
      }`}
    >
      <div className="relative">
        {/* Badge Background */}
        <div className={`
          relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center
          ${unlocked 
            ? `bg-gradient-to-br ${levelColors[level]} border-white shadow-none ring-2 ring-white/80 ring-offset-2 ring-offset-base-100` 
            : 'bg-gray-300 border-gray-400'
          }
        `}>
          {/* Icon */}
          <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${unlocked ? 'text-white' : 'text-gray-500'}`} />
          
          {/* Level Indicator */}
          <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold">
            {levelIcons[level]}
          </div>
        </div>

        {/* Progress Ring (if not unlocked) */}
        {!unlocked && progress > 0 && (
          <svg className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-gray-300"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-1000"
            />
          </svg>
        )}

        {/* Unlock Animation */}
        {unlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse"
          />
        )}
      </div>

      {/* Badge Info */}
      <div className="mt-2 text-center">
        <h3 className={`text-xs font-bold ${unlocked ? 'text-base-content' : 'text-gray-500'}`}>
          {title}
        </h3>
        <p className="text-xs text-base-content/70 mt-1">
          {subtitle}
        </p>
        {!unlocked && progress > 0 && (
          <div className="text-xs text-primary font-mono mt-1">
            {progress}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface AchievementBadgesCardProps {
  scoringData?: UserScoringData;
  loading?: boolean;
}

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_problem',
    title: 'First Steps',
    subtitle: 'Solve your first problem',
    icon: Target,
    level: 'bronze' as const,
    condition: (data: UserScoringData) => data.totalPoints > 0,
    progress: (data: UserScoringData) => data.totalPoints > 0 ? 100 : 0
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    subtitle: '7-day solving streak',
    icon: Flame,
    level: 'bronze' as const,
    condition: (_data: UserScoringData) => false, // Will be calculated from streak data
    progress: (_data: UserScoringData) => 0 // Will be calculated from streak data
  },
  {
    id: 'points_100',
    title: 'Century Club',
    subtitle: 'Earn 100 points',
    icon: Star,
    level: 'silver' as const,
    condition: (data: UserScoringData) => data.totalPoints >= 100,
    progress: (data: UserScoringData) => Math.min((data.totalPoints / 100) * 100, 100)
  },
  {
    id: 'expert_skill',
    title: 'Skill Master',
    subtitle: 'Reach expert level in any skill',
    icon: Brain,
    level: 'silver' as const,
    condition: (data: UserScoringData) => data.skills?.some(skill => skill.averageScore >= 90),
    progress: (data: UserScoringData) => {
      const maxSkill = Math.max(...(data.skills?.map(s => s.averageScore) || [0]));
      return Math.min((maxSkill / 90) * 100, 100);
    }
  },
  {
    id: 'points_500',
    title: 'Half Grand',
    subtitle: 'Earn 500 points',
    icon: Trophy,
    level: 'gold' as const,
    condition: (data: UserScoringData) => data.totalPoints >= 500,
    progress: (data: UserScoringData) => Math.min((data.totalPoints / 500) * 100, 100)
  },
  {
    id: 'multi_category',
    title: 'Diverse Learner',
    subtitle: 'Solve problems in 5+ categories',
    icon: Code,
    level: 'gold' as const,
    condition: (data: UserScoringData) => {
      const categories = Object.keys(data.problemsByCategory || {});
      return categories.length >= 5;
    },
    progress: (data: UserScoringData) => {
      const categories = Object.keys(data.problemsByCategory || {});
      return Math.min((categories.length / 5) * 100, 100);
    }
  },
  {
    id: 'points_1000',
    title: 'Grand Master',
    subtitle: 'Earn 1000 points',
    icon: Award,
    level: 'platinum' as const,
    condition: (data: UserScoringData) => data.totalPoints >= 1000,
    progress: (data: UserScoringData) => Math.min((data.totalPoints / 1000) * 100, 100)
  },
  {
    id: 'perfect_score',
    title: 'Perfectionist',
    subtitle: 'Get 100% on a problem',
    icon: Zap,
    level: 'platinum' as const,
    condition: (data: UserScoringData) => data.highestScore >= 100,
    progress: (data: UserScoringData) => Math.min((data.highestScore / 100) * 100, 100)
  }
];

export const AchievementBadgesCard: React.FC<AchievementBadgesCardProps> = ({ 
  scoringData, 
  loading = false 
}) => {
  if (loading) {
    return (
      <DashboardCard variant="default" className="p-3 sm:p-4 h-auto sm:h-69">
        <div className="animate-pulse">
          <div className="h-5 sm:h-6 bg-base-300 rounded mb-3 sm:mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-base-300 rounded-full mb-2"></div>
                <div className="h-2 sm:h-3 bg-base-300 rounded w-8 sm:w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    );
  }

  if (!scoringData) {
    return (
      <DashboardCard variant="default" className="p-4 h-69">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">No Achievements Yet</h3>
          <p className="text-sm text-base-content/50">
            Start solving problems to unlock achievements!
          </p>
        </div>
      </DashboardCard>
    );
  }

  const unlockedAchievements = ACHIEVEMENTS.filter(achievement => 
    achievement.condition(scoringData)
  );

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.length;
  const progressPercentage = (unlockedCount / totalAchievements) * 100;

  return (
    <DashboardCard variant="default" className="p-3 sm:p-4 h-auto sm:h-69 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-bold text-base-content flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          <span className="hidden sm:inline">Achievements</span>
          <span className="sm:hidden">Badges</span>
        </h2>
        <div className="badge badge-warning badge-sm">
          {unlockedCount}/{totalAchievements}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-base-content/70 mb-2">
          <span>Progress</span>
          <span>{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-warning to-warning/70 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {ACHIEVEMENTS.map((achievement, idx) => {
          const unlocked = achievement.condition(scoringData);
          const progress = achievement.progress(scoringData);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <AchievementBadge
                title={achievement.title}
                subtitle={achievement.subtitle}
                icon={achievement.icon}
                level={achievement.level}
                unlocked={unlocked}
                progress={progress}
                onClick={() => {
                  if (unlocked) {
                    // Show achievement details
                    console.log(`Achievement unlocked: ${achievement.title}`);
                  }
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Recent Unlocks */}
      {unlockedAchievements.length > 0 && (
        <div className="mt-6 pt-4 border-t border-base-300/30">
          <h3 className="text-sm font-semibold text-base-content/80 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-success" />
            Recent Unlocks
          </h3>
          <div className="space-y-2">
            {unlockedAchievements.slice(0, 3).map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex items-center gap-3 p-2 bg-success/10 rounded-lg border border-success/20"
              >
                <achievement.icon className="w-4 h-4 text-success" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-base-content">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-base-content/70">
                    {achievement.subtitle}
                  </div>
                </div>
                <div className="text-xs font-bold text-success">
                  {achievement.level.toUpperCase()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
};
