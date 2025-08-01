import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';
import ProblemSkeleton from '../components/crucible/ProblemSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { useEffect, useState } from 'react';
import { getProblem, getDraft, getNotes, updateDraft, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft } from '@/lib/crucibleApi';
import { logger } from '@/lib/utils';
import { useAnalysis } from '@/context/AnalysisContext';

function CrucibleProblemPage() {
  const { id: problemId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  
  // Use the centralized analysis context
  const { analysis, loading: analysisLoading, checkAnalysis } = useAnalysis();

  const [problem, setProblem] = useState<ICrucibleProblem | null>(null);
  const [draft, setDraft] = useState<ISolutionDraft | null>(null);
  const [notes, setNotes] = useState<ICrucibleNote[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!problemId) {
      setError("Problem ID is missing from the URL.");
      setLoading(false);
      return;
    }

    if (!isLoaded) {
      return; // Wait for Clerk to load
    }

    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          setError("Authentication failed. Unable to get token.");
          setLoading(false);
          return;
        }

        const tokenProvider = () => Promise.resolve(token);

        // Fetch problem data first (required)
        const problemData = await getProblem(problemId);
        setProblem(problemData);

        // Only check for analysis AFTER we have confirmed draft status
        // We'll handle this after draft fetching/creation

        // Try to fetch draft and notes, but don't fail if draft doesn't exist
        let draftData: ISolutionDraft | null = null;
        try {
          const [fetchedDraftData, notesData] = await Promise.all([
            getDraft(problemId, tokenProvider),
            getNotes(problemId, tokenProvider)
          ]);
          
          draftData = fetchedDraftData;
          setDraft(draftData);
          setNotes(notesData ? [notesData] : null);
        } catch (draftError: any) {
          // If draft doesn't exist (404), that's okay - user might be visiting for first time
          if (draftError.message?.includes('404') || draftError.message?.includes('No active draft')) {
            draftData = null;
            setDraft(null);
            setNotes(null);
          } else {
            // For other errors, log but don't fail the page load
            logger.warn('Failed to load draft or notes, but continuing:', draftError);
            draftData = null;
            setDraft(null);
            setNotes(null);
          }
        }

        // If no draft exists, create one for new users
        if (!draftData) {
          try {
            // Create a new draft with empty content
            logger.info('Creating new draft for first-time user');
            const newDraft = await updateDraft(problemId, '', tokenProvider);
            
            // Ensure we got a valid draft back
            if (newDraft && newDraft._id) {
              logger.info('Successfully created new draft:', newDraft._id);
              setDraft(newDraft);
              draftData = newDraft;
            } else {
              logger.warn('Draft creation returned invalid data:', newDraft);
              // Still set the draft to prevent infinite loading
              const tempDraft = { 
                _id: 'temp-draft',
                problemId,
                currentContent: '',
                status: 'active'
              } as ISolutionDraft;
              setDraft(tempDraft);
              draftData = tempDraft;
            }
          } catch (createError: any) {
            // If draft creation fails, create a temporary draft object
            // This ensures the editor still shows up instead of loading state
            logger.warn('Failed to create initial draft, using fallback:', createError);
            const tempDraft = { 
              _id: 'temp-draft',
              problemId,
              currentContent: '',
              status: 'active'
            } as ISolutionDraft;
            setDraft(tempDraft);
            draftData = tempDraft;
          }
        }
        
        // Don't check for analysis on page load - analysis will be checked after user submits solution
        // This prevents unnecessary 404 errors for new users

      } catch (err: any) {
        logger.error('Failed to load crucible page data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId, isLoaded, isSignedIn, getToken, navigate]);

  // Track if a redirect has been initiated
  const [redirectInitiated, setRedirectInitiated] = useState<boolean>(false);
  
  // Check if this problem is being reattempted (from sessionStorage)
  const isReattempting = problemId ? sessionStorage.getItem(`reattempting_${problemId}`) : null;

  // Handle analysis state changes and redirect when analysis is found
  useEffect(() => {
    // If we're reattempting, don't do any redirects and clear any existing analysis
    if (isReattempting) {
      logger.info('User is reattempting, preventing redirect to result page');
      // Clear any existing analysis to prevent future redirects
      if (analysis) {
        // We can't directly clear the analysis from context here, but we can prevent the redirect
        logger.info('Analysis exists but user is reattempting - preventing redirect');
      }
      return;
    }
    
    // Only redirect if:
    // 1. We have an analysis
    // 2. We're not currently loading
    // 3. We haven't already initiated a redirect
    // 4. We're not already on the result page
    // 5. We're not reattempting (double-check)
    // 6. The user is not in reattempt mode (check sessionStorage)
    const isOnResultPage = window.location.pathname.includes('/result');
    const isCurrentlyReattempting = problemId ? sessionStorage.getItem(`reattempting_${problemId}`) : null;
    const reattemptTime = problemId ? sessionStorage.getItem(`reattempt_time_${problemId}`) : null;
    
    // Check if user is actively reattempting (within 30 minutes of reattempt time)
    const isActivelyReattempting = reattemptTime && (Date.now() - parseInt(reattemptTime)) < 30 * 60 * 1000;
    
    if (analysis && !analysisLoading && problemId && !redirectInitiated && !isOnResultPage && !isCurrentlyReattempting && !isActivelyReattempting) {
      logger.info('Found existing analysis in context, redirecting to result page');
      // Mark that we've initiated a redirect to prevent loops
      setRedirectInitiated(true);
      // Extract username from path
      const username = window.location.pathname.split('/')[1];
      navigate(`/${username}/crucible/problem/${problemId}/result`);
    }
  // We only want to run this effect when analysis, analysisLoading, or isReattempting changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, analysisLoading, redirectInitiated, isReattempting]);

  // Show loading skeleton while fetching data or checking analysis
  if (loading || analysisLoading) {
    return <ProblemSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center py-10">Problem could not be loaded.</div>
  }

  return (
    <WorkspaceProvider>
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
            <p className="text-gray-700">There was an error loading the problem workspace.</p>
          </div>
        }
      >
        <CrucibleWorkspaceView
          problem={problem}
          initialDraft={draft}
          initialNotes={notes}
        />
      </ErrorBoundary>
    </WorkspaceProvider>
  );
}

// Export the component without the withAuth wrapper
export default CrucibleProblemPage;