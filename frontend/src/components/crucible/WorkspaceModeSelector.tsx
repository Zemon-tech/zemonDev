import React from 'react';
import { useWorkspace, type WorkspaceMode } from '../../lib/WorkspaceContext';
import { BookOpen, Lightbulb, PenTool, CheckCircle, ChevronRight } from 'lucide-react';

interface ModeInfo {
  icon: React.ElementType;
  title: string;
  description: string;
}

const modeInfo: Record<WorkspaceMode, ModeInfo> = {
  understand: {
    icon: BookOpen,
    title: 'Understand',
    description: 'Read and analyze the problem, take notes on key points',
  },
  brainstorm: {
    icon: Lightbulb,
    title: 'Brainstorm',
    description: 'Generate ideas and explore possible solutions',
  },
  draft: {
    icon: PenTool,
    title: 'Draft',
    description: 'Write your solution following the outline',
  },
  review: {
    icon: CheckCircle,
    title: 'Review',
    description: 'Review and refine your solution',
  },
};

export default function WorkspaceModeSelector() {
  const { currentMode, setMode } = useWorkspace();
  
  // Helper function to determine if a mode transition is valid
  const isValidModeTransition = (targetMode: WorkspaceMode): boolean => {
    const modeOrder: WorkspaceMode[] = ['understand', 'brainstorm', 'draft', 'review'];
    const currentIndex = modeOrder.indexOf(currentMode);
    const targetIndex = modeOrder.indexOf(targetMode);
    
    // Can always go back to previous modes
    if (targetIndex <= currentIndex) return true;
    
    // Can only advance to the next mode
    return targetIndex === currentIndex + 1;
  };

  // Handle mode change with confirmation if needed
  const handleModeChange = (mode: WorkspaceMode) => {
    if (isValidModeTransition(mode)) {
      setMode(mode);
    } else {
      // For now, just log that the transition is not valid
      console.log(`Cannot transition from ${currentMode} to ${mode}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <h2 className="text-lg font-semibold mb-2">Workspace Mode</h2>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(modeInfo) as [WorkspaceMode, ModeInfo][]).map(([mode, info]) => {
          const isActive = mode === currentMode;
          const Icon = info.icon;
          const isDisabled = !isValidModeTransition(mode);
          const isNext = getNextValidMode(currentMode) === mode;
          
          return (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              disabled={isDisabled}
              className={`
                flex items-center gap-2 p-2 rounded-lg transition-all flex-1 min-w-[120px] relative
                ${isActive 
                  ? 'bg-primary/10 text-primary border-primary' 
                  : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                }
                ${isNext ? 'ring-1 ring-primary/30' : ''}
                ${mode === 'understand' ? 'border-b-2' : 'border-b-2 border-transparent'}
                ${mode === 'brainstorm' && currentMode === 'understand' ? 'border-b-2 border-gray-300' : ''}
                ${mode === 'draft' && ['understand', 'brainstorm'].includes(currentMode) ? 'border-b-2 border-gray-300' : ''}
                ${mode === 'review' && ['understand', 'brainstorm', 'draft'].includes(currentMode) ? 'border-b-2 border-gray-300' : ''}
              `}
            >
              {isNext && (
                <div className="absolute -right-1 -top-1 bg-primary text-white rounded-full p-0.5">
                  <ChevronRight size={12} />
                </div>
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : isDisabled ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className="flex flex-col items-start">
                <span className="font-medium">{info.title}</span>
                <span className="text-xs text-gray-500 hidden md:inline">{info.description}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
        <span>Current: {modeInfo[currentMode].title}</span>
        {currentMode !== 'review' && (
          <span>
            Next: {modeInfo[getNextValidMode(currentMode)].title}
          </span>
        )}
      </div>
    </div>
  );
}

// Helper function to get the next valid mode
function getNextValidMode(currentMode: WorkspaceMode): WorkspaceMode {
  const modeOrder: WorkspaceMode[] = ['understand', 'brainstorm', 'draft', 'review'];
  const currentIndex = modeOrder.indexOf(currentMode);
  
  // If we're at the last mode, return the current mode
  if (currentIndex === modeOrder.length - 1) {
    return currentMode;
  }
  
  // Otherwise, return the next mode
  return modeOrder[currentIndex + 1] as WorkspaceMode;
} 