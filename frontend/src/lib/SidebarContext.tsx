import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Types and interfaces
interface SidebarState {
  isOpen: boolean;
  lastUpdated: number;
  version: string;
}

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
}

// Constants
const SIDEBAR_STORAGE_KEY = 'zemon-sidebar-state';
const CURRENT_VERSION = '1.0.0';
const DEBOUNCE_DELAY = 300;

// Default state
const DEFAULT_SIDEBAR_STATE: SidebarState = {
  isOpen: true,
  lastUpdated: Date.now(),
  version: CURRENT_VERSION,
};

// Create context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
    return null;
  }
};

// Helper function to safely set localStorage
const setLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to set localStorage:', error);
  }
};

// Helper function to load sidebar state from localStorage
const loadSidebarState = (): SidebarState => {
  const stored = getLocalStorage(SIDEBAR_STORAGE_KEY);
  
  if (!stored) {
    return DEFAULT_SIDEBAR_STATE;
  }

  try {
    const parsed = JSON.parse(stored) as SidebarState;
    
    // Validate the parsed data
    if (typeof parsed.isOpen === 'boolean' && 
        typeof parsed.lastUpdated === 'number' && 
        typeof parsed.version === 'string') {
      return parsed;
    }
    
    console.warn('Invalid sidebar state format, using default');
    return DEFAULT_SIDEBAR_STATE;
  } catch (error) {
    console.warn('Failed to parse sidebar state:', error);
    return DEFAULT_SIDEBAR_STATE;
  }
};

// Helper function to save sidebar state to localStorage
const saveSidebarState = (state: SidebarState): void => {
  const stateToSave: SidebarState = {
    ...state,
    lastUpdated: Date.now(),
    version: CURRENT_VERSION,
  };
  
  setLocalStorage(SIDEBAR_STORAGE_KEY, JSON.stringify(stateToSave));
};

// Debounced save function
const createDebouncedSave = (delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (state: SidebarState) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      saveSidebarState(state);
    }, delay);
  };
};

// Provider component
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarState, setSidebarState] = useState<SidebarState>(DEFAULT_SIDEBAR_STATE);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debounced save function
  const debouncedSave = useCallback(createDebouncedSave(DEBOUNCE_DELAY), []);

  // Load initial state from localStorage
  useEffect(() => {
    const loadedState = loadSidebarState();
    setSidebarState(loadedState);
    setIsLoading(false);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      debouncedSave(sidebarState);
    }
  }, [sidebarState, debouncedSave, isLoading]);

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    setSidebarState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  // Set sidebar open/closed function
  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarState(prev => ({
      ...prev,
      isOpen: open,
    }));
  }, []);

  // Context value
  const contextValue: SidebarContextType = {
    isSidebarOpen: sidebarState.isOpen,
    toggleSidebar,
    setSidebarOpen,
    isLoading,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook to use sidebar context
export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
}

// Export types for external use
export type { SidebarState, SidebarContextType }; 