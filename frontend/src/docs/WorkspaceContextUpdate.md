# WorkspaceContext Update Implementation

## Current Structure

```typescript
interface WorkspaceContextType {
  currentMode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  notes: Note[];
  addNote: (note: { content: string; tags: string[] }) => void;
  removeNote: (id: string) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
  isAIUnlocked: boolean;
  isResearchPaneOpen: boolean;
  toggleResearchPane: () => void;
}
```

## Proposed Updates

### 1. Add Content Type State

```typescript
type ContentType = 'solution' | 'notes';

interface WorkspaceContextType {
  // Existing properties...
  
  // New properties
  activeContent: ContentType;
  setActiveContent: (contentType: ContentType) => void;
  
  // UI visibility states
  isWorkspaceModeVisible: boolean;
  toggleWorkspaceModeVisibility: () => void;
}
```

### 2. Implementation Changes

```typescript
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // Existing state...
  const [currentMode, setMode] = useState<WorkspaceMode>('understand');
  const [notes, setNotes] = useState<Note[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [isResearchPaneOpen, setIsResearchPaneOpen] = useState(true);
  
  // New state
  const [activeContent, setActiveContent] = useState<ContentType>('solution');
  const [isWorkspaceModeVisible, setIsWorkspaceModeVisible] = useState(true);
  
  // Toggle functions
  const toggleWorkspaceModeVisibility = () => {
    setIsWorkspaceModeVisible(prev => !prev);
  };
  
  // Event listeners
  useEffect(() => {
    const handleSwitchContent = (e: CustomEvent) => {
      if (e.detail && (e.detail === 'solution' || e.detail === 'notes')) {
        setActiveContent(e.detail);
      } else {
        // Toggle if no specific content type is provided
        setActiveContent(prev => prev === 'solution' ? 'notes' : 'solution');
      }
    };
    
    window.addEventListener('switch-content', handleSwitchContent as EventListener);
    
    return () => {
      window.removeEventListener('switch-content', handleSwitchContent as EventListener);
    };
  }, []);
  
  // Context value
  const value: WorkspaceContextType = {
    currentMode,
    setMode,
    notes,
    addNote,
    removeNote,
    wordCount,
    setWordCount,
    isAIUnlocked: wordCount >= 100,
    isResearchPaneOpen,
    toggleResearchPane,
    
    // New properties
    activeContent,
    setActiveContent,
    isWorkspaceModeVisible,
    toggleWorkspaceModeVisibility,
  };
  
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
```

### 3. Usage Examples

```typescript
// In CrucibleWorkspaceView.tsx
const { activeContent, isWorkspaceModeVisible } = useWorkspace();

return (
  <div className="flex h-full">
    {showProblemSidebar && (
      <ProblemDetailsSidebar {...props} />
    )}
    <div className="flex-1 overflow-auto p-4 flex flex-col">
      {isWorkspaceModeVisible && (
        <WorkspaceModeSelector />
      )}
      
      {activeContent === 'solution' ? (
        <SolutionEditor onChange={handleEditorChange} key={problemId} />
      ) : (
        <NotesCollector />
      )}
    </div>
    {showChatSidebar && <AIChatSidebar />}
  </div>
);
```

```typescript
// In AppLayout.tsx
const handleToggleNotes = () => {
  window.dispatchEvent(new CustomEvent('switch-content'));
};

const handleToggleWorkspaceMode = () => {
  window.dispatchEvent(new CustomEvent('toggle-workspace-mode'));
};

// In the navigation buttons section:
<button 
  className="btn btn-ghost flex items-center gap-2" 
  onClick={handleToggleNotes} 
  title="Switch between Solution and Notes"
>
  <FileText className="w-5 h-5" />
  <span className="hidden sm:inline">
    {activeContent === 'solution' ? 'View Notes' : 'View Solution'}
  </span>
</button>

<button 
  className="btn btn-ghost flex items-center gap-2" 
  onClick={handleToggleWorkspaceMode} 
  title="Toggle Workspace Mode"
>
  <Layers className="w-5 h-5" />
  <span className="hidden sm:inline">Workspace Mode</span>
</button>
```

## Migration Steps

1. Update the WorkspaceContext interface
2. Add new state variables to the WorkspaceProvider
3. Add event listeners for content switching
4. Update the context value object
5. Update CrucibleWorkspaceView to use the new context values
6. Add new buttons to AppLayout
7. Test the integration 