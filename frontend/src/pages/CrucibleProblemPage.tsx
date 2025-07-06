import { useParams, Link, useNavigate } from 'react-router-dom';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';
import ProblemSkeleton from '../components/crucible/ProblemSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import { useEffect, useState } from 'react';
import { getProblem } from '@/lib/crucibleApi';
import { useClerkToken } from '@/lib/middleware';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  
  // Ensure the auth token is set
  useClerkToken();

  useEffect(() => {
    // Validate that the problem exists
    if (id) {
      // Check if ID is in valid MongoDB ObjectId format
      if (!isValidObjectId(id)) {
        setError(`Invalid problem ID format: ${id}. IDs should be 24-character hexadecimal strings.`);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      getProblem(id)
        .then(() => {
          setIsLoading(false);
        })
        .catch(err => {
          logger.error('Error loading problem:', err);
          
          // Check if it's an authentication error
          if (err instanceof Error && err.message.includes('Unauthenticated')) {
            setAuthError(true);
          } else {
            setError('Problem not found or you do not have access to it.');
          }
          setIsLoading(false);
        });
    }
  }, [id]);

  if (!id) {
    return <div className="flex items-center justify-center h-screen">Problem ID is missing.</div>;
  }

  if (isLoading) {
    return <ProblemSkeleton />;
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Required</h2>
          <p className="text-gray-700">You need to be logged in to view this problem.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
        
        {!isValidObjectId(id) && (
          <div className="bg-gray-100 p-4 rounded-lg max-w-md">
            <h3 className="font-medium mb-2">Try these valid problem IDs instead:</h3>
            <ul className="space-y-2">
              {SAMPLE_VALID_IDS.map(validId => (
                <li key={validId}>
                  <Link 
                    to={`/crucible/problem/${validId}`} 
                    className="text-blue-500 hover:underline"
                  >
                    Problem {validId}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center h-screen p-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
              <p className="text-gray-700">There was an error loading the problem workspace.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        }
      >
        <CrucibleWorkspaceView problemId={id} />
      </ErrorBoundary>
    </WorkspaceProvider>
  );
}

// Export the component without the withAuth wrapper
export default CrucibleProblemPage;