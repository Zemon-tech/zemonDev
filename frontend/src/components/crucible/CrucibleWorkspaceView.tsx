import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { updateDraft, submitSolutionForAnalysis, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft, reattemptDraft, getDraft } from '../../lib/crucibleApi';
import { logger } from '../../lib/utils';
import { useWorkspace } from '../../lib/WorkspaceContext';
import { useAnalysis } from '@/context/AnalysisContext';
import SolutionEditor from './SolutionEditor';
import NotesCollector from './NotesCollector';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import AIChatSidebar from './AIChatSidebar';



interface CrucibleWorkspaceViewProps {
  problem: ICrucibleProblem;
  initialDraft: ISolutionDraft | null;
  initialNotes: ICrucibleNote[] | null;
}

export default function CrucibleWorkspaceView({ problem, initialDraft }: CrucibleWorkspaceViewProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  // Use the centralized analysis context
  const { analysis, loading: analysisLoading, checkAnalysis, markSubmitting } = useAnalysis();

  const {
    setWordCount,
    activeContent,
    showProblemSidebar,
    setShowProblemSidebar,
    showChatSidebar,
    setShowChatSidebar,
    loadWorkspaceState,
    updateWorkspaceState
  } = useWorkspace();
  
  const [solutionContent, setSolutionContent] = useState(initialDraft?.currentContent || '');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isReattempting, setIsReattempting] = useState<boolean>(false);
  // REMOVED: Version-related state variables
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(initialDraft?.currentContent || '');
  
  // Helper function to ensure there's an active draft
  const ensureActiveDraft = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      // Try to get existing draft
      try {
        const draft = await getDraft(problem._id, () => Promise.resolve(token));
        if (draft?.status === 'active') {
          // We already have an active draft
          return;
        }
      } catch (draftError) {
        // No active draft found, which is expected in this case
        logger.info('No active draft found, creating new one');
      }
      
      // Create a new draft with current content
      logger.info('Creating new active draft after analysis failure');
      const newDraft = await updateDraft(problem._id, solutionContent, () => Promise.resolve(token));
      
      // Update state with new draft
      setLastSavedContent(solutionContent);
      
      return newDraft;
    } catch (error) {
      logger.error('Failed to ensure active draft:', error);
    }
  }, [problem._id, getToken, solutionContent]);

  // Load workspace state when problem changes
  useEffect(() => {
    loadWorkspaceState(problem._id);
    updateWorkspaceState({ currentProblem: problem });
  }, [problem._id, loadWorkspaceState, updateWorkspaceState, problem]);
  
  // Update lastSavedContent when initialDraft changes
  useEffect(() => {
    setLastSavedContent(initialDraft?.currentContent || '');
  }, [initialDraft?.currentContent]);
  
  // Autosave solution draft with optimized logic
  useEffect(() => {
    // Skip autosave if no content or if already saving
    if (!solutionContent.trim() || isSavingDraft) return;
    
    // Skip if content hasn't changed from last saved content
    if (solutionContent === lastSavedContent) return;
    
    const handler = setTimeout(async () => {
      // Double-check we're not already saving
      if (isSavingDraft) return;
      
      try {
        setIsSavingDraft(true);
        const token = await getToken();
        if (!token) return;
        
        await updateDraft(problem._id, solutionContent, () => Promise.resolve(token));
        setLastSavedContent(solutionContent);
      } catch (err) {
        logger.error('Failed to save draft:', err);
        // Don't show alert for autosave failures - user can manually save
      } finally {
        setIsSavingDraft(false);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [solutionContent, problem._id, getToken, lastSavedContent, isSavingDraft]);

  useEffect(() => {
    let isMounted = true;
    async function checkSubmission() {
      // Don't check submission status if user is reattempting or already checking
      if (isReattempting || isCheckingSubmission) {
        return;
      }
      
      // Safety timeout to prevent infinite loading state
      const safetyTimeout = setTimeout(() => {
        if (isMounted) {
          setIsCheckingSubmission(false);
          logger.warn('Submission check timed out after 10 seconds');
        }
      }, 10000);
      
      try {
        setIsCheckingSubmission(true);
        const token = await getToken();
        if (!token) return;
        
        // For new problems, prioritize showing the editor immediately
        if (!initialDraft) {
          logger.info('No draft exists yet, showing editor for new problem');
          if (isMounted) {
            setHasSubmitted(false);
          }
          return;
        }
        
        // If user has an active draft, they can edit
        if (initialDraft && initialDraft.status === 'active') {
          logger.info('Active draft exists, showing editor');
          if (isMounted) {
            setHasSubmitted(false);
          }
          return;
        }
        
        // Only check for analysis if we have an archived draft
        // This ensures we don't waste API calls for new problems
        if (initialDraft && initialDraft.status !== 'active') {
          // Check if user is reattempting - if so, don't check for analysis
          const isReattempting = sessionStorage.getItem(`reattempting_${problem._id}`);
          const reattemptTime = sessionStorage.getItem(`reattempt_time_${problem._id}`);
          
          // Check if user is actively reattempting (within 30 minutes of reattempt time)
          const isActivelyReattempting = reattemptTime && (Date.now() - parseInt(reattemptTime)) < 30 * 60 * 1000;
          
          if (isReattempting || isActivelyReattempting) {
            logger.info('User is reattempting, skipping analysis check');
            if (isMounted) {
              setHasSubmitted(false);
            }
            return;
          }
          
          // Use the shared context instead of direct API call
          checkAnalysis(problem._id);
          
          // If analysis exists in context, set state and redirect
          if (analysis && isMounted) {
            logger.info('Found existing analysis in context');
            setHasSubmitted(true);
            
            // Only redirect if we're not already on the result page
            const isOnResultPage = window.location.pathname.includes('/result');
            if (!isOnResultPage) {
              // Store redirect state in sessionStorage to prevent loops
              const redirectKey = `redirect_${problem._id}`;
              const hasRedirected = sessionStorage.getItem(redirectKey);
              const isCurrentlyReattempting = sessionStorage.getItem(`reattempting_${problem._id}`);
              const reattemptTime = sessionStorage.getItem(`reattempt_time_${problem._id}`);
              const isActivelyReattempting = reattemptTime && (Date.now() - parseInt(reattemptTime)) < 30 * 60 * 1000;
              
              if (!hasRedirected && !isCurrentlyReattempting && !isActivelyReattempting) {
                logger.info('Redirecting to result page from workspace view');
                // Mark that we've initiated a redirect for this problem
                sessionStorage.setItem(redirectKey, 'true');
                const username = window.location.pathname.split('/')[1];
                navigate(`/${username}/crucible/problem/${problem._id}/result`);
                
                // Clear the redirect flag after navigation (helps with browser back button)
                setTimeout(() => {
                  if (window.location.pathname.includes('/result')) {
                    sessionStorage.removeItem(redirectKey);
                  }
                }, 1000);
                
                return; // Exit early after redirect
              } else {
                logger.info('Redirect already initiated, user is reattempting, or actively reattempting, skipping');
              }
            }
            return;
          }
          
          // If no analysis but we're still loading, wait for it
          if (analysisLoading) {
            return;
          }
          
          // No analysis found, ensure there's an active draft
          logger.info('No analysis found for archived draft, creating new active draft');
          if (isMounted) {
            setHasSubmitted(false);
            // Ensure there's an active draft
            await ensureActiveDraft();
          }
        }
      } catch (err) {
        // General error, assume user can edit
        if (isMounted) {
          setHasSubmitted(false);
        }
      } finally {
        // Clear safety timeout
        clearTimeout(safetyTimeout);
        
        if (isMounted) {
          setIsCheckingSubmission(false);
        }
      }
    }
    checkSubmission();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem._id, getToken, navigate, initialDraft, isReattempting, ensureActiveDraft]);

  // REMOVED: Version history functionality - no longer needed

  // Handler for reattempt
  const handleReattempt = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const newDraft = await reattemptDraft(problem._id, () => Promise.resolve(token));
      setSolutionContent(newDraft.currentContent || '');
      setIsReattempting(true);
      setHasSubmitted(false);
      
      // Clear any existing analysis from context to prevent redirect loops
      if (analysis && analysis.problemId === problem._id) {
        // We can't directly clear the analysis here, but the markReattempting function should handle this
        logger.info('Reattempting - analysis should be cleared by markReattempting');
      }
      
      // Show a notification that the previous solution has been loaded
      if (newDraft.currentContent && newDraft.currentContent.trim() !== ' ') {
        logger.info('Previous solution loaded for reattempt');
        // You could add a toast notification here if you have a toast system
      }
    } catch (err) {
      logger.error('Failed to reattempt draft:', err);
      alert('Could not start a new attempt. Please try again.');
    }
  }, [problem._id, getToken, analysis]);

  const handleEditorChange = useCallback((content: string) => {
    setSolutionContent(content);
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length);
  }, [setWordCount]);
  


  // Handle submit button click
  const handleSubmitSolution = useCallback(async () => {
    if (!solutionContent.trim()) {
      alert("Please provide a solution before submitting.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        alert("You need to be signed in to submit a solution.");
        return;
      }

      // Reset reattempting state since user is submitting
      setIsReattempting(false);
      
      // Mark the problem as being submitted in the context
      // This will clear any existing analysis and set submission flags
      markSubmitting(problem._id);

      // Navigate to the results page immediately, before waiting for the analysis
      // This will show the loading state while the analysis is being processed
      const username = window.location.pathname.split('/')[1];
      navigate(`/${username}/crucible/problem/${problem._id}/result`);

      // Submit the solution for analysis in the background
      submitSolutionForAnalysis(problem._id, () => Promise.resolve(token))
        .then(response => {
          if (!response || !response.analysisId) {
            logger.error('Invalid response from submitSolutionForAnalysis:', response);
            return;
          }
          
          // Log the response and navigation URL for debugging
          logger.info('Analysis response:', response);
          logger.info(`Redirecting to: /crucible/results/${response.analysisId}`);
          
          // Navigate to the results page with the analysis ID
          navigate(`/${username}/crucible/results/${response.analysisId}`, { replace: true });
        })
        .catch(apiError => {
          logger.error('API error during solution submission:', apiError);
          
          // Handle specific error types from the backend
          if (apiError.message?.includes('503') || apiError.message?.includes('model_overloaded')) {
            alert("The AI model is currently overloaded. Please try again in a few minutes.");
          } else if (apiError.message?.includes('422') || apiError.message?.includes('parsing_error')) {
            alert("There was an issue processing your solution. Please try submitting again.");
          } else if (apiError.message?.includes('500') || apiError.message?.includes('service_error')) {
            alert("The AI service is experiencing issues. Please try again later.");
          } else if (apiError instanceof Error) {
            if (apiError.message.includes('401') || apiError.message.includes('403')) {
              alert("Authentication error. Please sign in again.");
            } else if (apiError.message.includes('404')) {
              alert("The problem could not be found. It may have been removed.");
            } else if (apiError.message.includes('429')) {
              alert("You're submitting too many solutions too quickly. Please wait a moment and try again.");
            } else {
              alert(`Error submitting solution: ${apiError.message}`);
            }
          } else {
            alert("There was an error submitting your solution. Please try again.");
          }
          
          // Navigate back to the problem page if there was an error
          // First ensure there's an active draft before redirecting
          ensureActiveDraft().then(() => {
            navigate(`/${username}/crucible/problem/${problem._id}`);
          });
        });
    } catch (error) {
      logger.error('Failed to submit solution:', error);
      alert("There was an error submitting your solution. Please try again.");
    }
  }, [solutionContent, problem._id, getToken, navigate, markSubmitting]);

  useEffect(() => {
    const toggleProblem = () => setShowProblemSidebar(!showProblemSidebar);
    const toggleChat = () => setShowChatSidebar(!showChatSidebar);
    const handleSubmitClick = () => handleSubmitSolution();
    window.addEventListener('toggle-problem-sidebar', toggleProblem);
    window.addEventListener('toggle-chat-sidebar', toggleChat);
    window.addEventListener('submit-solution', handleSubmitClick);
    
    return () => {
      window.removeEventListener('toggle-problem-sidebar', toggleProblem);
      window.removeEventListener('toggle-chat-sidebar', toggleChat);
      window.removeEventListener('submit-solution', handleSubmitClick);
    };
  }, [handleSubmitSolution, setShowProblemSidebar, setShowChatSidebar, showProblemSidebar, showChatSidebar]);

  const handleCloseChatSidebar = useCallback(() => {
    setShowChatSidebar(false);
  }, [setShowChatSidebar]);

  return (
    <div className="flex h-full bg-base-100">
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
          difficulty={problem.difficulty}
          category={problem.category}
          expectedOutcome={problem.expectedOutcome}
          prerequisites={problem.prerequisites}
          userPersonas={problem.userPersona}
          dataAssumptions={problem.dataAssumptions}
          edgeCases={problem.edgeCases}
          communityTips={problem.communityTips}
          aiPrompts={problem.aiPrompts}
          technicalParameters={problem.technicalParameters}
        />
      )}
      <div className="flex-1 overflow-hidden flex flex-col border-x border-base-200 dark:border-base-700 shadow-lg">
        <div className="flex-1 overflow-auto p-4 bg-base-50 dark:bg-base-900">
          {/* REMOVED: Version History Button and Status */}
          {/* REMOVED: Version History UI */}
          {/* Show appropriate content based on submission status */}
          {activeContent === 'solution' && (isCheckingSubmission || analysisLoading) && initialDraft && initialDraft.status !== 'active' ? (
            // Only show loading state for existing problems with archived drafts
            // For new problems or active drafts, we show the editor immediately
            <div className="text-center text-base-content/70 p-8">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Checking submission status...</span>
              </div>
            </div>
          ) : activeContent === 'solution' && hasSubmitted ? (
            // Show reattempt button if user has submitted a solution
            <div className="text-center text-base-content/70 p-8">
              <p>You have already submitted a solution for this problem.</p>
              <p className="mt-2 text-sm opacity-75">View your analysis on the result page.</p>
              <button className="btn btn-primary mt-4" onClick={handleReattempt}>
                Reattempt Problem
              </button>
            </div>
          ) : activeContent === 'solution' && (initialDraft?.status === 'active' || isReattempting || !initialDraft) ? (
            // Show editor if user has active draft, is reattempting, or is a new user
            <SolutionEditor value={solutionContent} onChange={handleEditorChange} />
          ) : activeContent === 'solution' ? (
            // Fallback loading state
            <div className="text-center text-base-content/70 p-8">
              <p>Loading problem workspace...</p>
            </div>
          ) : null}
          {activeContent === 'notes' && (
            <NotesCollector 
              problemId={problem._id} 
              onChange={() => {}} 
            />
          )}
        </div>
      </div>
      {showChatSidebar && (
        <AIChatSidebar 
          problemId={problem._id} 
          solutionContent={solutionContent}
          isOpen={showChatSidebar}
          onClose={handleCloseChatSidebar}
        />
      )}
    </div>
  );
}
// TODO: Add advanced restore/compare UI for version history in a later phase.
// TODO: Refine UX for reattempt and result page redirection in a later phase.