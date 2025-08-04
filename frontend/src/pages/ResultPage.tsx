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
  Info,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';

import { Aurora } from '@/components/blocks/Aurora';
import { DotGrid } from '@/components/blocks/DotGrid';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { AnimatedContent } from '@/components/blocks/AnimatedContent';
import { CountUp } from '@/components/blocks/CountUp';
import { TiltCard } from '@/components/blocks/TiltCard';
import { CircularProgress } from '@/components/blocks/CircularProgress';
import { FloatingIcon } from '@/components/blocks/FloatingIcon';
import { LogoLoader } from '@/components/blocks/LogoLoader';

// Import new components
import { AnimatedGradient } from '@/components/ui/animated-gradient-with-svg';
import { Feature } from '@/components/ui/feature-with-image';
import { Badge } from '@/components/ui/badge';

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
const FeedbackFeature = ({ title, items, badgeText, badgeVariant, icon: Icon, imageUrl, colors }: any) => {
  return (
    <div className="w-full py-8">
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:items-center">
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
                <div className="space-y-3 mt-4">
                  {items?.map((item: string, index: number) => (
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
  "Creativity": Lightbulb,
  "Trade-off Analysis": Scale,
  "Performance": Zap,
  "Security": AlertOctagon,
  "Scalability": RefreshCw,
  "Documentation": BookOpen,
  "Code Quality": CheckCircle2,
  "Error Handling": AlertCircle,
  "Communication": MessageSquare,
  "Innovation": Sparkles,
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
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold font-heading mb-6 text-base-content"
            >
              {problem.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed"
            >
              {analysisToDisplay.summary}
            </motion.p>
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
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-base-content">Detailed Analysis</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {analysisToDisplay.evaluatedParameters?.map((param: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-lg hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <FloatingIcon icon={parameterIcons[param.name] || parameterIcons.default} className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-medium truncate">{param.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${param.score <= 25 ? "from-red-500 to-red-600" : param.score <= 50 ? "from-orange-500 to-orange-600" : param.score <= 75 ? "from-yellow-500 to-yellow-600" : "from-green-500 to-green-600"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${param.score}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <CountUp 
                        from={0} 
                        to={param.score} 
                        duration={1.5}
                        className="text-sm font-bold text-primary"
                        suffix="%"
                      />
                    </div>
                    <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-2 p-3 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 text-sm">
                      {param.justification}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedContent>

        {/* Feedback Sections */}
        <div className="space-y-16">
          <FeedbackFeature
            title="Strengths"
            items={analysisToDisplay.feedback?.strengths}
            badgeText="Excellent"
            badgeVariant="default"
            icon={ThumbsUp}
            colors={["#10B981", "#34D399", "#6EE7B7"]}
          />
          
          <FeedbackFeature
            title="Areas for Improvement"
            items={analysisToDisplay.feedback?.areasForImprovement}
            badgeText="Opportunities"
            badgeVariant="secondary"
            icon={ArrowUpRight}
            colors={["#F59E0B", "#FCD34D", "#FEF3C7"]}
          />
          
          <FeedbackFeature
            title="Suggestions"
            items={analysisToDisplay.feedback?.suggestions}
            badgeText="Tips"
            badgeVariant="outline"
            icon={Lightbulb}
            colors={["#8B5CF6", "#A78BFA", "#C4B5FD"]}
          />
        </div>

        {/* Action Buttons */}
        <AnimatedContent>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Button 
              variant="outline" 
              className="px-8 py-3 text-lg" 
              onClick={() => navigate(`/${username}/crucible`)}
            >
              Back to Problem
            </Button>
            <Button 
              className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
              onClick={handleReattempt} 
              disabled={isReattempting}
            >
              {isReattempting ? 'Starting...' : 'Reattempt Problem'}
            </Button>
          </div>
          
          {analysisToDisplay.overallScore < 100 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20"
            >
              <p className="text-base-content/80">
                💡 <strong>Tip:</strong> Your current score is {analysisToDisplay.overallScore}/100. 
                When you reattempt, you'll see your previous solution and can improve it for a better score!
              </p>
            </motion.div>
          )}
        </AnimatedContent>

        {/* History Section */}
        {history.length > 0 && (
          <AnimatedContent>
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center text-base-content">Analysis History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                      item._id === analysisToDisplay?._id 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-base-100/50 border-base-200 hover:border-primary/30'
                    }`}
                    onClick={() => navigate(`/${username}/crucible/results/${item._id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-base-content/60">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {item.overallScore}/100
                      </span>
                    </div>
                    <div className="text-xs text-base-content/40">
                      {new Date(item.createdAt).toLocaleTimeString()}
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
