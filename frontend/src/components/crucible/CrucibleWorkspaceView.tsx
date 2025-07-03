import React from 'react';
// TODO: Import ShadCN Drawer and Button components when installed
// import { Drawer, DrawerTrigger, DrawerContent } from 'shadcn/ui/drawer';
// import { Button } from 'shadcn/ui/button';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import SolutionEditor from './SolutionEditor';
import AIChatSidebar from './AIChatSidebar';
// Define Problem type locally (copy from ProblemCard)
type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
};

type Props = {
  problem: Problem;
  onBack: () => void;
};

export default function CrucibleWorkspaceView({ problem, onBack }: Props) {
  // Dummy placeholders for requirements, constraints, hints, and solution
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

  // Sidebar toggles
  const [showProblemSidebar, setShowProblemSidebar] = React.useState(true);
  const [showChatSidebar, setShowChatSidebar] = React.useState(false);

  return (
    <div className="w-full h-screen flex flex-row bg-base-200 overflow-hidden">
      {/* Problem Details Sidebar (collapsible) */}
      {showProblemSidebar && (
        <div className="w-[300px] min-w-[280px] max-w-[340px] h-full border-r border-base-200 bg-base-100 flex-shrink-0 overflow-y-auto">
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
      {/* Center Notion-style Editor Placeholder */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 mb-2">
            <button className="btn btn-ghost" onClick={onBack}>
            ← Back to Browse
          </button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowProblemSidebar((v) => !v)}
              aria-label="Toggle Problem Details Sidebar"
            >
              ☰ Menu
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowChatSidebar((v) => !v)}
              aria-label="Toggle AI Chat Sidebar"
            >
              💬 Chat
            </button>
          </div>
          {/* Notion-style Editor */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-auto border border-base-300 min-h-[400px]">
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