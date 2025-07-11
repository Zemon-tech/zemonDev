import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { updateDraft, updateNotes, type ICrucibleProblem, type ICrucibleNote, type ISolutionDraft } from '../../lib/crucibleApi';
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
    showProblemSidebar,
    setShowProblemSidebar,
    showChatSidebar,
    setShowChatSidebar,
    loadWorkspaceState,
    updateWorkspaceState
  } = useWorkspace();
  
  const [solutionContent, setSolutionContent] = useState(initialDraft?.currentContent || '');
  const [notesContent, setNotesContent] = useState(initialNotes?.[0]?.content || '');

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

  const handleEditorChange = useCallback((content: string) => {
    setSolutionContent(content);
    setWordCount(content.trim().split(/\s+/).filter(Boolean).length);
  }, [setWordCount]);
  
  const handleNotesChange = useCallback((content: string) => setNotesContent(content), []);

  useEffect(() => {
    const toggleProblem = () => setShowProblemSidebar(!showProblemSidebar);
    const toggleChat = () => setShowChatSidebar(!showChatSidebar);
    window.addEventListener('toggle-problem-sidebar', toggleProblem);
    window.addEventListener('toggle-chat-sidebar', toggleChat);
    return () => {
      window.removeEventListener('toggle-problem-sidebar', toggleProblem);
      window.removeEventListener('toggle-chat-sidebar', toggleChat);
    };
  }, [setShowProblemSidebar, setShowChatSidebar, showProblemSidebar, showChatSidebar]);

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