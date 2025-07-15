import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CountUp } from '@/components/blocks/CountUp';
import { 
  Trophy,
  Clock,
  User,
  Code,
  FileCode,
  ExternalLink,
  ChevronRight,
  Users,
  CheckCircle2,
  Star,
  Rocket,
  Zap,
  Target,
  GitBranch,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useArenaHackathon } from '@/hooks/useArenaHackathon';

interface Submission {
  userId: string;
  username: string;
  score: number;
  submissionTime: Date;
}

interface HackathonChannelProps {
  isAdmin?: boolean;
}

const HackathonChannel: React.FC<HackathonChannelProps> = ({ isAdmin = false }) => {
  const { currentHackathon, loading, error } = useArenaHackathon();

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

  // Calculate time remaining
  const timeRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Challenge ended';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading hackathon data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <AlertCircle className="w-8 h-8 text-error" />
        <p className="mt-2 text-error">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!currentHackathon) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Trophy className="w-12 h-12 text-primary/50" />
        <p className="mt-4 text-base-content/70">No active hackathon at the moment.</p>
        <p className="text-base-content/50">Check back later for new challenges!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between h-9 px-4 py-1 border-b border-base-300 bg-base-200 sticky top-0 z-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-medium text-base-content">Weekly Challenge</h2>
          <p className="text-[10px] text-base-content/70">Test your skills and compete</p>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 space-y-8"
        >
          {/* Challenge Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className={cn(
              "p-6 rounded-xl border",
              "bg-primary/5 border-primary/10",
              "hover:bg-primary/10 transition-colors duration-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-base-content">Status</h3>
              </div>
              <p className="text-2xl font-bold text-base-content">
                {currentHackathon.isActive ? 'Active' : 'Completed'}
              </p>
            </div>

            <div className={cn(
              "p-6 rounded-xl border",
              "bg-card/50 border-border/50",
              "hover:bg-card/80 transition-colors duration-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-base-content">Participants</h3>
              </div>
              <CountUp
                from={0}
                to={currentHackathon.leaderboard.length}
                className="text-3xl font-bold text-base-content"
              />
            </div>

            <div className={cn(
              "p-6 rounded-xl border",
              "bg-card/50 border-border/50",
              "hover:bg-card/80 transition-colors duration-200"
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-base-content">Time Remaining</h3>
              </div>
              <p className="text-xl font-bold text-base-content">{timeRemaining(currentHackathon.endDate)}</p>
            </div>
          </motion.div>

          {/* Challenge Details */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-base-content">{currentHackathon.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-base-content/70">
                      {new Date(currentHackathon.startDate).toLocaleDateString()} - {new Date(currentHackathon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-base-content/80">
                {currentHackathon.description}
              </p>

              <div className="p-4 bg-base-200 rounded-lg border border-base-300">
                <h3 className="font-medium text-base-content mb-2">Problem Statement</h3>
                <p className="text-base-content/80">{currentHackathon.problem}</p>
              </div>

              <div>
                <h3 className="font-medium text-base-content mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {currentHackathon.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-base-content/80">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Leaderboard
            </h3>

            <div className="bg-base-200 rounded-lg border border-base-300 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-3 border-b border-base-300 bg-base-300/50 text-sm font-medium text-base-content">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Participant</div>
                <div className="col-span-2 text-right">Score</div>
                <div className="col-span-2 text-right">Submitted</div>
              </div>

              <div className="divide-y divide-base-300">
                {currentHackathon.leaderboard
                  .sort((a, b) => b.score - a.score)
                  .map((submission, index) => (
                    <div 
                      key={submission.userId} 
                      className={cn(
                        "grid grid-cols-12 gap-4 p-3 items-center hover:bg-base-300/30 transition-colors",
                        index < 3 && "bg-primary/5"
                      )}
                    >
                      <div className="col-span-1 font-medium">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Trophy className="w-5 h-5 text-amber-700" />}
                        {index > 2 && (index + 1)}
                      </div>
                      <div className="col-span-7 flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {submission.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-base-content">{submission.username}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-right font-mono font-medium">
                        {submission.score}
                      </div>
                      <div className="col-span-2 text-right text-sm text-base-content/70">
                        {new Date(submission.submissionTime).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>

          {/* Submit Solution Button */}
          {currentHackathon.isActive && (
            <motion.div variants={itemVariants} className="flex justify-center">
              <Button className="px-8 py-6 text-lg gap-2">
                <FileCode className="w-5 h-5" />
                Submit Your Solution
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HackathonChannel; 