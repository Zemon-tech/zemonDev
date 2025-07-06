import { useWorkspace } from '../../lib/WorkspaceContext';
import SolutionEditor from './SolutionEditor';
import AIChatSidebar from './AIChatSidebar';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import NotesCollector from './NotesCollector';
import WorkspaceModeSelector from './WorkspaceModeSelector';
import ProblemSkeleton from './ProblemSkeleton';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getProblem, getDraft, updateDraft, getNotes, updateNotes } from '../../lib/crucibleApi';
import type { ICrucibleProblem } from '../../lib/crucibleApi';
import { useNavigate } from 'react-router-dom';
import { useClerkToken } from '@/lib/middleware';
import { useAuth } from '@clerk/clerk-react';
import { logger } from '@/lib/utils';

// Create a simple toast implementation since we don't have the UI component
const useToast = () => {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    logger.log(`${title}: ${description}`);
    // In a real implementation, this would show a toast notification
  };
  
  return { toast };
};

// Partial loading state interface
interface LoadingState {
  problem: boolean;
  draft: boolean;
  notes: boolean;
}

export default function CrucibleWorkspaceView({ problemId }: { problemId: string }) {
  const navigate = useNavigate();
  const { 
    setWordCount, 
    activeContent, 
    isWorkspaceModeVisible,
    currentMode,
    updateWorkspaceState
  } = useWorkspace();
  
  // Ensure the auth token is set
  useClerkToken();
  const { isSignedIn, isLoaded } = useAuth();
  
  // Add debug logging for auth state
  useEffect(() => {
    logger.log('CrucibleWorkspaceView auth state:', { isLoaded, isSignedIn, problemId });
  }, [isLoaded, isSignedIn, problemId]);
  
  const [showProblemSidebar, setShowProblemSidebar] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [solutionContent, setSolutionContent] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [problem, setProblem] = useState<ICrucibleProblem | null>(null);
  
  // Track loading state for each component separately
  const [loadingState, setLoadingState] = useState<LoadingState>({
    problem: true,
    draft: true,
    notes: true
  });
  
  // Computed overall loading state
  const isLoading = useMemo(() => {
    return loadingState.problem && loadingState.draft && loadingState.notes;
  }, [loadingState]);
  
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Use a ref to track if data has been fetched to prevent duplicate fetches
  const hasFetchedRef = useRef({
    problem: false,
    draft: false,
    notes: false
  });

  // Add debug logging for loading state changes
  useEffect(() => {
    logger.log('CrucibleWorkspaceView loading state changed:', { 
      loadingState, 
      hasFetched: hasFetchedRef.current,
      error,
      authError
    });
  }, [loadingState, error, authError]);

  // Fetch problem data with useCallback to ensure stable reference
  const fetchProblemData = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    
    // Prevent duplicate fetches
    if (hasFetchedRef.current.problem) {
      logger.log('Problem data already fetched, skipping');
      return;
    }
    
    logger.log('Starting problem data fetch:', problemId);
    hasFetchedRef.current.problem = true;
    
    try {
      // Fetch problem details
      logger.time('Problem data fetch');
      const problemData = await getProblem(problemId);
      logger.timeEnd('Problem data fetch');
      
      // Update state with fetched data
      setProblem(problemData);
      
      // Update workspace context
      updateWorkspaceState({
        currentProblem: problemData
      });
      
      // Mark problem as loaded
      setLoadingState(prev => ({ ...prev, problem: false }));
      
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to load problem data';
      logger.error('Error in fetchProblemData:', errorMessage);
      
      // Check if it's an authentication error
      if (err instanceof Error && (
        errorMessage.includes('Authentication error') || 
        errorMessage.includes('Unauthenticated')
      )) {
        setAuthError(true);
      } else {
        // General error
        toast({
          title: 'Error',
          description: `Failed to load problem data: ${errorMessage}`,
          variant: 'destructive'
        });
      }
    }
  }, [problemId, isLoaded, isSignedIn, updateWorkspaceState, toast]);

  // Fetch draft data with useCallback to ensure stable reference
  const fetchDraftData = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    
    // Prevent duplicate fetches
    if (hasFetchedRef.current.draft) {
      logger.log('Draft data already fetched, skipping');
      return;
    }
    
    logger.log('Starting draft data fetch:', problemId);
    hasFetchedRef.current.draft = true;
    
    try {
      // Fetch draft data
      logger.time('Draft data fetch');
      const draftData = await getDraft(problemId).catch(err => {
        if (err instanceof Error && err.message.includes('Unauthenticated')) {
          throw new Error('Authentication error');
        }
        logger.log('No existing draft found, starting with empty content');
        return { currentContent: '' };
      });
      logger.timeEnd('Draft data fetch');
      
      // Update state with fetched data
      setSolutionContent(draftData.currentContent);
      
      // Calculate word count
      const wordCount = draftData.currentContent.trim().split(/\s+/).length;
      setWordCount(wordCount);
      
      // Mark draft as loaded
      setLoadingState(prev => ({ ...prev, draft: false }));
      
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to load draft data';
      logger.error('Error in fetchDraftData:', errorMessage);
      
      // Check if it's an authentication error
      if (err instanceof Error && (
        errorMessage.includes('Authentication error') || 
        errorMessage.includes('Unauthenticated')
      )) {
        setAuthError(true);
      }
      
      // Mark as loaded even on error to allow the UI to proceed
      setLoadingState(prev => ({ ...prev, draft: false }));
    }
  }, [problemId, isLoaded, isSignedIn, setWordCount]);

  // Fetch notes data with useCallback to ensure stable reference
  const fetchNotesData = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    
    // Prevent duplicate fetches
    if (hasFetchedRef.current.notes) {
      logger.log('Notes data already fetched, skipping');
      return;
    }
    
    logger.log('Starting notes data fetch:', problemId);
    hasFetchedRef.current.notes = true;
    
    try {
      // Fetch notes data
      logger.time('Notes data fetch');
      const notesData = await getNotes(problemId).catch(err => {
        if (err instanceof Error && err.message.includes('Unauthenticated')) {
          throw new Error('Authentication error');
        }
        logger.log('No existing notes found, starting with empty content');
        return { 
          content: '',
          tags: [],
          problemId
        };
      });
      logger.timeEnd('Notes data fetch');
      
      // Update state with fetched data
      setNotesContent(notesData.content);
      
      // Mark notes as loaded
      setLoadingState(prev => ({ ...prev, notes: false }));
      
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notes data';
      logger.error('Error in fetchNotesData:', errorMessage);
      
      // Check if it's an authentication error
      if (err instanceof Error && (
        errorMessage.includes('Authentication error') || 
        errorMessage.includes('Unauthenticated')
      )) {
        setAuthError(true);
      }
      
      // Mark as loaded even on error to allow the UI to proceed
      setLoadingState(prev => ({ ...prev, notes: false }));
    }
  }, [problemId, isLoaded, isSignedIn]);
  
  // Use fetchData in useEffect with progressive loading
  useEffect(() => {
    let isMounted = true;
    
    // Only fetch if auth is loaded and the component is mounted
    if (isLoaded && isMounted) {
      // Force loading state to end after 15 seconds as a fallback
      const maxLoadingTimer = setTimeout(() => {
        if (isMounted) {
          logger.log('Max loading time reached, forcing loading state to false');
          setLoadingState({ problem: false, draft: false, notes: false });
        }
      }, 15000);
      
      // First fetch problem data (highest priority)
      fetchProblemData().then(() => {
        // Then fetch draft and notes data in parallel
        if (isMounted) {
          Promise.all([
            fetchDraftData(),
            fetchNotesData()
          ]).catch(err => {
            logger.error('Error in parallel data fetch:', err);
          });
        }
      }).catch(err => {
        logger.error('Error in progressive data fetch:', err);
        if (isMounted) {
          setLoadingState({ problem: false, draft: false, notes: false });
        }
      });
      
      return () => {
        isMounted = false;
        clearTimeout(maxLoadingTimer);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [fetchProblemData, fetchDraftData, fetchNotesData, isLoaded]);

  // Auto-save solution draft with proper cleanup
  useEffect(() => {
    if (!solutionContent || loadingState.draft || authError) return;
    
    let isMounted = true;
    const saveTimeout = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        logger.log('Auto-saving draft...');
        await updateDraft(problemId, solutionContent);
        if (isMounted) {
          setLastSaved(new Date());
          logger.log('Draft saved successfully');
        }
      } catch (err) {
        if (!isMounted) return;
        
        logger.error('Failed to auto-save draft:', err);
        
        // Check if it's an authentication error
        if (err instanceof Error && err.message.includes('Unauthenticated')) {
          setAuthError(true);
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please refresh the page to sign in again.',
            variant: 'destructive'
          });
        } else {
          // For other errors, show a toast but don't set authError
          toast({
            title: 'Save Error',
            description: 'Failed to save your draft. Will retry automatically.',
            variant: 'destructive'
          });
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => {
      isMounted = false;
      clearTimeout(saveTimeout);
    };
  }, [solutionContent, problemId, loadingState.draft, authError, toast]);
  
  // Auto-save notes with proper cleanup
  useEffect(() => {
    if (!notesContent || loadingState.notes || authError) return;
    
    let isMounted = true;
    const saveTimeout = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        logger.log('Auto-saving notes...');
        await updateNotes(problemId, { 
          content: notesContent, 
          tags: [],
          problemId
        });
        logger.log('Notes saved successfully');
      } catch (err) {
        if (!isMounted) return;
        
        logger.error('Failed to auto-save notes:', err);
        
        // Check if it's an authentication error
        if (err instanceof Error && err.message.includes('Unauthenticated')) {
          setAuthError(true);
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please refresh the page to sign in again.',
            variant: 'destructive'
          });
        } else {
          // For other errors, show a toast but don't set authError
          toast({
            title: 'Save Error',
            description: 'Failed to save your notes. Will retry automatically.',
            variant: 'destructive'
          });
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => {
      isMounted = false;
      clearTimeout(saveTimeout);
    };
  }, [notesContent, problemId, loadingState.notes, authError, toast]);

  const handleEditorChange = useCallback((content: string) => {
    setSolutionContent(content);
    const wordCount = content.trim().split(/\s+/).length;
    setWordCount(wordCount);
  }, [setWordCount]);
  
  const handleNotesChange = useCallback((content: string) => {
    setNotesContent(content);
  }, []);

  // Handle sidebar toggle events
  useEffect(() => {
    const handleToggleProblemSidebar = () => setShowProblemSidebar(prev => !prev);
    const handleToggleChatSidebar = () => setShowChatSidebar(prev => !prev);

    window.addEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
    window.addEventListener('toggle-chat-sidebar', handleToggleChatSidebar);

    return () => {
      window.removeEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
      window.removeEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
    };
  }, []);

  // Show full skeleton if problem data is still loading
  if (loadingState.problem) {
    return <ProblemSkeleton />;
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-gray-700">You need to be logged in to access this feature.</p>
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

  if (error || !problem) {
    return <div className="flex items-center justify-center h-full">Error loading problem: {error || 'Problem not found'}</div>;
  }

  return (
    <div className="flex h-full bg-base-100 dark:bg-base-900 text-base-content">
      {showProblemSidebar && (
        <ProblemDetailsSidebar
          title={problem.title}
          description={problem.description}
          requirements={problem.requirements}
          constraints={problem.constraints}
          hints={problem.hints || []}
          tags={problem.tags}
          estimatedTime={problem.estimatedTime}
          learningObjectives={problem.learningObjectives}
          defaultWidth={250}
          minWidth={200}
        />
      )}
      <div className="flex-1 overflow-hidden flex flex-col border-x border-base-200 dark:border-base-700">
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isWorkspaceModeVisible ? 'max-h-[80px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isWorkspaceModeVisible && <WorkspaceModeSelector />}
        </div>
        
        <div className="flex-1 overflow-auto p-2">
          {/* Show loading indicators for draft and notes */}
          {activeContent === 'solution' ? (
            <>
              {loadingState.draft ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p className="text-sm text-base-content/70">Loading your draft...</p>
                  </div>
                </div>
              ) : (
                <>
                  <SolutionEditor 
                    value={solutionContent}
                    onChange={handleEditorChange} 
                    key={`solution-${problemId}-${currentMode}`} 
                  />
                  {lastSaved && (
                    <div className="text-xs text-gray-500 mt-2 text-right">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {loadingState.notes ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p className="text-sm text-base-content/70">Loading your notes...</p>
                  </div>
                </div>
              ) : (
                <NotesCollector 
                  key={`notes-${problemId}-${currentMode}`} 
                  initialContent={notesContent}
                  onChange={handleNotesChange}
                />
              )}
            </>
          )}
        </div>
      </div>
      {showChatSidebar && (
        <AIChatSidebar 
          defaultWidth={250}
          minWidth={200}
          problemId={problemId}
        />
      )}
    </div>
  );
} 