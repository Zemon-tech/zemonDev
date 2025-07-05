import { useWorkspace } from '../../lib/WorkspaceContext';
import SolutionEditor from './SolutionEditor';
import AIChatSidebar from './AIChatSidebar';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import NotesCollector from './NotesCollector';
import WorkspaceModeSelector from './WorkspaceModeSelector';
import { useEffect, useState } from 'react';

// Dummy problem data (replace with actual data fetching)
const dummyProblem = {
  title: 'Design a URL Shortener (like bit.ly)',
  description: 'Build a scalable service to shorten URLs, handle redirects, and track analytics. Consider database schema, unique code generation, and high availability.',
  requirements: [
    'Design a system to shorten long URLs',
    'Handle redirects efficiently',
    'Track basic analytics (clicks, referrers)',
    'Ensure high availability and scalability'
  ],
  constraints: [
    'URLs must be unique',
    'Shortened URLs should be as short as possible',
    'System should handle high traffic',
    'Analytics should be real-time'
  ],
  hints: [
    'Consider using a hash function for URL generation',
    'Think about caching strategies',
    'Plan for database sharding'
  ],
  tags: ['system-design', 'database', 'scaling', 'backend']
};

export default function CrucibleWorkspaceView({ problemId }: { problemId: string }) {
  const { 
    setWordCount, 
    activeContent, 
    isWorkspaceModeVisible,
    currentMode
  } = useWorkspace();
  
  const [showProblemSidebar, setShowProblemSidebar] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [notes, setNotes] = useState('');
  const [solutionContent, setSolutionContent] = useState('');

  const handleEditorChange = (content: string) => {
    setSolutionContent(content);
    const wordCount = content.trim().split(/\s+/).length;
    setWordCount(wordCount);
  };

  // Handle sidebar toggle events
  useEffect(() => {
    const handleToggleProblemSidebar = () => setShowProblemSidebar(prev => !prev);
    const handleToggleChatSidebar = () => setShowChatSidebar(prev => !prev);
    const handleToggleSolutionEditor = () => {
      // This is now handled by the WorkspaceContext activeContent state
    };

    window.addEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
    window.addEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
    window.addEventListener('toggle-solution-editor', handleToggleSolutionEditor);

    return () => {
      window.removeEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
      window.removeEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
      window.removeEventListener('toggle-solution-editor', handleToggleSolutionEditor);
    };
  }, []);

  return (
    <div className="flex h-full">
      {showProblemSidebar && (
        <ProblemDetailsSidebar
          title={dummyProblem.title}
          description={dummyProblem.description}
          requirements={dummyProblem.requirements}
          constraints={dummyProblem.constraints}
          hints={dummyProblem.hints}
          tags={dummyProblem.tags}
          notes={notes}
          onNotesChange={setNotes}
        />
      )}
      <div className="flex-1 overflow-auto p-4 flex flex-col">
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden mb-4 ${
            isWorkspaceModeVisible ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isWorkspaceModeVisible && <WorkspaceModeSelector />}
        </div>
        
        <div className="flex-1 transition-all duration-300">
          {activeContent === 'solution' ? (
            <SolutionEditor 
              value={solutionContent}
              onChange={handleEditorChange} 
              key={`solution-${problemId}-${currentMode}`} 
            />
          ) : (
            <NotesCollector key={`notes-${problemId}-${currentMode}`} />
          )}
        </div>
      </div>
      {showChatSidebar && <AIChatSidebar />}
    </div>
  );
} 