import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { updateDraft, updateNotes, submitSolutionForAnalysis, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft } from '../../lib/crucibleApi';
import { logger } from '../../lib/utils';
import { useWorkspace } from '../../lib/WorkspaceContext';
import SolutionEditor from './SolutionEditor';
import NotesCollector from './NotesCollector';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import AIChatSidebar from './AIChatSidebar';
import WorkspaceModeSelector from './WorkspaceModeSelector';
import ProblemSkeleton from './ProblemSkeleton';

interface CrucibleWorkspaceViewProps {
  problem: ICrucibleProblem;
  initialDraft: ISolutionDraft | null;
  initialNotes: ICrucibleNote[] | null;
}

export default function CrucibleWorkspaceView({ problem, initialDraft, initialNotes }: CrucibleWorkspaceViewProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const {
    setWordCount,
    activeContent,
    isWorkspaceModeVisible,
  } = useWorkspace();
  
  const [solutionContent, setSolutionContent] = useState(initialDraft?.currentContent || '');
  const [notesContent, setNotesContent] = useState(initialNotes?.[0]?.content || '');
  const [showProblemSidebar, setShowProblemSidebar] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleEditorChange = useCallback((content: string) => {
    setSolutionContent(content);
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length);
  }, [setWordCount]);
  
  const handleNotesChange = useCallback((content: string) => setNotesContent(content), []);

  // Handle submit button click
  const handleSubmitSolution = useCallback(async () => {
    if (!solutionContent.trim()) {
      alert("Please provide a solution before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        alert("You need to be signed in to submit a solution.");
        return;
      }

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
          
          // Provide more specific error messages based on the error
          if (apiError instanceof Error) {
            if (apiError.message.includes('401') || apiError.message.includes('403')) {
              alert("Authentication error. Please sign in again and try.");
            } else if (apiError.message.includes('404')) {
              alert("The problem could not be found. It may have been removed.");
            } else if (apiError.message.includes('429')) {
              alert("You're submitting too many solutions too quickly. Please wait a moment and try again.");
            } else if (apiError.message.includes('500')) {
              alert("The server encountered an error while processing your solution. Our team has been notified.");
            } else {
              alert(`Error submitting solution: ${apiError.message}`);
            }
          } else {
            alert("There was an error submitting your solution. Please try again.");
          }
          
          // Navigate back to the problem page if there was an error
          navigate(`/${username}/crucible/problem/${problem._id}`);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (error) {
      logger.error('Failed to submit solution:', error);
      alert("There was an error submitting your solution. Please try again.");
      setIsSubmitting(false);
    }
  }, [solutionContent, problem._id, getToken, navigate]);

  useEffect(() => {
    const toggleProblem = () => setShowProblemSidebar(p => !p);
    const toggleChat = () => setShowChatSidebar(p => !p);
    const handleSubmitClick = () => handleSubmitSolution();
    
    window.addEventListener('toggle-problem-sidebar', toggleProblem);
    window.addEventListener('toggle-chat-sidebar', toggleChat);
    window.addEventListener('submit-solution', handleSubmitClick);
    
    return () => {
      window.removeEventListener('toggle-problem-sidebar', toggleProblem);
      window.removeEventListener('toggle-chat-sidebar', toggleChat);
      window.removeEventListener('submit-solution', handleSubmitClick);
    };
  }, [handleSubmitSolution]);

  const handleCloseChatSidebar = useCallback(() => {
    setShowChatSidebar(false);
  }, []);

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
      <div className="flex-1 overflow-hidden flex flex-col">
        {isWorkspaceModeVisible && <WorkspaceModeSelector />}
        <div className="flex-1 overflow-auto p-4">
          {activeContent === 'solution' ? (
            <SolutionEditor value={solutionContent} onChange={handleEditorChange} />
          ) : (
            <NotesCollector 
              problemId={problem._id} 
              onChange={handleNotesChange} 
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