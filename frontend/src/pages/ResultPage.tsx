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
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

// Import ReactBits components
import { Aurora } from '@/components/blocks/Aurora';
import { DotGrid } from '@/components/blocks/DotGrid';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { AnimatedContent } from '@/components/blocks/AnimatedContent';
import { CountUp } from '@/components/blocks/CountUp';
import { TiltCard } from '@/components/blocks/TiltCard';
import { CircularProgress } from '@/components/blocks/CircularProgress';
import { FloatingIcon } from '@/components/blocks/FloatingIcon';

// Import API client
import { getAnalysisResult, ISolutionAnalysisResult, getProblem, ICrucibleProblem, getAnalysisHistory, reattemptDraft } from '@/lib/crucibleApi';
import { useAnalysis } from '@/context/AnalysisContext';

// Define loading state interface
interface LoadingState {
  analysis: boolean;
  problem: boolean;
  error: string | null;
}

const CharacteristicBadge = ({ icon: Icon, name, score, justification }: any) => {
  // Determine color based on score
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

// Map of parameter names to icons
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
  // Add more mappings as needed
};

// Default icon if no mapping exists
const defaultIcon = Brain;

export default function ResultPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const location = useLocation();
  
  // Use the centralized analysis context
  const { analysis: contextAnalysis, loading: analysisLoading, error: analysisError, checkAnalysis, markReattempting } = useAnalysis();
  
  const [problem, setProblem] = useState<ICrucibleProblem | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    analysis: true,
    problem: true,
    error: null
  });
  const [history, setHistory] = useState<ISolutionAnalysisResult[]>([]);
  const [isReattempting, setIsReattempting] = useState(false);
  
  // Extract problemId from URL if we're on the /problem/:id/result route
  const isProblemResultRoute = location.pathname.includes('/problem/') && location.pathname.endsWith('/result');
  const problemId = isProblemResultRoute ? location.pathname.split('/problem/')[1].split('/result')[0] : null;

  // Track if we've already initiated an analysis check for this render cycle
  const [analysisCheckInitiated, setAnalysisCheckInitiated] = useState<boolean>(false);
  
  useEffect(() => {
    // Reset the flag when problemId or analysisId changes
    setAnalysisCheckInitiated(false);
  }, [problemId, analysisId]);
  
  useEffect(() => {
    // Track if the component is still mounted
    let isMounted = true;
    
    const fetchData = async () => {
      // If we have an analysisId, fetch the analysis directly (unchanged)
      if (analysisId) {
        console.log(`Fetching analysis with ID: ${analysisId}`);
        try {
          // Fetch analysis result
          const analysisData = await getAnalysisResult(analysisId, getToken);
          
          // Check if component is still mounted before updating state
          if (!isMounted) return;
          
          console.log('Analysis data received:', analysisData);
          // Note: We don't set analysis here since we're using context
          setLoading(prev => ({ ...prev, analysis: false }));

          if (!analysisData.problemId) {
            console.error('Analysis data missing problemId');
            setLoading(prev => ({ 
              ...prev, 
              problem: false,
              error: "Analysis data is incomplete. Missing problem reference."
            }));
            return;
          }

          // Fetch problem details
          console.log(`Fetching problem with ID: ${analysisData.problemId}`);
          const problemData = await getProblem(analysisData.problemId);
          
          // Check if component is still mounted before updating state
          if (!isMounted) return;
          
          console.log('Problem data received:', problemData);
          setProblem(problemData);
          setLoading(prev => ({ ...prev, problem: false }));
        } catch (error) {
          if (isMounted) handleFetchError(error);
        }
      } 
      // If we're on the problem result route but don't have an analysisId yet
      else if (problemId) {
        console.log(`Fetching latest analysis for problem ID: ${problemId}`);
        try {
          // Fetch problem details first
          const problemData = await getProblem(problemId);
          
          // Check if component is still mounted before updating state
          if (!isMounted) return;
          
          console.log('Problem data received:', problemData);
          setProblem(problemData);
          setLoading(prev => ({ ...prev, problem: false }));
          
          // Only check for analysis once per render cycle to prevent loops
          if (!analysisCheckInitiated && !contextAnalysis) {
            console.log('Initiating analysis check for problem:', problemId);
            setAnalysisCheckInitiated(true);
            checkAnalysis(problemId);
          } else if (contextAnalysis) {
            // If we already have analysis in context, just update loading state
            console.log('Using existing analysis from context');
            setLoading(prev => ({ ...prev, analysis: false }));
          }
        } catch (error) {
          if (isMounted) handleFetchError(error);
        }
      } else {
        // Neither analysisId nor problemId available
        setLoading(prev => ({ 
          ...prev, 
          analysis: false, 
          problem: false, 
          error: "No analysis or problem ID provided"
        }));
      }
    };

    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => { isMounted = false; };
  }, [analysisId, getToken, problemId, checkAnalysis, contextAnalysis, analysisCheckInitiated]);

  // Fetch analysis history for news section
  useEffect(() => {
    async function fetchHistory() {
      if (!problem || !getToken) return;
      try {
        const token = await getToken();
        if (!token) return;
        const hist = await getAnalysisHistory(problem._id, () => Promise.resolve(token));
        setHistory(hist);
      } catch (err) {
        setHistory([]);
      }
    }
    fetchHistory();
  }, [problem, getToken]);

  // Handler for reattempt
  const handleReattempt = async () => {
    if (!problem || !getToken) return;
    setIsReattempting(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      // Call the backend to create a new draft
      await reattemptDraft(problem._id, () => Promise.resolve(token));
      
      // Mark the problem as being reattempted in the context
      // This will clear the analysis and set a flag to prevent redirect loops
      markReattempting(problem._id);
      
      console.log('Navigating to problem page for reattempt');
      
      // Redirect to workspace/editor
      const username = window.location.pathname.split('/')[1];
      navigate(`/${username}/crucible/problem/${problem._id}`);
    } catch (err) {
      console.error('Error during reattempt:', err);
      setIsReattempting(false);
      alert('Could not start a new attempt. Please try again.');
    }
  };

  // Helper function to handle fetch errors
  const handleFetchError = (error: any) => {
    console.error("Error fetching data:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to load analysis data. Please try again later.";
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = "Authentication error. Please sign in again.";
      } else if (error.message.includes('404')) {
        errorMessage = "Analysis not found. It may have been deleted or never existed.";
      } else if (error.message.includes('500')) {
        errorMessage = "Server error. Our team has been notified.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    setLoading(prev => ({ 
      ...prev, 
      analysis: false, 
      problem: false, 
      error: errorMessage
    }));
  };

  // Update local loading state based on context
  useEffect(() => {
    if (contextAnalysis) {
      setLoading(prev => ({ ...prev, analysis: false }));
    }
  }, [contextAnalysis]);

  // Show loading state
  if ((loading.analysis || loading.problem) && (analysisLoading || !contextAnalysis)) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-xl font-bold">Analyzing your solution...</h2>
          <p className="text-base-content/70 mt-2">This may take up to 45 seconds to complete</p>
          
          {/* Debug information for developers */}
          <div className="mt-8 text-xs text-base-content/50">
            {analysisId && <p>Analysis ID: {analysisId}</p>}
            {problemId && <p>Problem ID: {problemId}</p>}
            <p>Loading state: {JSON.stringify({
              analysis: loading.analysis,
              problem: loading.problem,
              contextLoading: analysisLoading
            })}</p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (loading.error || analysisError) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center max-w-md mx-auto p-6 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300">
          <AlertOctagon className="w-12 h-12 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-base-content/70 mt-2 mb-6">{loading.error || analysisError}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Check if analysis data is valid and complete
  const isAnalysisValid = contextAnalysis && 
    contextAnalysis.overallScore > 0 && 
    contextAnalysis.summary && 
    contextAnalysis.summary !== "The analysis could not be completed due to a technical issue. This is a fallback response." &&
    contextAnalysis.feedback &&
    contextAnalysis.feedback.strengths &&
    contextAnalysis.feedback.strengths.length > 0;

  // Show analysis error state if analysis is invalid or incomplete
  if (!isAnalysisValid) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center max-w-md mx-auto p-6 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <h2 className="text-xl font-bold">Analysis Incomplete</h2>
          <p className="text-base-content/70 mt-2 mb-6">
            The AI model was unable to complete the analysis. This could be due to high demand or a temporary service issue.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/crucible/${problem?._id || ''}`)} variant="outline">
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

  // If we have no data but no loading or error state, something's wrong
  if (!contextAnalysis || !problem) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-warning" />
          <h2 className="text-xl font-bold">No analysis data available</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

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
                  {problem.title}
                </h1>
                <p className="text-lg text-base-content/80 mb-4">{contextAnalysis.summary}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FloatingIcon icon={Brain} className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-base-content">AI Confidence:</span>
                    <CountUp 
                      from={0} 
                      to={contextAnalysis.aiConfidence} 
                      duration={1.5}
                      className="text-lg font-bold text-primary"
                      suffix="%"
                    />
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <CircularProgress value={contextAnalysis.overallScore} size={160} className="bg-base-100/50 backdrop-blur-sm rounded-full p-4">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-8 h-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-base-content/70">Score</span>
                    <CountUp 
                      from={0} 
                      to={contextAnalysis.overallScore} 
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
          {contextAnalysis.evaluatedParameters && contextAnalysis.evaluatedParameters.length > 0 ? (
            contextAnalysis.evaluatedParameters.map((param: any, index: number) => (
              <CharacteristicBadge
                key={index}
                icon={parameterIcons[param.name] || defaultIcon}
                name={param.name}
                score={param.score}
                justification={param.justification}
              />
            ))
          ) : (
            <div className="col-span-4 p-4 text-center text-base-content/70">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p>No evaluation parameters available</p>
            </div>
          )}
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
                  {problem.requirements && problem.requirements.functional && problem.requirements.functional.length > 0 ? (
                    problem.requirements.functional.map((req, index) => (
                      <motion.li
                        key={`func-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 text-base-content/80"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        <span>{req}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-base-content/70">No functional requirements specified</li>
                  )}
                  {problem.requirements && problem.requirements.nonFunctional && problem.requirements.nonFunctional.length > 0 ? (
                    problem.requirements.nonFunctional.map((req, index) => (
                      <motion.li
                        key={`nonfunc-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (problem.requirements.functional?.length || 0) + index * 0.1 }}
                        className="flex items-center gap-2 text-base-content/80"
                      >
                        <CheckCircle2 className="w-4 h-4 text-info shrink-0" />
                        <span>{req}</span>
                      </motion.li>
                    ))
                  ) : null}
                </ul>
              </div>
              
              <div className="md:w-64">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                  <Zap className="w-5 h-5 text-primary" />
                  Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {problem.tags && problem.tags.length > 0 ? (
                    problem.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm text-sm font-medium text-primary border border-primary/20"
                      >
                        {tag}
                      </motion.span>
                    ))
                  ) : (
                    <span className="text-base-content/70">No tags specified</span>
                  )}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </AnimatedContent>

        {/* Feedback Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strengths */}
          <AnimatedContent>
            <SpotlightCard className="h-full p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Strengths
              </h2>
              <ul className="space-y-3">
                {contextAnalysis.feedback && contextAnalysis.feedback.strengths && contextAnalysis.feedback.strengths.length > 0 ? (
                  contextAnalysis.feedback.strengths.map((strength: any, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-base-content/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-1" />
                      <span>{strength}</span>
                    </motion.li>
                  ))
                ) : (
                  <li className="text-base-content/70">No strengths identified</li>
                )}
              </ul>
            </SpotlightCard>
          </AnimatedContent>

          {/* Areas for Improvement */}
          <AnimatedContent>
            <SpotlightCard className="h-full p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                <AlertCircle className="w-5 h-5 text-warning" />
                Areas for Improvement
              </h2>
              <ul className="space-y-3">
                {contextAnalysis.feedback && contextAnalysis.feedback.areasForImprovement && contextAnalysis.feedback.areasForImprovement.length > 0 ? (
                  contextAnalysis.feedback.areasForImprovement.map((area: any, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-base-content/80"
                    >
                      <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-1" />
                      <span>{area}</span>
                    </motion.li>
                  ))
                ) : (
                  <li className="text-base-content/70">No areas for improvement identified</li>
                )}
              </ul>
            </SpotlightCard>
          </AnimatedContent>

          {/* Suggestions */}
          <AnimatedContent>
            <SpotlightCard className="h-full p-4 bg-base-100/50 backdrop-blur-sm border border-base-200 rounded-xl">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
                <Lightbulb className="w-5 h-5 text-primary" />
                Suggestions
              </h2>
              <ul className="space-y-3">
                {contextAnalysis.feedback && contextAnalysis.feedback.suggestions && contextAnalysis.feedback.suggestions.length > 0 ? (
                  contextAnalysis.feedback.suggestions.map((suggestion: any, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-base-content/80"
                    >
                      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>{suggestion}</span>
                    </motion.li>
                  ))
                ) : (
                  <li className="text-base-content/70">No suggestions available</li>
                )}
              </ul>
            </SpotlightCard>
          </AnimatedContent>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            className="px-6 py-2"
            onClick={() => navigate(`/crucible/${problem._id}`)}
          >
            Back to Problem
          </Button>
          <Button 
            className="px-6 py-2"
            onClick={handleReattempt}
            disabled={isReattempting}
          >
            {isReattempting ? 'Starting...' : 'Reattempt Problem'}
          </Button>
        </div>
        {/* Past Analyses Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Past Analyses</h2>
          {history.length === 0 ? (
            <div className="text-base-content/60">No past analyses found.</div>
          ) : (
            <ul className="menu bg-base-200 rounded-box p-4">
              {history.map((item) => (
                <li key={item._id}>
                  <button
                    className={`menu-item text-left w-full ${item._id === contextAnalysis?._id ? 'menu-active' : ''}`}
                    onClick={() => navigate(`/crucible/results/${item._id}`)}
                  >
                    <span className="font-semibold">{new Date(item.createdAt).toLocaleString()}</span>
                    <span className="ml-2 text-base-content/70">Score: {item.overallScore}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Progress Tracking Visualization */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Progress Tracking</h2>
          <progress className="progress progress-primary w-full" value={70} max={100}></progress>
          <div className="text-base-content/60 mt-2">(This is a placeholder. Real progress tracking will be shown here.)</div>
        </div>
        {/* Research Collection Interface */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Research Collection</h2>
          <button className="btn btn-outline btn-accent">Add/View Research Items</button>
          <div className="text-base-content/60 mt-2">(This is a placeholder. Research items UI will be implemented in a later phase.)</div>
        </div>
      </div>
    </div>
  );
} 
// TODO: Refine UX for reattempt and news/history section in a later phase. 
// TODO: Wire up real progress tracking and research collection in a later phase. 