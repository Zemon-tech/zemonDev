'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type WorkspaceMode = 'understand' | 'brainstorm' | 'draft' | 'review';
export type ContentType = 'solution' | 'notes';

interface Note {
  id: string;
  content: string;
  tags: string[];
  timestamp: number;
}

interface WorkspaceContextType {
  // Mode management
  currentMode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  
  // Notes management
  notes: Note[];
  addNote: (note: { content: string; tags: string[] }) => void;
  removeNote: (id: string) => void;
  
  // Content management
  wordCount: number;
  setWordCount: (count: number) => void;
  activeContent: ContentType;
  setActiveContent: (contentType: ContentType) => void;
  
  // UI visibility states
  isAIUnlocked: boolean;
  isResearchPaneOpen: boolean;
  toggleResearchPane: () => void;
  isWorkspaceModeVisible: boolean;
  toggleWorkspaceModeVisibility: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // Mode state
  const [currentMode, setMode] = useState<WorkspaceMode>('understand');
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Content state
  const [wordCount, setWordCount] = useState(0);
  const [activeContent, setActiveContent] = useState<ContentType>('solution');
  
  // UI visibility states
  const [isResearchPaneOpen, setIsResearchPaneOpen] = useState(true);
  const [isWorkspaceModeVisible, setIsWorkspaceModeVisible] = useState(true);

  // Memoize callback functions to prevent unnecessary re-renders
  const addNote = useCallback((note: { content: string; tags: string[] }) => {
    const newNote: Note = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const toggleResearchPane = useCallback(() => {
    setIsResearchPaneOpen(prev => !prev);
  }, []);
  
  const toggleWorkspaceModeVisibility = useCallback(() => {
    setIsWorkspaceModeVisible(prev => !prev);
  }, []);
  
  // Event listeners for UI control
  useEffect(() => {
    const handleSwitchContent = (e: CustomEvent) => {
      if (e.detail && (e.detail === 'solution' || e.detail === 'notes')) {
        setActiveContent(e.detail);
      } else {
        // Toggle if no specific content type is provided
        setActiveContent(prev => prev === 'solution' ? 'notes' : 'solution');
      }
    };
    
    const handleToggleWorkspaceMode = () => {
      toggleWorkspaceModeVisibility();
    };
    
    // Use proper event type casting
    window.addEventListener('switch-content', handleSwitchContent as EventListener);
    window.addEventListener('toggle-workspace-mode', handleToggleWorkspaceMode);
    
    return () => {
      window.removeEventListener('switch-content', handleSwitchContent as EventListener);
      window.removeEventListener('toggle-workspace-mode', handleToggleWorkspaceMode);
    };
  }, [toggleWorkspaceModeVisibility]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = {
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

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
} 