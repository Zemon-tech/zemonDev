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
  Flame,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

interface ActiveChallenge {
  id: string;
  name: string;
  participants: number;
  timeRemaining: string;
  difficulty: 'easy' | 'medium' | 'hard';
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

  // Active challenges
  const activeChallenges: ActiveChallenge[] = [
    { id: '1', name: 'Binary Tree Traversal', participants: 45, timeRemaining: '2h 30m', difficulty: 'medium' },
    { id: '2', name: 'API Rate Limiter', participants: 32, timeRemaining: '4h 15m', difficulty: 'hard' },
    { id: '3', name: 'String Manipulation', participants: 67, timeRemaining: '1h 45m', difficulty: 'easy' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between h-9 px-4 py-1 border-b border-base-300 bg-base-200 sticky top-0 z-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-medium text-base-content">Nirvana</h2>
          <p className="text-[10px] text-base-content/70">Live Community Feed</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          {/* Left Column - Activity Feed */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-6"
          >
            {/* Live Activity */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-base-content">Live Activity</h3>
              </div>
              <div className="space-y-2">
                {activityFeed.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "p-3 rounded-lg border bg-card/50",
                      "hover:bg-card/80 transition-colors duration-200"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        {activity.user.avatar ? (
                          <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        ) : (
                          <AvatarFallback>
                            {activity.user.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm">{activity.user.name}</span>
                          <span className="text-xs text-base-content/70">{activity.content}</span>
                          {activity.metadata?.challengeName && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Target className="w-3 h-3" />
                              <span>{activity.metadata.challengeName}</span>
                            </div>
                          )}
                          {activity.metadata?.badge && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Crown className="w-3 h-3" />
                              <span>{activity.metadata.badge}</span>
                            </div>
                          )}
                          {activity.metadata?.projectName && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Sparkles className="w-3 h-3" />
                              <span>{activity.metadata.projectName}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-base-content/60">
                            {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {activity.metadata?.points && (
                            <div className="flex items-center gap-1 text-[10px] text-success">
                              <Star className="w-3 h-3" />
                              <span>+{activity.metadata.points} points</span>
                            </div>
                          )}
                          {activity.metadata?.rank === 1 && (
                            <div className="flex items-center gap-1 text-[10px] text-warning">
                              <Trophy className="w-3 h-3" />
                              <span>First Place!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Challenges */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-base-content">Active Challenges</h3>
              </div>
              <div className="grid gap-2">
                {activeChallenges.map((challenge) => (
                  <Button
                    key={challenge.id}
                    variant="outline"
                    className="w-full h-auto p-3 flex items-center justify-between hover:bg-base-200"
                  >
                    <div className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium text-sm text-left">{challenge.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-base-content/70">
                            <Users className="w-3 h-3" />
                            <span>{challenge.participants}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-base-content/70">
                            <Clock className="w-3 h-3" />
                            <span>{challenge.timeRemaining}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full",
                            challenge.difficulty === 'easy' && "bg-success/10 text-success",
                            challenge.difficulty === 'medium' && "bg-warning/10 text-warning",
                            challenge.difficulty === 'hard' && "bg-destructive/10 text-destructive"
                          )}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Trending & Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-64 space-y-6 hidden lg:block"
          >
            {/* Trending Topics */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-base-content">Trending Topics</h3>
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
              <SpotlightCard className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-xs">Online</span>
                    </div>
                    <span className="text-sm font-medium">234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-xs">Messages Today</span>
                    </div>
                    <span className="text-sm font-medium">1.2k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-xs">Solutions</span>
                    </div>
                    <span className="text-sm font-medium">89</span>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NirvanaChannel; 