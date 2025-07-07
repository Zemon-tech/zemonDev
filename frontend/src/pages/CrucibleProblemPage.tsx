import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';
import ProblemSkeleton from '../components/crucible/ProblemSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { useEffect, useState } from 'react';
import { getProblem, getDraft, getNotes, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft } from '@/lib/crucibleApi';
import { logger } from '@/lib/utils';

// Helper function to check if ID is valid MongoDB ObjectId format
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sample valid ObjectIds for testing
const SAMPLE_VALID_IDS = [
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013'
];

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

        const [problemData, draftData, notesData] = await Promise.all([
          getProblem(problemId),
          getDraft(problemId, tokenProvider),
          getNotes(problemId, tokenProvider)
        ]);
        
        setProblem(problemData);
        setDraft(draftData);
        setNotes(notesData);

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