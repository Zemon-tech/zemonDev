import { useWorkspace } from '../../lib/WorkspaceContext';
import SolutionEditor from './SolutionEditor';
import AIChatSidebar from './AIChatSidebar';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import NotesCollector from './NotesCollector';
import WorkspaceModeSelector from './WorkspaceModeSelector';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getProblem, getDraft, updateDraft, getNotes, updateNotes } from '../../lib/crucibleApi';
import type { ICrucibleProblem } from '../../lib/crucibleApi';
import { useNavigate } from 'react-router-dom';
import { useClerkToken } from '@/lib/middleware';
import { useAuth } from '@clerk/clerk-react';

// Create a simple toast implementation since we don't have the UI component
const useToast = () => {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${title}: ${description}`);
    // In a real implementation, this would show a toast notification
  };
  
  return { toast };
};

export default function CrucibleWorkspaceView({ problemId }: { problemId: string }) {
  const navigate = useNavigate();
  const { 
    setWordCount, 
    activeContent, 
    isWorkspaceModeVisible,
    currentMode
  } = useWorkspace();
  
  // Ensure the auth token is set
  useClerkToken();
  const { isSignedIn, isLoaded } = useAuth();
  
  // Add debug logging for auth state
  useEffect(() => {
    console.log('CrucibleWorkspaceView auth state:', { isLoaded, isSignedIn, problemId });
  }, [isLoaded, isSignedIn, problemId]);
  
  const [showProblemSidebar, setShowProblemSidebar] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [solutionContent, setSolutionContent] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [problem, setProblem] = useState<ICrucibleProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Use a ref to track if data has been fetched to prevent duplicate fetches
  const hasFetchedRef = useRef(false);

  // Add debug logging for loading state changes
  useEffect(() => {
    console.log('CrucibleWorkspaceView loading state changed:', { 
      isLoading, 
      hasFetched: hasFetchedRef.current,
      error,
      authError
    });
  }, [isLoading, error, authError]);

  // Fetch problem data and user's draft/notes with useCallback to ensure stable reference
  const fetchData = useCallback(async () => {
    if (!isLoaded) {
      console.log('Clerk not loaded yet, skipping data fetch');
      return;
    }
    
    if (!isSignedIn) {
      console.log('User not signed in, setting auth error');
      setAuthError(true);
      setIsLoading(false);
      return;
    }
    
    // Prevent duplicate fetches
    if (hasFetchedRef.current) {
      console.log('Data already fetched, skipping');
      return;
    }
    
    console.log('Starting data fetch for problem:', problemId);
    hasFetchedRef.current = true;
    
    setIsLoading(true);
    setError(null);
    setAuthError(false);
    
    // Set a timeout to ensure we don't get stuck in loading state
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, forcing loading state to false');
        setIsLoading(false);
      }
    }, 10000); // Force loading to end after 10 seconds max
    
    try {
      // Fetch problem details
      const problemData = await getProblem(problemId);
      setProblem(problemData);
      
      // Try to fetch user's draft solution and notes in parallel
      const [draftResult, notesResult] = await Promise.allSettled([
        getDraft(problemId).catch(err => {
          // Handle draft fetch errors
          if (err instanceof Error && err.message.includes('Unauthenticated')) {
            throw new Error('Authentication error');
          }
          console.log('No existing draft found, starting with empty content');
          return { currentContent: '' };
        }),
        getNotes(problemId).catch(err => {
          // Handle notes fetch errors
          if (err instanceof Error && err.message.includes('Unauthenticated')) {
            throw new Error('Authentication error');
          }
          console.log('No existing notes found, starting with empty content');
          return { content: '' };
        })
      ]);
      
      // Process draft result
      if (draftResult.status === 'fulfilled') {
        const draftData = draftResult.value;
        setSolutionContent(draftData.currentContent || '');
        setWordCount(draftData.currentContent?.trim().split(/\s+/).length || 0);
      }
      
      // Process notes result
      if (notesResult.status === 'fulfilled') {
        const notesData = notesResult.value;
        setNotesContent(notesData.content || '');
      }
      
      // Check if either request had an authentication error
      if (
        (draftResult.status === 'rejected' && draftResult.reason.message === 'Authentication error') ||
        (notesResult.status === 'rejected' && notesResult.reason.message === 'Authentication error')
      ) {
        setAuthError(true);
        console.error('Authentication error when fetching user data');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load problem data';
      console.error('Error in fetchData:', errorMessage);
      
      // Check if it's an authentication error
      if (err instanceof Error && (
        errorMessage.includes('Unauthenticated') || 
        errorMessage.includes('Authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')
      )) {
        setAuthError(true);
        console.error('Authentication error:', err);
      } else if (err instanceof Error && errorMessage.includes('429')) {
        // Handle rate limiting
        setError('Too many requests. Please wait a moment before trying again.');
        return; // Don't set isLoading to false yet, will be handled by retry logic
      } else {
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoading(false);
      console.log('Data fetch completed or failed, loading state set to false');
    }
  }, [problemId, setWordCount, toast, isLoaded, isSignedIn]);
  
  // Use fetchData in useEffect
  useEffect(() => {
    let isMounted = true;
    let loadingTimer: ReturnType<typeof setTimeout> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    
    // Only fetch if auth is loaded and the component is mounted
    if (isLoaded && isMounted) {
      // Add a small delay before showing loading indicator to prevent flashing
      loadingTimer = setTimeout(() => {
        if (isMounted && !hasFetchedRef.current) {
          setIsLoading(true);
        }
      }, 300);
      
      // Force loading state to end after 15 seconds as a fallback
      const maxLoadingTimer = setTimeout(() => {
        if (isMounted && isLoading) {
          console.log('Max loading time reached, forcing loading state to false');
          setIsLoading(false);
        }
      }, 15000);
      
      fetchData().catch(err => {
        if (!isMounted) return;
        
        console.error('Error in fetchData:', err);
        
        // Handle rate limiting with retry
        if (err instanceof Error && err.message.includes('429')) {
          retryTimer = setTimeout(() => {
            if (isMounted) {
              console.log('Retrying API call after rate limit...');
              hasFetchedRef.current = false; // Reset fetch flag to allow retry
              fetchData();
            }
          }, 5000);
        }
        
        setIsLoading(false);
      });
      
      return () => {
        isMounted = false;
        if (loadingTimer) clearTimeout(loadingTimer);
        if (retryTimer) clearTimeout(retryTimer);
        if (maxLoadingTimer) clearTimeout(maxLoadingTimer);
      };
    }
    
    return () => {
      isMounted = false;
      if (loadingTimer) clearTimeout(loadingTimer);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [fetchData, isLoaded, isLoading]);

  // Auto-save solution draft with proper cleanup
  useEffect(() => {
    if (!solutionContent || isLoading || authError) return;
    
    let isMounted = true;
    const saveTimeout = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        console.log('Auto-saving draft...');
        await updateDraft(problemId, solutionContent);
        if (isMounted) {
          setLastSaved(new Date());
          console.log('Draft saved successfully');
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Failed to auto-save draft:', err);
        
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
  }, [solutionContent, problemId, isLoading, authError, toast]);
  
  // Auto-save notes with proper cleanup
  useEffect(() => {
    if (!notesContent || isLoading || authError) return;
    
    let isMounted = true;
    const saveTimeout = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        console.log('Auto-saving notes...');
        await updateNotes(problemId, { content: notesContent, tags: [] });
        console.log('Notes saved successfully');
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Failed to auto-save notes:', err);
        
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
  }, [notesContent, problemId, isLoading, authError, toast]);

  const handleEditorChange = (content: string) => {
    setSolutionContent(content);
    const wordCount = content.trim().split(/\s+/).length;
    setWordCount(wordCount);
  };
  
  const handleNotesChange = (content: string) => {
    setNotesContent(content);
  };

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

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading problem data...</div>;
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
          {activeContent === 'solution' ? (
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
          ) : (
            <NotesCollector 
              key={`notes-${problemId}-${currentMode}`} 
              initialContent={notesContent}
              onChange={handleNotesChange}
            />
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