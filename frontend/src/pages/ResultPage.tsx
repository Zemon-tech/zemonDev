import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles, 
  BookOpen,
  MessageSquare,
  RefreshCw,
  AlertOctagon,
  Trophy,
  Target,
  Lightbulb,
  Scale,
  Network,
  Zap,
  History
} from 'lucide-react';

// Import ReactBits components
import { Aurora } from '@/components/blocks/Aurora';
import { DotGrid } from '@/components/blocks/DotGrid';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { GlassIcon } from '@/components/blocks/GlassIcons';
import { AnimatedContent } from '@/components/blocks/AnimatedContent';
import { GradientText } from '@/components/blocks/GradientText';
import { CountUp } from '@/components/blocks/CountUp';
import { TiltCard } from '@/components/blocks/TiltCard';
import { CircularProgress } from '@/components/blocks/CircularProgress';
import { FloatingIcon } from '@/components/blocks/FloatingIcon';
import { Timeline } from '@/components/blocks/Timeline';

// Dummy data for development
const dummyResult = {
  problemTitle: "E-commerce System Design",
  summary: "Your solution demonstrates strong understanding of distributed systems and scalability patterns. The architecture effectively addresses the core requirements while maintaining flexibility for future growth.",
  confidence: 95,
  evaluationParams: {
    requirements: [
      "High Availability (99.99%)",
      "Horizontal Scalability",
      "Data Consistency",
      "Real-time Inventory Updates",
      "Payment Processing Integration"
    ],
    technologies: [
      "Kubernetes",
      "Redis",
      "PostgreSQL",
      "RabbitMQ",
      "Elasticsearch",
      "React",
      "Node.js"
    ]
  },
  feedback: {
    strengths: [
      "Excellent separation of concerns in microservices",
      "Well-thought-out caching strategy",
      "Robust error handling mechanisms",
      "Clear API documentation"
    ],
    weaknesses: [
      "Limited discussion of security measures",
      "Could improve database indexing strategy",
      "Monitoring setup needs more detail"
    ],
    suggestions: [
      "Consider implementing circuit breakers",
      "Add rate limiting for API endpoints",
      "Include performance benchmarks",
      "Document disaster recovery plan"
    ]
  },
  resources: [
    {
      title: "Distributed Systems Patterns",
      description: "A comprehensive guide to common patterns in distributed systems architecture",
      source: "Martin Fowler's Blog"
    },
    {
      title: "Database Scaling Strategies",
      description: "Best practices for scaling databases in high-traffic applications",
      source: "AWS Documentation"
    }
  ],
  history: [
    {
      timestamp: "2024-03-15T10:00:00Z",
      score: 92,
      notes: "Initial submission - Strong foundation"
    },
    {
      timestamp: "2024-03-10T15:30:00Z",
      score: 85,
      notes: "First draft - Good start, needs refinement"
    }
  ]
};

const CharacteristicBadge = ({ icon: Icon, name, score }: any) => (
  <TiltCard className="relative group">
    <SpotlightCard className="p-3 flex items-center gap-3 bg-base-200/50 backdrop-blur-sm border border-base-300 rounded-lg hover:shadow-lg transition-all cursor-default">
      <FloatingIcon icon={Icon} className="w-8 h-8 text-primary" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate">{name}</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <CountUp 
            from={0} 
            to={score} 
            duration={1.5}
            className="text-sm font-bold text-primary"
            suffix="%"
          />
        </div>
      </div>
    </SpotlightCard>
  </TiltCard>
);

