import React from 'react';
import { useParams } from 'react-router-dom';
import ProblemDetailsSidebar from '../components/crucible/ProblemDetailsSidebar';
import SolutionEditor from '../components/crucible/SolutionEditor';
import AIChatSidebar from '../components/crucible/AIChatSidebar';

// Dummy data for now
const dummyProblems = [
  {
    id: '1',
    title: 'Design a URL Shortener (like bit.ly)',
    description: 'Build a scalable service to shorten URLs, handle redirects, and track analytics. Consider database schema, unique code generation, and high availability.',
    difficulty: 'easy',
    tags: ['database', 'api', 'scaling', 'backend'],
  },
  // ... add more as needed
];

export default function CrucibleProblemPage() {
  const { id } = useParams();
  const problem = dummyProblems.find(p => p.id === id);

  // Dummy placeholders for requirements, constraints, hints
  const requirements = [
    'System must handle 10k requests/sec',
    'Shortened URLs should not collide',
  ];
  const constraints = [
    'No third-party URL shortening services',
    'Must use a relational database',
  ];
  const hints = [
    'Think about hash functions for code generation',
    'Consider how to handle analytics efficiently',
  ];
  const [notes, setNotes] = React.useState('');
  const [showProblemSidebar, setShowProblemSidebar] = React.useState(true);
  const [showChatSidebar, setShowChatSidebar] = React.useState(false);

  React.useEffect(() => {
    const handleToggleProblemSidebar = () => setShowProblemSidebar(v => !v);
    const handleToggleChatSidebar = () => setShowChatSidebar(v => !v);
    window.addEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
    window.addEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
    return () => {
      window.removeEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
      window.removeEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
    };
  }, []);

  if (!problem) {
    return <div className="flex items-center justify-center h-screen">Problem not found.</div>;
  }

  return (
    <div className="w-full h-[90vh] flex flex-row bg-base-200 overflow-hidden">
      {/* Problem Details Sidebar (collapsible) */}
      {showProblemSidebar && (
        <div className="w-[300px] min-w-[280px] max-w-[340px] h-full bg-base-100 flex-shrink-0 overflow-y-auto">
          <ProblemDetailsSidebar
            title={problem.title}
            description={problem.description}
            requirements={requirements}
            constraints={constraints}
            hints={hints}
            tags={problem.tags}
            notes={notes}
            onNotesChange={setNotes}
          />
        </div>
      )}
      {/* Center Notion-style Editor */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-lg min-h-0 h-full flex flex-col">
            <SolutionEditor />
          </div>
        </div>
      </div>
      {/* AI Chat Sidebar (collapsible) */}
      {showChatSidebar && (
        <div className="w-[300px] min-w-[280px] max-w-[340px] h-full border-l border-base-200 bg-base-100 flex-shrink-0 overflow-y-auto flex flex-col">
          <AIChatSidebar />
        </div>
      )}
    </div>
  );
} 