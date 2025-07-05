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
  const [isCompact, setIsCompact] = React.useState(window.innerWidth < 768);
  
  // Update compact mode on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  const nextMode = getNextValidMode(currentMode);

  return (
    <div className="bg-base-100 dark:bg-base-800 border-b border-base-200 dark:border-base-700 mb-2">
      {/* Tab Strip */}
      <div className="flex w-full">
        {(Object.entries(modeInfo) as [WorkspaceMode, ModeInfo][]).map(([mode, info]) => {
          const isActive = mode === currentMode;
          const Icon = info.icon;
          const isDisabled = !isValidModeTransition(mode);
          const isNext = nextMode === mode && !isActive;
          
          return (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              disabled={isDisabled}
              className={`
                flex items-center gap-1 py-1 px-2 transition-all flex-1 relative
                ${isActive 
                  ? 'text-primary border-b-2 border-primary font-medium' 
                  : isDisabled
                    ? 'text-base-content/30 dark:text-base-content/20 cursor-not-allowed'
                    : 'text-base-content/70 dark:text-base-content/60 hover:bg-base-200 dark:hover:bg-base-700'
                }
                ${isNext ? 'bg-primary/5 dark:bg-primary/10' : ''}
              `}
              title={info.description}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : isDisabled ? 'text-base-content/30 dark:text-base-content/20' : 'text-base-content/70 dark:text-base-content/60'}`} />
              {!isCompact && (
                <span className="text-sm truncate">{info.title}</span>
              )}
              {isNext && !isCompact && (
                <ChevronRight size={12} className="text-primary ml-auto" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Status Indicator */}
      <div className="text-xs text-base-content/60 dark:text-base-content/50 px-2 py-1 flex items-center justify-between">
        <span>
          {currentMode !== 'review' 
            ? `Current: ${modeInfo[currentMode].title} → Next: ${modeInfo[nextMode].title}`
            : `Current: ${modeInfo[currentMode].title} (Final step)`
          }
        </span>
        <button 
          onClick={() => setIsCompact(!isCompact)} 
          className="text-xs text-base-content/50 hover:text-primary"
        >
          {isCompact ? 'Show Labels' : 'Hide Labels'}
        </button>
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