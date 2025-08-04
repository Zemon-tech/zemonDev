import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  CheckCircle2, 
  AlertCircle,
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
  ArrowUpRight,
  ThumbsUp,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';

import { Aurora } from '@/components/blocks/Aurora';
import { DotGrid } from '@/components/blocks/DotGrid';
import { AnimatedContent } from '@/components/blocks/AnimatedContent';
import { CountUp } from '@/components/blocks/CountUp';
import { CircularProgress } from '@/components/blocks/CircularProgress';
import { FloatingIcon } from '@/components/blocks/FloatingIcon';
import { LogoLoader } from '@/components/blocks/LogoLoader';

// Import new components
import { AnimatedGradient } from '@/components/ui/animated-gradient-with-svg';
import { Badge } from '@/components/ui/badge';
import { ParameterCarousel } from '@/components/ui/parameter-carousel';


import { getAnalysisResult, ISolutionAnalysisResult, getProblem, ICrucibleProblem, getAnalysisHistory, reattemptDraft } from '@/lib/crucibleApi';
import { useAnalysis } from '@/context/AnalysisContext';
import { logger } from '@/lib/utils';

// Stats Card Component with Animated Gradient
const StatsCard = ({ title, value, subtitle, colors, delay, icon: Icon }: any) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-background/50 backdrop-blur-sm rounded-xl border border-base-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />
      <motion.div
        className="relative z-10 p-6 text-foreground"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="flex items-center gap-3 mb-4" variants={item}>
          <FloatingIcon icon={Icon} className="w-6 h-6 text-primary" />
          <h3 className="text-sm font-medium text-foreground/80">
            {title}
          </h3>
        </motion.div>
        <motion.div
          className="text-3xl font-bold mb-2 text-foreground"
          variants={item}
        >
          {value}
        </motion.div>
        {subtitle && (
          <motion.p 
            className="text-sm text-foreground/60" 
            variants={item}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

// Feedback Feature Component
const FeedbackFeature = ({ title, badgeText, badgeVariant, icon: Icon, colors, allItems, iconOnLeft = false }: any) => {
  return (
    <div className="w-full py-8">
      <div className="container mx-auto">
        <div className={`flex flex-col-reverse lg:flex-row gap-8 lg:items-center ${iconOnLeft ? 'lg:flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <div className="flex gap-4 pl-0 lg:pl-8 flex-col">
              <div>
                <Badge variant={badgeVariant}>{badgeText}</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h2 className="text-2xl md:text-3xl tracking-tighter lg:max-w-xl font-bold text-left flex items-center gap-3">
                  <FloatingIcon icon={Icon} className="w-8 h-8 text-primary" />
                  {title}
                </h2>
                <div className="mt-4">
                  <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-3 pr-2">
                    {allItems?.map((item: string, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-base-content/80"
                      >
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-1" />
                        <span className="leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br from-primary/10 to-accent/10 border border-base-200">
              <AnimatedGradient colors={colors} speed={0.03} blur="light" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FloatingIcon icon={Icon} className="w-16 h-16 text-primary/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const parameterIcons: Record<string, any> = {
  "Logical Thinking": Brain,
  "Systems Design": Network,
  "Creativity": Sparkles,
  "Trade-off Analysis": Scale,
  "Performance": Zap,
  "Security": AlertOctagon,
  "Scalability": RefreshCw,
  "Documentation": BookOpen,
  "Code Quality": CheckCircle2,
  "Error Handling": AlertCircle,
  "Communication": MessageSquare,
  "Innovation": Lightbulb,
  "Problem Solving": Target,
  "Algorithm Design": TrendingUp,
  "Data Structures": Award,
  "System Architecture": Network,
  "Testing": CheckCircle2,
  "Optimization": Zap,
  "Best Practices": Trophy,
  "Code Review": MessageSquare,
  "Debugging": AlertCircle,
  "User Experience": Lightbulb,
  "Accessibility": Scale,
  "Performance Optimization": Zap,
  "Security Best Practices": AlertOctagon,
  "API Design": Network,
  "Database Design": BookOpen,
  "Frontend Development": Sparkles,
  "Backend Development": Brain,
  "Full Stack Development": Network,
  "Mobile Development": Target,
  "DevOps": RefreshCw,
  "Cloud Computing": Zap,
  "Microservices": Network,
  "Monolithic Architecture": Award,
  "Agile Development": TrendingUp,
  "Version Control": BookOpen,
  "CI/CD": RefreshCw,
  "Monitoring": AlertOctagon,
  "Logging": MessageSquare,
  "Input Validation": CheckCircle2,
  "Output Formatting": Scale,
  "Resource Management": Zap,
  "Memory Management": Brain,
  "Concurrency": Network,
  "Asynchronous Programming": RefreshCw,
  "Event Handling": Lightbulb,
  "State Management": Award,
  "Routing": Target,
  "Authentication": AlertOctagon,
  "Authorization": Scale,
  "Data Validation": CheckCircle2,
  "Data Transformation": TrendingUp,
  "File I/O": BookOpen,
  "Network Communication": Network,
  "Caching": Zap,
  "Load Balancing": Scale,
  "Fault Tolerance": AlertCircle,
  "Disaster Recovery": AlertOctagon,
  "Backup Strategies": BookOpen,
  "Data Migration": RefreshCw,
  "Schema Design": Award,
  "Query Optimization": Zap,
  "Indexing": Target,
  "Transactions": Scale,
  "ACID Properties": CheckCircle2,
  "Normalization": TrendingUp,
  "Denormalization": Network,
  "Sharding": RefreshCw,
  "Replication": MessageSquare,
  "Consistency": Scale,
  "Availability": Zap,
  "Partition Tolerance": Network,
  default: Brain,
};

export default function ResultPage() {
  // --- 1. HOOKS ---
  const { analysisId: analysisIdFromParams, username } = useParams<{ analysisId: string; username: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const location = useLocation();

  // Wrap useAnalysis in try-catch to handle context errors gracefully
  let contextAnalysis: ISolutionAnalysisResult | null = null;
  let contextLoading = false;
  let contextError: string | null = null;
  let checkAnalysis: (problemId: string) => Promise<void> = async () => {};
  let markReattempting: (problemId: string) => void = () => {};
  let clearAnalysis: () => void = () => {};
  let clearReattemptingState: (problemId: string) => void = () => {};

  try {
    const analysisContext = useAnalysis();
    contextAnalysis = analysisContext.analysis;
    contextLoading = analysisContext.loading;
    contextError = analysisContext.error;
    checkAnalysis = analysisContext.checkAnalysis;
    markReattempting = analysisContext.markReattempting;
    clearAnalysis = analysisContext.clearAnalysis;
    clearReattemptingState = analysisContext.clearReattemptingState;
  } catch (error) {
    console.warn('AnalysisContext not available, using fallback values:', error);
  }
  
  const [localAnalysis, setLocalAnalysis] = useState<ISolutionAnalysisResult | null>(null);
  const [problem, setProblem] = useState<ICrucibleProblem | null>(null);
  const [history, setHistory] = useState<ISolutionAnalysisResult[]>([]);
  const [isReattempting, setIsReattempting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullSummary, setShowFullSummary] = useState(false); // <-- Add this state

  const { problemId, analysisId } = useMemo(() => {
    const isProblemResultRoute = location.pathname.includes('/problem/') && location.pathname.endsWith('/result');
    const problemId = isProblemResultRoute ? location.pathname.split('/problem/')[1].split('/result')[0] : null;
    return { problemId, analysisId: analysisIdFromParams };
  }, [location.pathname, analysisIdFromParams]);
  
  const isSubmitting = useMemo(() => problemId ? sessionStorage.getItem(`submitting_${problemId}`) : null, [problemId]);

  const analysisToDisplay = localAnalysis || contextAnalysis;

  const isAnalysisValid = useMemo(() => {
    const isValid = analysisToDisplay &&
      typeof analysisToDisplay.overallScore === 'number' &&
      typeof analysisToDisplay.summary === 'string' &&
      analysisToDisplay.summary.length > 0 &&
      analysisToDisplay.summary !== "The analysis could not be completed due to a technical issue. This is a fallback response." &&
      analysisToDisplay.feedback &&
      typeof analysisToDisplay.feedback === 'object' &&
      Array.isArray(analysisToDisplay.feedback.strengths);

    if (!isValid && !loading && !contextLoading) {
      logger.error('Analysis validation failed:', {
        hasAnalysis: !!analysisToDisplay,
        analysisObject: analysisToDisplay,
      });
    }
    return isValid;
  }, [analysisToDisplay, loading, contextLoading]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (analysisId) {
        clearAnalysis();
      }

      try {
        let currentAnalysis: ISolutionAnalysisResult | null = null;
        let currentProblemId: string | null = problemId;

        if (analysisId) {
          logger.info(`Fetching analysis by ID: ${analysisId}`);
          const fetchedAnalysis = await getAnalysisResult(analysisId, getToken);
          if (!isMounted) return;
          currentAnalysis = fetchedAnalysis;
          currentProblemId = fetchedAnalysis.problemId;
          setLocalAnalysis(fetchedAnalysis);
          
          if (currentProblemId) {
            clearReattemptingState(currentProblemId);
          }
        } else if (problemId) {
          logger.info(`Checking context for analysis for problem ID: ${problemId}`);
          if (contextAnalysis && contextAnalysis.problemId === problemId) {
            logger.info("Using analysis from context.");
            currentAnalysis = contextAnalysis;
          } else if (!contextLoading) {
            logger.info("No context analysis found, initiating check.");
            checkAnalysis(problemId);
          }
        }

        if (currentProblemId && (!problem || problem._id !== currentProblemId)) {
          logger.info(`Fetching problem data for ID: ${currentProblemId}`);
          const fetchedProblem = await getProblem(currentProblemId);
          if (isMounted) setProblem(fetchedProblem);
        }
        
      } catch (err: any) {
        logger.error("Failed to fetch result page data:", err);
        if (isMounted) setError(err.message || 'Failed to load data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [analysisId, problemId, contextAnalysis?._id, getToken, contextLoading]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!problem || !getToken) return;
      try {
        const hist = await getAnalysisHistory(problem._id, getToken);
        setHistory(hist);
      } catch (err) {
        logger.warn('Could not fetch analysis history.', err);
        setHistory([]);
      }
    };
    fetchHistory();
  }, [problem, getToken]);

  // --- 2. EVENT HANDLERS ---
  const handleReattempt = async () => {
    if (!problem?._id) return;
    setIsReattempting(true);
    try {
      await reattemptDraft(problem._id, getToken);
      markReattempting(problem._id);
      const username = location.pathname.split('/')[1];
      navigate(`/${username}/crucible/problem/${problem._id}`);
    } catch (err) {
      logger.error('Error during reattempt:', err);
      setIsReattempting(false);
      alert('Could not start a new attempt. Please try again.');
    }
  };

  // Listen for reattempt event from navbar
  useEffect(() => {
    const handleReattemptEvent = () => {
      handleReattempt();
    };

    window.addEventListener('reattempt-problem', handleReattemptEvent);
    
    return () => {
      window.removeEventListener('reattempt-problem', handleReattemptEvent);
    };
  }, [problem?._id, getToken, markReattempting, navigate, location.pathname]);

  // --- 3. DERIVED STATE FOR RENDER ---
  const isLoading = loading || (contextLoading && !analysisToDisplay);
  const displayError = error || contextError;

  // --- 4. RENDER LOGIC ---
  if (isLoading || isSubmitting) {
    return (
      <div className="fixed inset-0 bg-base-100 flex items-center justify-center overflow-hidden">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <LogoLoader 
          size="lg"
          className="z-10"
        />
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center max-w-md mx-auto p-6 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300">
          <AlertOctagon className="w-12 h-12 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-base-content/70 mt-2 mb-6">{displayError}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  if (!analysisToDisplay || !problem || !isAnalysisValid) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center max-w-md mx-auto p-6 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <h2 className="text-xl font-bold">Analysis Incomplete</h2>
          <p className="text-base-content/70 mt-2 mb-6">
            The AI model was unable to complete the analysis, or the data is malformed. This could be due to high demand or a temporary service issue.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/${username}/crucible`)} variant="outline">
              Back to Problem
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-base-100 overflow-hidden">
      <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
      <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
        {/* Header Section */}
        <AnimatedContent>
          <div className="flex flex-col lg:flex-row items-start gap-8 mb-12">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold font-heading mb-6 text-base-content text-left"
              >
                {problem.title}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-base-content/70 leading-relaxed"
              >
                {analysisToDisplay.summary.length > 200 ? (
                  !showFullSummary ? (
                    <>
                      <p className="mb-4">
                        {analysisToDisplay.summary.substring(0, 200)}...
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFullSummary(true)}
                        className="text-primary hover:text-primary/80 border border-base-300 focus:ring-0 focus:border-base-300"
                      >
                        View More
                      </Button>
                    </>
                  ) : (
                    <p className="text-base-content/70 leading-relaxed">{analysisToDisplay.summary}</p>
                  )
                ) : (
                  <p>{analysisToDisplay.summary}</p>
                )}
              </motion.div>
            </div>
            <div className="lg:w-64 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <CircularProgress value={analysisToDisplay.overallScore} size={160} className="bg-base-100/50 backdrop-blur-sm rounded-full p-4 mb-4">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-8 h-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-base-content/70">Score</span>
                    <CountUp from={0} to={analysisToDisplay.overallScore} duration={2} className="text-3xl font-bold text-primary" />
                  </div>
                </CircularProgress>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FloatingIcon icon={Brain} className="w-4 h-4 text-primary" />
                    <span className="text-base-content/70">AI Confidence:</span>
                    <CountUp from={0} to={analysisToDisplay.aiConfidence} duration={1.5} className="font-bold text-primary" suffix="%" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedContent>

        {/* Stats Grid */}
        <AnimatedContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatsCard
              title="Overall Score"
              value={`${analysisToDisplay.overallScore}/100`}
              subtitle="Your performance score"
              colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
              delay={0.2}
              icon={Trophy}
            />
            <StatsCard
              title="AI Confidence"
              value={`${analysisToDisplay.aiConfidence}%`}
              subtitle="Analysis reliability"
              colors={["#60A5FA", "#34D399", "#93C5FD"]}
              delay={0.4}
              icon={Brain}
            />
            <StatsCard
              title="Problem Difficulty"
              value={problem.difficulty || "Medium"}
              subtitle="Challenge level"
              colors={["#F59E0B", "#A78BFA", "#FCD34D"]}
              delay={0.6}
              icon={Target}
            />
          </div>
        </AnimatedContent>

        {/* Parameter Scores */}
        <AnimatedContent>
          <ParameterCarousel 
            parameters={analysisToDisplay.evaluatedParameters?.map((param: any) => ({
              name: param.name,
              score: param.score,
              justification: param.justification,
              icon: parameterIcons[param.name] || parameterIcons.default
            })) || []}
          />
        </AnimatedContent>

        {/* Feedback Sections */}
        <div className="space-y-16">
          <FeedbackFeature
            title="Strengths"
            badgeText="Excellent"
            badgeVariant="default"
            icon={ThumbsUp}
            colors={["#10B981", "#34D399", "#6EE7B7"]}
            allItems={analysisToDisplay.feedback?.strengths}
          />
          
          <FeedbackFeature
            title="Areas for Improvement"
            badgeText="Opportunities"
            badgeVariant="secondary"
            icon={ArrowUpRight}
            colors={["#F59E0B", "#FCD34D", "#FEF3C7"]}
            allItems={analysisToDisplay.feedback?.areasForImprovement}
            iconOnLeft={true}
          />
          
          <FeedbackFeature
            title="Suggestions"
            badgeText="Tips"
            badgeVariant="outline"
            icon={Lightbulb}
            colors={["#8B5CF6", "#A78BFA", "#C4B5FD"]}
            allItems={analysisToDisplay.feedback?.suggestions}
          />
        </div>

        {/* Pro Tip Section */}
        {analysisToDisplay.overallScore < 100 && (
          <AnimatedContent>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12 p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/20 backdrop-blur-sm focus:ring-0 focus:border-0"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Lightbulb className="w-3 h-3 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-base-content">Pro Tip</h3>
              </div>
              <p className="text-sm text-base-content/80">
                Your current score is <span className="font-bold text-primary">{analysisToDisplay.overallScore}/100</span>. 
                When you reattempt, you'll see your previous solution and can improve it for a better score!
              </p>
            </motion.div>
          </AnimatedContent>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <AnimatedContent>
            <div className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-base-content mb-2">Analysis History</h2>
                <p className="text-base-content/60">Your previous attempts and improvements</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 focus:ring-0 focus:border-0 ${
                      item._id === analysisToDisplay?._id 
                        ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/40 shadow-lg' 
                        : 'bg-gradient-to-br from-base-100/80 to-base-200/40 border-base-300/50 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5'
                    }`}
                    onClick={() => navigate(`/${username}/crucible/results/${item._id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item._id === analysisToDisplay?._id 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-base-300/50 text-base-content/60'
                          }`}>
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-base-content">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-base-content/50">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            item._id === analysisToDisplay?._id ? 'text-primary' : 'text-base-content'
                          }`}>
                            {item.overallScore}
                          </div>
                          <div className="text-xs text-base-content/50">/100</div>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-base-300/50 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${
                            item.overallScore <= 25 ? "from-red-400 to-red-500" : 
                            item.overallScore <= 50 ? "from-orange-400 to-orange-500" : 
                            item.overallScore <= 75 ? "from-yellow-400 to-yellow-500" : 
                            "from-green-400 to-green-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.overallScore}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant={item._id === analysisToDisplay?._id ? "default" : "secondary"} className="text-xs">
                          {item._id === analysisToDisplay?._id ? 'Current' : 'Previous'}
                        </Badge>
                        <ArrowUpRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
                          item._id === analysisToDisplay?._id ? 'text-primary' : 'text-base-content/40'
                        }`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedContent>
        )}
      </div>
    </div>
  );
}
