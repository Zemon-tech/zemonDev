import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Crown, Medal, Award } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DashboardCard } from '@/components/dashboard';
import { useStreakLeaderboard } from '@/hooks/useStreakLeaderboard';
import { MOCK_DATA } from '@/components/dashboard';

interface DashboardLeaderboardProps {
  limit?: number;
  className?: string;
}

export const DashboardLeaderboard: React.FC<DashboardLeaderboardProps> = ({ 
  limit = 5,
  className = "p-3 sm:p-4 h-auto sm:h-69"
}) => {
  const { data, loading, error } = useStreakLeaderboard(limit);
  const leaderboardData = (!loading && !error && data.length > 0)
    ? data.map(u => ({ name: u.name, points: u.points, rank: u.rank, avatar: u.avatar, streak: u.streak }))
    : MOCK_DATA.leaderboard;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Award className="w-4 h-4 text-amber-600" />;
      default: return <Trophy className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/15 via-amber-500/10 to-orange-500/15 border-yellow-500/30 shadow-yellow-500/20';
      case 2: return 'from-gray-400/15 via-slate-400/10 to-gray-500/15 border-gray-400/30 shadow-gray-400/20';
      case 3: return 'from-amber-600/15 via-orange-500/10 to-amber-700/15 border-amber-600/30 shadow-amber-500/20';
      default: return 'from-base-100/90 via-base-200/50 to-base-100/90 border-base-300/40 shadow-slate-500/10';
    }
  };

  if (loading) {
    return (
      <DashboardCard variant="default" className={className}>
        <div className="animate-pulse">
          <div className="h-5 sm:h-6 bg-base-300 rounded mb-3 sm:mb-4 w-32"></div>
          <div className="space-y-2 sm:space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-base-200/40">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-base-300/60 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 sm:h-3.5 bg-base-300/60 rounded w-20 sm:w-24 mb-1 sm:mb-1.5"></div>
                  <div className="h-2 sm:h-2.5 bg-base-300/60 rounded w-14 sm:w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard variant="default" className={className}>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">Leaderboard Unavailable</h3>
          <p className="text-sm text-base-content/50">
            Unable to load leaderboard data. Please try again later.
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard variant="default" className={className}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-base-300/30">
        <Trophy className="text-accent w-4.5 h-4.5" /> 
        <h2 className="text-base font-bold text-accent font-heading">
          Leaderboard
        </h2>
        <div className="ml-auto">
          <span className="text-xs text-base-content/50 bg-base-200/60 px-2 py-1 rounded-full font-medium">
            Top {limit}
          </span>
        </div>
      </div>
      
      {/* Leaderboard Items */}
      <div className="space-y-2 overflow-y-auto max-h-48 sm:max-h-52 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent hover:scrollbar-thumb-base-content/30">
        {leaderboardData.slice(0, limit).map((user) => (
          <motion.div
            key={user.rank}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer bg-gradient-to-r border backdrop-blur-sm hover:shadow-lg ${getRankStyle(user.rank)}`}
          >
            {/* Rank & Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-base-100/50 backdrop-blur-sm shadow-sm">
              {getRankIcon(user.rank)}
            </div>
            
            {/* Avatar */}
            <div className="relative">
              {/* White background for transparent avatars */}
              <div className="absolute inset-0 h-8 w-8 rounded-full bg-white"></div>
              <Avatar className="h-8 w-8 ring-2 ring-white/20 shadow-lg relative z-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-accent/20 text-accent font-bold text-sm border border-accent/30">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate text-base-content text-sm leading-tight">
                  {user.name}
                </span>
                {user.rank === 1 && (
                  <motion.span
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold"
                  >
                    CHAMPION
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-base-content/60 font-medium">
                  {user.streak} day streak
                </span>
              </div>
            </div>
            

            {/* Premium Glow Effect for Top 3 */}
            {user.rank <= 3 && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-5 pointer-events-none" 
                   style={{
                     background: user.rank === 1 ? 'linear-gradient(45deg, #fbbf24, #f59e0b)' :
                                user.rank === 2 ? 'linear-gradient(45deg, #9ca3af, #6b7280)' :
                                'linear-gradient(45deg, #d97706, #92400e)'
                   }} />
            )}
          </motion.div>
        ))}
      </div>
    </DashboardCard>
  );
};
