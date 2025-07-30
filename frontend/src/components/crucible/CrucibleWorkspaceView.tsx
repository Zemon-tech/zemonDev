import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { updateDraft, submitSolutionForAnalysis, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft, getLatestAnalysis, reattemptDraft, getDraftVersions } from '../../lib/crucibleApi';
import { logger } from '../../lib/utils';
import { useWorkspace } from '../../lib/WorkspaceContext';
import SolutionEditor from './SolutionEditor';
import NotesCollector from './NotesCollector';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import AIChatSidebar from './AIChatSidebar';
import WorkspaceModeSelector from './WorkspaceModeSelector';


interface CrucibleWorkspaceViewProps {
  problem: ICrucibleProblem;
  initialDraft: ISolutionDraft | null;
  initialNotes: ICrucibleNote[] | null;
}

export default function CrucibleWorkspaceView({ problem, initialDraft }: CrucibleWorkspaceViewProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const {
    setWordCount,
    activeContent,
    isWorkspaceModeVisible,
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
  const [draftVersions, setDraftVersions] = useState<Array<{ content: string; timestamp: Date; description: string }>>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Load workspace state when problem changes
  useEffect(() => {
    loadWorkspaceState(problem._id);
    updateWorkspaceState({ currentProblem: problem });
  }, [problem._id, loadWorkspaceState, updateWorkspaceState, problem]);
  
  // Autosave solution draft
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (solutionContent === (initialDraft?.currentContent || '')) return;
      
      try {
        const token = await getToken();
        if (!token) return;
        await updateDraft(problem._id, solutionContent, () => Promise.resolve(token));
      } catch (err) {
        logger.error('Failed to save draft:', err);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [solutionContent, problem._id, getToken, initialDraft]);

  useEffect(() => {
    let isMounted = true;
    async function checkSubmission() {
      try {
        const token = await getToken();
        if (!token) return;
        const latest = await getLatestAnalysis(problem._id, () => Promise.resolve(token));
        if (latest && isMounted) {
          setHasSubmitted(true);
          // Optionally, redirect to result page:
          const username = window.location.pathname.split('/')[1];
          navigate(`/${username}/crucible/problem/${problem._id}/result`);
        }
      } catch (err) {
        // No analysis found is not an error, just means user can edit
        setHasSubmitted(false);
      }
    }
    checkSubmission();
    return () => { isMounted = false; };
  }, [problem._id, getToken, navigate]);

  // Fetch draft versions
  useEffect(() => {
    async function fetchVersions() {
      try {
        const token = await getToken();
        if (!token) return;
        const versions = await getDraftVersions(problem._id, () => Promise.resolve(token));
        setDraftVersions(versions || []);
      } catch (err) {
        setDraftVersions([]);
      }
    }
    if (showVersionHistory) fetchVersions();
  }, [showVersionHistory, problem._id, getToken]);

  // Handler to restore a version
  const handleRestoreVersion = async (version: { content: string; timestamp: Date; description: string }) => {
    try {
      const token = await getToken();
      if (!token) return;
      await updateDraft(problem._id, version.content, () => Promise.resolve(token));
      setSolutionContent(version.content);
      setShowVersionHistory(false);
    } catch (err) {
      alert('Failed to restore version.');
    }
  };

  // Handler for reattempt
  const handleReattempt = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const newDraft = await reattemptDraft(problem._id, () => Promise.resolve(token));
      setSolutionContent(newDraft.currentContent || '');
      setIsReattempting(true);
      setHasSubmitted(false);
    } catch (err) {
      logger.error('Failed to reattempt draft:', err);
      alert('Could not start a new attempt. Please try again.');
    }
  }, [problem._id, getToken]);

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

      // Submit the solution for analysis
      const response = await submitSolutionForAnalysis(problem._id, () => Promise.resolve(token));
      
      if (!response || !response.analysisId) {
        logger.error('Invalid response from submitSolutionForAnalysis:', response);
        return;
      }
      
      // Log the response and navigation URL for debugging
      logger.info('Analysis response:', response);
      logger.info(`Redirecting to: /crucible/results/${response.analysisId}`);
      
      // Navigate to the results page with the analysis ID
      const username = window.location.pathname.split('/')[1];
      navigate(`/${username}/crucible/results/${response.analysisId}`, { replace: true });
      
    } catch (apiError: any) {
      logger.error('API error during solution submission:', apiError);
      
      // Handle specific error types from the backend
      if (apiError.message?.includes('503') || apiError.message?.includes('model_overloaded')) {
        alert("The AI model is currently overloaded. Please try again in a few minutes.");
        return;
      }
      
      if (apiError.message?.includes('422') || apiError.message?.includes('parsing_error')) {
        alert("There was an issue processing your solution. Please try submitting again.");
        return;
      }
      
      if (apiError.message?.includes('500') || apiError.message?.includes('service_error')) {
        alert("The AI service is experiencing issues. Please try again later.");
        return;
      }
      
      // Provide more specific error messages based on the error
      if (apiError instanceof Error) {
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
    }
  }, [solutionContent, problem._id, getToken, navigate]);

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
        />
      )}
      <div className="flex-1 overflow-hidden flex flex-col border-x border-base-200 dark:border-base-700 shadow-lg">
        {isWorkspaceModeVisible && <WorkspaceModeSelector />}
        <div className="flex-1 overflow-auto p-4 bg-base-50 dark:bg-base-900">
          {/* Version History Button */}
          <div className="flex justify-end mb-2">
            <button className="btn btn-sm btn-outline" onClick={() => setShowVersionHistory((v) => !v)}>
              {showVersionHistory ? 'Hide Version History' : 'Show Version History'}
            </button>
          </div>
          {/* Version History UI */}
          {showVersionHistory && (
            <div className="mb-4">
              <ul className="menu bg-base-200 rounded-box p-4">
                {draftVersions.length === 0 ? (
                  <li>No versions found.</li>
                ) : (
                  draftVersions.map((version, idx) => (
                    <li key={idx} className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-base-content/70">{new Date(version.timestamp).toLocaleString()}</span>
                      <span className="ml-2 text-base-content/80 flex-1 truncate">{version.description || 'No description'}</span>
                      <button className="btn btn-xs btn-primary ml-auto" onClick={() => handleRestoreVersion(version)}>
                        Restore
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          {/* Only show SolutionEditor if not submitted or in reattempt mode */}
          {activeContent === 'solution' && (!hasSubmitted || isReattempting) ? (
            <SolutionEditor value={solutionContent} onChange={handleEditorChange} />
          ) : (
            <div className="text-center text-base-content/70 p-8">
              <p>You have already submitted a solution for this problem.</p>
              <button className="btn btn-primary mt-4" onClick={handleReattempt}>
                Reattempt Problem
              </button>
            </div>
          )}
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