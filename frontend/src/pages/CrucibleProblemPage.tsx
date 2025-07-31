import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';
import ProblemSkeleton from '../components/crucible/ProblemSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { useEffect, useState } from 'react';
import { getProblem, getDraft, getNotes, updateDraft, getLatestAnalysis, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft } from '@/lib/crucibleApi';
import { logger } from '@/lib/utils';

function CrucibleProblemPage() {
  const { id: problemId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

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

        // Check if user has already submitted a solution with analysis
        try {
          const latestAnalysis = await getLatestAnalysis(problemId, tokenProvider);
          
          // If analysis exists, redirect to result page immediately
          if (latestAnalysis) {
            logger.info('Found existing analysis, redirecting to result page');
            // Extract username from path
            const username = window.location.pathname.split('/')[1];
            navigate(`/${username}/crucible/problem/${problemId}/result`);
            return; // Exit early - no need to fetch draft or create one
          }
        } catch (analysisError) {
          // If no analysis exists (404), continue with normal flow
          logger.info('No existing analysis found, continuing with normal flow');
        }

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
            const newDraft = await updateDraft(problemId, '', tokenProvider);
            setDraft(newDraft);
          } catch (createError: any) {
            // If draft creation fails, that's okay - user can still use the editor
            logger.warn('Failed to create initial draft, but continuing:', createError);
          }
        }

      } catch (err: any) {
        logger.error('Failed to load crucible page data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [problemId, isLoaded, isSignedIn, getToken, navigate]);

  if (loading) {
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