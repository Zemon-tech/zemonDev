import React, { useEffect } from 'react';
// TODO: Import ShadCN Drawer and Button components when installed
// import { Drawer, DrawerTrigger, DrawerContent } from 'shadcn/ui/drawer';
// import { Button } from 'shadcn/ui/button';
import ProblemDetailsSidebar from './ProblemDetailsSidebar';
import SolutionEditor from './SolutionEditor';
import AIChatSidebar from './AIChatSidebar';
import { Minimize2 } from 'lucide-react';
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
};

export default function CrucibleWorkspaceView({ problem }: Props) {
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
  const [showSolutionEditor, setShowSolutionEditor] = React.useState(true);
  // Only allow full view for problem details (but structure for future extensibility)
  const [fullyOpenPanel, setFullyOpenPanel] = React.useState<'problem' | 'solution' | 'chat' | null>('problem');

  // Listen for navbar full view event
  useEffect(() => {
    const handleToggleFullView = (e?: CustomEvent) => {
      if (e && e.detail && (e.detail === 'problem' || e.detail === 'solution' || e.detail === 'chat')) {
        setFullyOpenPanel(v => v === e.detail ? null : e.detail);
      } else {
        setFullyOpenPanel(v => v ? null : 'problem');
      }
    };
    const handleToggleProblemSidebar = () => {
      if (fullyOpenPanel) {
        setFullyOpenPanel(null);
        setShowProblemSidebar(true);
      } else {
        setShowProblemSidebar(v => !v);
      }
    };
    const handleToggleChatSidebar = () => {
      if (fullyOpenPanel) {
        setFullyOpenPanel(null);
        setShowChatSidebar(true);
      } else {
        setShowChatSidebar(v => !v);
      }
    };
    const handleToggleSolutionEditor = () => {
      if (fullyOpenPanel) {
        setFullyOpenPanel(null);
        setShowSolutionEditor(true);
      } else {
        setShowSolutionEditor(v => !v);
      }
    };
    window.addEventListener('toggle-problem-fullview', handleToggleFullView as EventListener);
    window.addEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
    window.addEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
    window.addEventListener('toggle-solution-editor', handleToggleSolutionEditor);
    return () => {
      window.removeEventListener('toggle-problem-fullview', handleToggleFullView as EventListener);
      window.removeEventListener('toggle-problem-sidebar', handleToggleProblemSidebar);
      window.removeEventListener('toggle-chat-sidebar', handleToggleChatSidebar);
      window.removeEventListener('toggle-solution-editor', handleToggleSolutionEditor);
    };
  }, [fullyOpenPanel]);

  // Keyboard accessibility: Esc to exit full view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullyOpenPanel) {
        setFullyOpenPanel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullyOpenPanel]);

  // Helper: Render Problem Sidebar (with collapse button)
  const renderProblemSidebar = (full: boolean = false) => (
    <div
      className={
        full
          ? 'w-full h-full bg-base-100 flex-shrink-0 overflow-y-auto flex flex-col'
          : 'w-[300px] min-w-[280px] max-w-[340px] h-full border-r border-base-200 bg-base-100 flex-shrink-0 overflow-y-auto flex flex-col'
      }
    >
      <div className="flex items-center justify-between p-2 border-b border-base-200 bg-base-100 sticky top-0 z-20">
        <span className="font-semibold text-base">Problem Details</span>
        <div className="flex gap-1">
          {/* Collapse/Expand button (sidebar only) */}
          {!full && (
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setShowProblemSidebar((v) => !v)}
              aria-label={showProblemSidebar ? 'Collapse Sidebar' : 'Expand Sidebar'}
              title={showProblemSidebar ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {showProblemSidebar ? '←' : '→'}
            </button>
          )}
          {/* Minimize full view button */}
          {full && (
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setFullyOpenPanel(null)}
              aria-label="Back to Workspace"
              title="Back to Workspace"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1">
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
    </div>
  );

  // Helper: Render Solution Editor full view (future extensibility)
  const renderSolutionEditorFull = () => (
    <div className="w-full h-full flex flex-col bg-white">
      <SolutionEditor />
    </div>
  );

  // Helper: Render AI Chat Sidebar full view (future extensibility)
  const renderAIChatSidebarFull = () => (
    <div className="w-full h-full flex flex-col bg-base-100">
      <AIChatSidebar />
    </div>
  );

  // Layout logic
  if (fullyOpenPanel) {
    return (
      <div className="w-full" style={{ height: 'calc(100vh - 4rem)', marginTop: '0', overflow: 'hidden', display: 'flex' }}>
        {fullyOpenPanel === 'problem' && renderProblemSidebar(true)}
        {fullyOpenPanel === 'solution' && renderSolutionEditorFull()}
        {fullyOpenPanel === 'chat' && renderAIChatSidebarFull()}
      </div>
    );
  }

  // Default split layout
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-row bg-base-200 overflow-hidden" style={{marginTop: 0}}>
      {/* Problem Details Sidebar (collapsible) */}
      {showProblemSidebar && renderProblemSidebar(false)}
      {/* Center Notion-style Editor Placeholder */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Notion-style Editor */}
          {showSolutionEditor && (
            <div className="flex-1 min-h-0 overflow-auto">
              <SolutionEditor />
            </div>
          )}
        </div>
      </div>
      {/* AI Chat Sidebar (collapsible, always present) */}
      {showChatSidebar && (
        <div className="w-[300px] min-w-[280px] max-w-[340px] h-full border-l border-base-200 bg-base-100 flex-shrink-0 overflow-y-auto flex flex-col">
          <AIChatSidebar />
        </div>
      )}
    </div>
  );
} 