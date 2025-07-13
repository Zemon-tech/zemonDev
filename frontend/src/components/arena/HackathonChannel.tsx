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
  MessageSquare
} from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  submissions: number;
  requirements: string[];
  testCases?: string[];
  resources?: Array<{
    title: string;
    url: string;
  }>;
}

interface Submission {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  submittedAt: Date;
  score: number;
  status: 'pending' | 'accepted' | 'rejected';
  solutionUrl: string;
  stats?: {
    performance: number;
    quality: number;
    creativity: number;
  };
}

interface HackathonChannelProps {
  isAdmin?: boolean;
}

const HackathonChannel: React.FC<HackathonChannelProps> = ({ isAdmin = false }) => {
  // Mock data
  const currentChallenge: Challenge = {
    id: '1',
    title: 'Build a Real-time Chat Application',
    description: 'Create a real-time chat application using WebSocket technology. The application should support multiple chat rooms, private messaging, and message history.',
    difficulty: 'medium',
    points: 500,
    timeLimit: '7 days',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-22'),
    participants: 156,
    submissions: 42,
    requirements: [
      'Implement real-time messaging using WebSocket',
      'Support multiple chat rooms',
      'Enable private messaging between users',
      'Store message history',
      'Add user presence indicators',
      'Implement basic message formatting'
    ],
    resources: [
      {
        title: 'WebSocket API Documentation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket'
      },
      {
        title: 'Real-time Apps with WebSocket',
        url: 'https://example.com/websocket-tutorial'
      }
    ]
  };

  const topSubmissions: Submission[] = [
    {
      id: '1',
      author: {
        id: '1',
        name: 'Alex Developer',
        avatar: 'https://github.com/shadcn.png',
        role: 'Expert'
      },
      submittedAt: new Date('2024-03-20'),
      score: 485,
      status: 'accepted',
      solutionUrl: 'https://github.com/username/chat-app',
      stats: {
        performance: 95,
        quality: 92,
        creativity: 88
      }
    },
    {
      id: '2',
      author: {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://github.com/shadcn.png',
        role: 'Advanced'
      },
      submittedAt: new Date('2024-03-19'),
      score: 470,
      status: 'accepted',
      solutionUrl: 'https://github.com/username/realtime-chat',
      stats: {
        performance: 90,
        quality: 94,
        creativity: 85
      }
    }
  ];

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
  const timeRemaining = () => {
    const now = new Date();
    const end = currentChallenge.endDate;
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

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
                <h3 className="font-medium text-base-content">Points</h3>
              </div>
              <CountUp
                from={0}
                to={currentChallenge.points}
                className="text-3xl font-bold text-base-content"
              />
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
                to={currentChallenge.participants}
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
              <p className="text-3xl font-bold text-base-content">{timeRemaining()}</p>
            </div>
          </motion.div>

          {/* Challenge Details */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-base-content">{currentChallenge.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium",
                      currentChallenge.difficulty === 'easy' && "bg-success/10 text-success",
                      currentChallenge.difficulty === 'medium' && "bg-warning/10 text-warning",
                      currentChallenge.difficulty === 'hard' && "bg-destructive/10 text-destructive"
                    )}>
                      {currentChallenge.difficulty.charAt(0).toUpperCase() + currentChallenge.difficulty.slice(1)}
                    </span>
                    <span className="text-sm text-base-content/70">
                      {currentChallenge.timeLimit}
                    </span>
                  </div>
                </div>
                <Button className="gap-2">
                  Submit Solution
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-base-content/80 leading-relaxed">
                {currentChallenge.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-base-content">Requirements</h3>
              <ul className="space-y-2">
                {currentChallenge.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-base-content/80">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            {currentChallenge.resources && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-base-content">Helpful Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentChallenge.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "p-4 rounded-lg border",
                        "flex items-center gap-3",
                        "hover:bg-base-200 transition-colors"
                      )}
                    >
                      <FileCode className="w-5 h-5 text-primary" />
                      <span className="flex-1 text-base-content/80">{resource.title}</span>
                      <ExternalLink className="w-4 h-4 text-base-content/60" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Top Submissions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-base-content mb-4">Top Submissions</h3>
            <div className="space-y-4">
              {topSubmissions.map((submission, index) => (
                <div
                  key={submission.id}
                  className={cn(
                    "p-6 rounded-lg border",
                    "bg-card/50 border-border/50",
                    "hover:bg-card/80 transition-colors duration-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {submission.author.avatar ? (
                            <AvatarImage src={submission.author.avatar} alt={submission.author.name} />
                          ) : (
                            <AvatarFallback>
                              <User className="w-5 h-5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base-content">{submission.author.name}</span>
                            <Badge variant="outline" className="text-xs font-normal">
                              {submission.author.role}
                            </Badge>
                          </div>
                          <div className="text-sm text-base-content/70">
                            {submission.submittedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      {submission.stats && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-base-content">
                              {submission.stats.performance}%
                            </div>
                            <div className="text-xs text-base-content/70">Performance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-base-content">
                              {submission.stats.quality}%
                            </div>
                            <div className="text-xs text-base-content/70">Quality</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-base-content">
                              {submission.stats.creativity}%
                            </div>
                            <div className="text-xs text-base-content/70">Creativity</div>
                          </div>
                        </div>
                      )}

                      {/* Score and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-base-content">{submission.score}</div>
                          <div className="text-xs text-base-content/70">points</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            asChild
                          >
                            <a href={submission.solutionUrl} target="_blank" rel="noopener noreferrer">
                              <GitBranch className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HackathonChannel; 