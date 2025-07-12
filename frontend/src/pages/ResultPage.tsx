import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

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

// Import API client
import { getAnalysisResult, ISolutionAnalysisResult, getProblem, ICrucibleProblem } from '@/lib/crucibleApi';

// Define loading state interface
interface LoadingState {
  analysis: boolean;
  problem: boolean;
  error: string | null;
}

const CharacteristicBadge = ({ icon: Icon, name, score, justification }: any) => (
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
        <div className="hidden group-hover:block absolute top-full left-0 right-0 mt-2 p-3 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 text-sm">
          {justification}
        </div>
      </div>
    </SpotlightCard>
  </TiltCard>
);

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
  
  const [analysis, setAnalysis] = useState<ISolutionAnalysisResult | null>(null);
  const [problem, setProblem] = useState<ICrucibleProblem | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    analysis: true,
    problem: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!analysisId) {
        console.error('No analysis ID provided in URL parameters');
        setLoading(prev => ({ ...prev, error: "No analysis ID provided" }));
        return;
      }

      console.log(`Fetching analysis with ID: ${analysisId}`);

      try {
        // Fetch analysis result
        const analysisData = await getAnalysisResult(analysisId, getToken);
        console.log('Analysis data received:', analysisData);
        setAnalysis(analysisData);
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
        console.log('Problem data received:', problemData);
        setProblem(problemData);
        setLoading(prev => ({ ...prev, problem: false }));
      } catch (error) {
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
      }
    };

    fetchData();
  }, [analysisId, getToken]);

  // Show loading state
  if (loading.analysis || loading.problem) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-xl font-bold">Analyzing your solution...</h2>
          <p className="text-base-content/70 mt-2">This may take a moment</p>
          
          {/* Debug information for developers */}
          <div className="mt-8 text-xs text-base-content/50">
            <p>Analysis ID: {analysisId}</p>
            <p>Loading state: {JSON.stringify({
              analysis: loading.analysis,
              problem: loading.problem
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
  if (loading.error) {
    return (
      <div className="relative min-h-screen bg-base-100 flex items-center justify-center">
        <Aurora className="fixed inset-0 opacity-30 pointer-events-none" />
        <DotGrid className="fixed inset-0 opacity-10 pointer-events-none" />
        <div className="text-center max-w-md mx-auto p-6 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-300">
          <AlertOctagon className="w-12 h-12 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-base-content/70 mt-2 mb-6">{loading.error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // If we have no data but no loading or error state, something's wrong
  if (!analysis || !problem) {
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
                <p className="text-lg text-base-content/80 mb-4">{analysis.summary}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FloatingIcon icon={Brain} className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-base-content">AI Confidence:</span>
                    <CountUp 
                      from={0} 
                      to={analysis.aiConfidence} 
                      duration={1.5}
                      className="text-lg font-bold text-primary"
                      suffix="%"
                    />
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <CircularProgress value={analysis.overallScore} size={160} className="bg-base-100/50 backdrop-blur-sm rounded-full p-4">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-8 h-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-base-content/70">Score</span>
                    <CountUp 
                      from={0} 
                      to={analysis.overallScore} 
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
          {analysis.evaluatedParameters && analysis.evaluatedParameters.length > 0 ? (
            analysis.evaluatedParameters.map((param, index) => (
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
                {analysis.feedback && analysis.feedback.strengths && analysis.feedback.strengths.length > 0 ? (
                  analysis.feedback.strengths.map((strength, index) => (
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
                {analysis.feedback && analysis.feedback.areasForImprovement && analysis.feedback.areasForImprovement.length > 0 ? (
                  analysis.feedback.areasForImprovement.map((area, index) => (
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
                {analysis.feedback && analysis.feedback.suggestions && analysis.feedback.suggestions.length > 0 ? (
                  analysis.feedback.suggestions.map((suggestion, index) => (
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
        </div>
      </div>
    </div>
  );
} 