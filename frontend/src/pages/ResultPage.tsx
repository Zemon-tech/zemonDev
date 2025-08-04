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
  Info
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

import { getAnalysisResult, ISolutionAnalysisResult, getProblem, ICrucibleProblem, getAnalysisHistory, reattemptDraft } from '@/lib/crucibleApi';
import { useAnalysis } from '@/context/AnalysisContext';
import { logger } from '@/lib/utils';

const CharacteristicBadge = ({ icon: Icon, name, score, justification }: any) => {
  const getProgressColor = (score: number) => {
    if (score <= 25) return "from-red-500 to-red-600";
    if (score <= 50) return "from-orange-500 to-orange-600";
    if (score <= 75) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  return (
    <TiltCard className="relative group">
      <SpotlightCard className="p-3 flex items-center gap-3 bg-base-200/50 backdrop-blur-sm border border-base-300 rounded-lg hover:shadow-lg transition-all cursor-default">
        <FloatingIcon icon={Icon} className="w-8 h-8 text-primary" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${getProgressColor(score)}`}
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
          <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-2 p-3 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 text-sm">
            {justification}
          </div>
        </div>
      </SpotlightCard>
    </TiltCard>
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
    // Use fallback values - this allows the page to render even without context
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
          
          // Clear reattempting state since we have a valid analysis
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
          text={isSubmitting ? 'Analysing your solution…' : 'Loading Analysis…'}
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

      <div className="max-w-5xl mx-auto py-4 space-y-6">
        <AnimatedContent>
          <TiltCard className="relative overflow-hidden glass bg-gradient-to-tr from-primary/5 to-accent/5 p-6 rounded-xl border border-base-200">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold font-heading mb-3 text-base-content">
                  {problem.title}
                </h1>
                <p className="text-lg text-base-content/80 mb-4">{analysisToDisplay.summary}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FloatingIcon icon={Brain} className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-base-content">AI Confidence:</span>
                    <CountUp from={0} to={analysisToDisplay.aiConfidence} duration={1.5} className="text-lg font-bold text-primary" suffix="%" />
                  </div>
                  <div className="flex items-center gap-2">
                    <FloatingIcon icon={Target} className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-base-content">Overall Score:</span>
                    <CountUp from={0} to={analysisToDisplay.overallScore} duration={1.5} className="text-lg font-bold text-accent" suffix="/100" />
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <CircularProgress value={analysisToDisplay.overallScore} size={160} className="bg-base-100/50 backdrop-blur-sm rounded-full p-4">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-8 h-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-base-content/70">Score</span>
                    <CountUp from={0} to={analysisToDisplay.overallScore} duration={2} className="text-3xl font-bold text-primary" />
                  </div>
                </CircularProgress>
              </div>
            </motion.div>
          </TiltCard>
        </AnimatedContent>

        <AnimatedContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {analysisToDisplay.evaluatedParameters?.map((param: any, index: number) => (
            <CharacteristicBadge
              key={index}
              icon={parameterIcons[param.name] || parameterIcons.default}
              name={param.name}
              score={param.score}
              justification={param.justification}
            />
          ))}
        </AnimatedContent>

        <AnimatedContent>
          <SpotlightCard className="p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                  <Target className="w-5 h-5 text-primary" />
                  Problem Requirements
                </h2>
                <ul className="space-y-2">
                  {problem.requirements?.functional?.map((req, index) => (
                    <motion.li key={`func-${index}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-2 text-base-content/80">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span>{req}</span>
                    </motion.li>
                  ))}
                  {problem.requirements?.nonFunctional?.map((req, index) => (
                    <motion.li key={`nonfunc-${index}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (problem.requirements.functional?.length || 0) + index * 0.1 }} className="flex items-center gap-2 text-base-content/80">
                      <CheckCircle2 className="w-4 h-4 text-info shrink-0" />
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
                  {problem.tags?.map((tag, index) => (
                    <motion.span key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm text-sm font-medium text-primary border border-primary/20">
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </AnimatedContent>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedContent>
            <SpotlightCard className="h-full p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                <ThumbsUp className="w-5 h-5 text-success" />
                Strengths
              </h2>
              <ul className="space-y-3">
                {analysisToDisplay.feedback?.strengths?.map((strength: any, index: number) => (
                  <motion.li key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-2 text-base-content/80">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-1" />
                    <span>{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </SpotlightCard>
          </AnimatedContent>

          <AnimatedContent>
            <SpotlightCard className="h-full p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                <ArrowUpRight className="w-5 h-5 text-warning" />
                Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {analysisToDisplay.feedback?.areasForImprovement?.map((area: any, index: number) => (
                  <motion.li key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-2 text-base-content/80">
                    <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-1" />
                    <span>{area}</span>
                  </motion.li>
                ))}
              </ul>
            </SpotlightCard>
          </AnimatedContent>

          <AnimatedContent>
            <SpotlightCard className="h-full p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                <Lightbulb className="w-5 h-5 text-primary" />
                Suggestions
              </h2>
              <ul className="space-y-3">
                {analysisToDisplay.feedback?.suggestions?.map((suggestion: any, index: number) => (
                  <motion.li key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-2 text-base-content/80">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </SpotlightCard>
          </AnimatedContent>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" className="px-6 py-2" onClick={() => navigate(`/${username}/crucible`)}>
            Back to Problem
          </Button>
          <Button className="px-6 py-2" onClick={handleReattempt} disabled={isReattempting}>
            {isReattempting ? 'Starting...' : 'Reattempt Problem'}
          </Button>
        </div>
        {analysisToDisplay.overallScore < 100 && (
          <div className="text-center mt-4 p-3 bg-base-200/50 rounded-lg">
            <p className="text-sm text-base-content/70">
              💡 <strong>Tip:</strong> Your current score is {analysisToDisplay.overallScore}/100. 
              When you reattempt, you'll see your previous solution and can improve it for a better score!
            </p>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Past Analyses</h2>
          {history.length === 0 ? (
            <div className="text-base-content/60">No past analyses found.</div>
          ) : (
            <ul className="menu bg-base-200 rounded-box p-4">
              {history.map((item) => (
                <li key={item._id}>
                  <button className={`menu-item text-left w-full ${item._id === analysisToDisplay?._id ? 'menu-active' : ''}`} onClick={() => navigate(`/${username}/crucible/results/${item._id}`)}>
                    <span className="font-semibold">{new Date(item.createdAt).toLocaleString()}</span>
                    <span className="ml-2 text-base-content/70">Score: {item.overallScore}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
