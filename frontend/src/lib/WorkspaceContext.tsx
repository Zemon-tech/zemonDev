'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ICrucibleProblem } from './crucibleApi';

export type WorkspaceMode = 'understand' | 'brainstorm' | 'draft' | 'review';
export type ContentType = 'solution' | 'notes';

interface Note {
  id: string;
  content: string;
  tags: string[];
  timestamp: number;
}

interface WorkspaceState {
  currentProblem?: ICrucibleProblem;
  wordCount?: number;
  mode?: WorkspaceMode;
  activeContent?: ContentType;
  showProblemSidebar?: boolean;
  showChatSidebar?: boolean;
  isResearchPaneOpen?: boolean;
  isWorkspaceModeVisible?: boolean;
  problemSidebarWidth?: number;
  chatSidebarWidth?: number;
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
  showProblemSidebar: boolean;
  setShowProblemSidebar: (show: boolean) => void;
  showChatSidebar: boolean;
  setShowChatSidebar: (show: boolean) => void;
  
  // Sidebar widths
  problemSidebarWidth: number;
  setProblemSidebarWidth: (width: number) => void;
  chatSidebarWidth: number;
  setChatSidebarWidth: (width: number) => void;
  
  // State management
  currentProblem?: ICrucibleProblem;
  updateWorkspaceState: (state: WorkspaceState) => void;
  loadWorkspaceState: (problemId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

// Helper function to get workspace state from localStorage
const getStoredWorkspaceState = (problemId: string): WorkspaceState | null => {
  try {
    const stored = localStorage.getItem(`workspace_state_${problemId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading workspace state from localStorage:', error);
    return null;
  }
};

// Helper function to save workspace state to localStorage
const saveWorkspaceState = (problemId: string, state: WorkspaceState) => {
  try {
    localStorage.setItem(`workspace_state_${problemId}`, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving workspace state to localStorage:', error);
  }
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // Mode state
  const [currentMode, setMode] = useState<WorkspaceMode>('understand');
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Content state
  const [wordCount, setWordCount] = useState(0);
  const [activeContent, setActiveContent] = useState<ContentType>('solution');
  
  // Problem state
  const [currentProblem, setCurrentProblem] = useState<ICrucibleProblem | undefined>(undefined);
  
  // UI visibility states
  const [isResearchPaneOpen, setIsResearchPaneOpen] = useState(true);
  const [isWorkspaceModeVisible, setIsWorkspaceModeVisible] = useState(true);
  const [showProblemSidebar, setShowProblemSidebar] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  
  // Sidebar width states
  const [problemSidebarWidth, setProblemSidebarWidth] = useState(320);
  const [chatSidebarWidth, setChatSidebarWidth] = useState(320);

  // Load workspace state for a specific problem
  const loadWorkspaceState = useCallback((problemId: string) => {
    const stored = getStoredWorkspaceState(problemId);
    if (stored) {
      if (stored.mode) setMode(stored.mode);
      if (stored.activeContent) setActiveContent(stored.activeContent);
      if (stored.showProblemSidebar !== undefined) setShowProblemSidebar(stored.showProblemSidebar);
      if (stored.showChatSidebar !== undefined) setShowChatSidebar(stored.showChatSidebar);
      if (stored.isResearchPaneOpen !== undefined) setIsResearchPaneOpen(stored.isResearchPaneOpen);
      if (stored.isWorkspaceModeVisible !== undefined) setIsWorkspaceModeVisible(stored.isWorkspaceModeVisible);
      if (stored.problemSidebarWidth !== undefined) setProblemSidebarWidth(stored.problemSidebarWidth);
      if (stored.chatSidebarWidth !== undefined) setChatSidebarWidth(stored.chatSidebarWidth);
    }
  }, []);

  // Save workspace state whenever relevant state changes
  useEffect(() => {
    if (currentProblem?._id) {
      const state: WorkspaceState = {
        mode: currentMode,
        activeContent,
        showProblemSidebar,
        showChatSidebar,
        isResearchPaneOpen,
        isWorkspaceModeVisible,
        wordCount,
        problemSidebarWidth,
        chatSidebarWidth
      };
      saveWorkspaceState(currentProblem._id, state);
    }
  }, [
    currentProblem?._id,
    currentMode,
    activeContent,
    showProblemSidebar,
    showChatSidebar,
    isResearchPaneOpen,
    isWorkspaceModeVisible,
    wordCount,
    problemSidebarWidth,
    chatSidebarWidth
  ]);

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
  
  // Update workspace state function
  const updateWorkspaceState = useCallback((state: WorkspaceState) => {
    if (state.currentProblem !== undefined) setCurrentProblem(state.currentProblem);
    if (state.wordCount !== undefined) setWordCount(state.wordCount);
    if (state.mode !== undefined) setMode(state.mode);
    if (state.activeContent !== undefined) setActiveContent(state.activeContent);
    if (state.showProblemSidebar !== undefined) setShowProblemSidebar(state.showProblemSidebar);
    if (state.showChatSidebar !== undefined) setShowChatSidebar(state.showChatSidebar);
    if (state.isResearchPaneOpen !== undefined) setIsResearchPaneOpen(state.isResearchPaneOpen);
    if (state.isWorkspaceModeVisible !== undefined) setIsWorkspaceModeVisible(state.isWorkspaceModeVisible);
    if (state.problemSidebarWidth !== undefined) setProblemSidebarWidth(state.problemSidebarWidth);
    if (state.chatSidebarWidth !== undefined) setChatSidebarWidth(state.chatSidebarWidth);
  }, []);

  // Event listeners for UI control
  useEffect(() => {
    const handleSwitchContent = (e: CustomEvent) => {
      if (e.detail && (e.detail === 'solution' || e.detail === 'notes')) {
        setActiveContent(e.detail);
      } else {
        setActiveContent(prev => prev === 'solution' ? 'notes' : 'solution');
      }
    };
    
    const handleToggleWorkspaceMode = () => {
      toggleWorkspaceModeVisibility();
    };
    
    window.addEventListener('switch-content', handleSwitchContent as EventListener);
    window.addEventListener('toggle-workspace-mode', handleToggleWorkspaceMode);
    
    return () => {
      window.removeEventListener('switch-content', handleSwitchContent as EventListener);
      window.removeEventListener('toggle-workspace-mode', handleToggleWorkspaceMode);
    };
  }, [toggleWorkspaceModeVisibility]);

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
    showProblemSidebar,
    setShowProblemSidebar,
    showChatSidebar,
    setShowChatSidebar,
    problemSidebarWidth,
    setProblemSidebarWidth,
    chatSidebarWidth,
    setChatSidebarWidth,
    currentProblem,
    updateWorkspaceState,
    loadWorkspaceState
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