export default function ResultPage() {
  const { id } = useParams();

  return (
    <div className="relative min-h-screen bg-base-100 overflow-hidden">
      {/* Background Effects */}
      <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
      <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto py-4 space-y-6">
        {/* Evaluation Summary Section */}
        <AnimatedContent>
          <TiltCard className="relative overflow-hidden glass bg-gradient-to-tr from-primary/5 to-accent/5 p-6 rounded-xl border border-base-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-6"
            >
              <div className="flex-1">
                <h1 className="text-3xl font-bold font-heading mb-3 text-base-content">
                  {dummyResult.problemTitle}
                </h1>
                <p className="text-lg text-base-content/80 mb-4">{dummyResult.summary}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FloatingIcon icon={Brain} className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-base-content">AI Confidence:</span>
                    <CountUp 
                      from={0} 
                      to={dummyResult.confidence} 
                      duration={1.5}
                      className="text-lg font-bold text-primary"
                      suffix="%"
                    />
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <CircularProgress value={92} size={160} className="bg-base-100/50 backdrop-blur-sm rounded-full p-4">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-8 h-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-base-content/70">Score</span>
                    <CountUp 
                      from={0} 
                      to={92} 
                      duration={2}
                      className="text-3xl font-bold text-primary"
                    />
                  </div>
                </CircularProgress>
              </div>
            </motion.div>
          </TiltCard>
        </AnimatedContent>

        {/* Mind Characteristics Grid */}
        <AnimatedContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CharacteristicBadge
            icon={Brain}
            name="Logical Thinker"
            score={95}
          />
          <CharacteristicBadge
            icon={Network}
            name="Systems-oriented"
            score={90}
          />
          <CharacteristicBadge
            icon={Lightbulb}
            name="Creative"
            score={85}
          />
          <CharacteristicBadge
            icon={Scale}
            name="Trade-off Analysis"
            score={88}
          />
        </AnimatedContent>

        {/* Problem Requirements & Technologies */}
        <AnimatedContent>
          <SpotlightCard className="p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                  <Target className="w-5 h-5 text-primary" />
                  Problem Requirements
                </h2>
                <ul className="space-y-2">
                  {dummyResult.evaluationParams.requirements.map((req, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-base-content/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span>{req}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="md:w-64">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                  <Zap className="w-5 h-5 text-primary" />
                  Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dummyResult.evaluationParams.technologies.map((tech, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm text-sm font-medium text-primary border border-primary/20"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </AnimatedContent>

        {/* Feedback Section */}
        <AnimatedContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TiltCard>
            <SpotlightCard className="h-full p-6 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-success">
                <FloatingIcon icon={CheckCircle2} className="w-5 h-5" />
                Strengths
              </h2>
              <ul className="space-y-3">
                {dummyResult.feedback.strengths.map((strength, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-success/5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-success mt-1" />
                    <span>{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </SpotlightCard>
          </TiltCard>

          <TiltCard>
            <SpotlightCard className="h-full p-6 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-warning">
                <FloatingIcon icon={AlertCircle} className="w-5 h-5" />
                Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {dummyResult.feedback.weaknesses.map((weakness, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-warning/5 transition-colors"
                  >
                    <AlertOctagon className="w-4 h-4 text-warning mt-1" />
                    <span>{weakness}</span>
                  </motion.li>
                ))}
              </ul>
            </SpotlightCard>
          </TiltCard>

          <TiltCard>
            <SpotlightCard className="h-full p-6 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-info">
                <FloatingIcon icon={Lightbulb} className="w-5 h-5" />
                Suggestions
              </h2>
              <ul className="space-y-3">
                {dummyResult.feedback.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-info/5 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4 text-info mt-1" />
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </SpotlightCard>
          </TiltCard>
        </AnimatedContent>

        {/* Resources Section */}
        <AnimatedContent>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
            <FloatingIcon icon={BookOpen} className="w-5 h-5 text-primary" />
            Related Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dummyResult.resources.map((resource, index) => (
              <TiltCard key={index}>
                <SpotlightCard
                  className="h-[140px] p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  <h3 className="font-semibold flex items-center gap-2 text-base-content">
                    {resource.title}
                    <ArrowUpRight className="w-4 h-4" />
                  </h3>
                  <p className="text-sm text-base-content/70 mt-1 line-clamp-2">{resource.description}</p>
                  <div className="text-xs text-base-content/50 mt-2">Source: {resource.source}</div>
                </SpotlightCard>
              </TiltCard>
            ))}
          </div>
        </AnimatedContent>

        {/* History Section */}
        <AnimatedContent>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content px-2 sm:px-0">
            <FloatingIcon icon={History} className="w-5 h-5 text-primary" />
            Evaluation History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dummyResult.history.map((entry, index) => (
              <TiltCard key={index}>
                <SpotlightCard
                  className="p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl hover:bg-base-200/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <CircularProgress value={entry.score} size={50} className="shrink-0">
                      <CountUp 
                        from={0} 
                        to={entry.score} 
                        duration={1.5}
                        className="text-sm font-bold text-primary"
                        suffix="%"
                      />
                    </CircularProgress>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-base-content/70">
                          {new Date(entry.timestamp).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-base-content line-clamp-2">{entry.notes}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {entry.score >= 90 ? (
                          <span className="text-xs text-success flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Excellent
                          </span>
                        ) : entry.score >= 80 ? (
                          <span className="text-xs text-primary flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Good Progress
                          </span>
                        ) : (
                          <span className="text-xs text-warning flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Improving
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </TiltCard>
            ))}
          </div>
        </AnimatedContent>

        {/* Action Buttons */}
        <AnimatedContent className="flex flex-wrap items-center gap-4 pt-4 px-2 sm:px-0">
          <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <MessageSquare className="w-5 h-5" />
            Ask Follow-up Question
          </Button>
          <Button variant="outline" size="lg" className="gap-2 border-primary/20 hover:bg-primary/5">
            <RefreshCw className="w-5 h-5" />
            Submit Improved Version
          </Button>
          <Button variant="secondary" size="lg" className="gap-2 bg-gradient-to-r from-secondary/80 to-accent/80 hover:opacity-90">
            <AlertOctagon className="w-5 h-5" />
            Request Human Review
          </Button>
        </AnimatedContent>
      </div>
    </div>
  );
} 