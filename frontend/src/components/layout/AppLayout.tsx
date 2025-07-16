import { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import Sidebar from './Sidebar';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';

// Icons
import { Search, Bell, X, MessageCircle, BookOpen, FileText, Layers, StickyNote, ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useRef } from 'react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { username: urlUsername } = useParams();
  const location = useLocation();
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();
  
  // Always call useWorkspace to maintain hook order consistency
  const workspaceContext = useWorkspace();
  
  // Show workspace nav buttons only on /:username/crucible/problem/:id
  const isCrucibleProblemPage = /^\/[\w-]+\/crucible\/problem\/.+/.test(location.pathname);
  const isResultPage = location.pathname.includes('/result');
  
  // Show arena nav buttons only on /:username/arena
  const isArenaPage = /^\/[\w-]+\/arena$/.test(location.pathname);
  
  // Only show submit button on problem page, not on result page
  const showSubmitButton = isCrucibleProblemPage && !isResultPage;
  
  // Only use workspace context values when on a problem page
  const activeContent = isCrucibleProblemPage ? workspaceContext.activeContent : 'solution';

  // Handle solution submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Dispatch the submit-solution event
      window.dispatchEvent(new CustomEvent('submit-solution'));
      
      // We don't need to navigate here as the CrucibleWorkspaceView will handle the navigation
    } catch (error) {
      console.error('Failed to submit solution:', error);
      // Show error message
      alert('Failed to submit solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-close sidebar when entering a problem page
  useEffect(() => {
    if (isCrucibleProblemPage) {
      setIsSidebarOpen(false);
    }
  }, [isCrucibleProblemPage, location.pathname]);
  
  // Get the current user's username or fallback
  const currentUsername = user?.username || (user ? `user${user.id.slice(-8)}` : '');
  
  // If the user is loaded and the URL username doesn't match, redirect to the correct URL
  if (isLoaded && user && urlUsername !== currentUsername) {
    // Get the current path without the username
    const pathWithoutUsername = location.pathname.replace(/^\/[^/]+/, '');
    // Redirect to the same path but with the correct username
    return <Navigate to={`/${currentUsername}${pathWithoutUsername}`} replace />;
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Workspace nav button handlers
  const handleToggleProblemSidebar = () => {
    if (isCrucibleProblemPage) {
      window.dispatchEvent(new CustomEvent('toggle-problem-sidebar'));
    }
  };
  
  const handleToggleChatSidebar = () => {
    if (isCrucibleProblemPage) {
      window.dispatchEvent(new CustomEvent('toggle-chat-sidebar'));
    }
  };
  
  const handleSwitchContent = () => {
    if (isCrucibleProblemPage) {
      window.dispatchEvent(new CustomEvent('switch-content'));
    }
  };
  
  const handleToggleWorkspaceMode = () => {
    if (isCrucibleProblemPage) {
      window.dispatchEvent(new CustomEvent('toggle-workspace-mode'));
    }
  };

  // Handle navigation with username
  const handleNavigation = (path: string) => {
    navigate(`/${currentUsername}${path}`);
  };
  
  // Show back to forge only on /:username/forge/:id
  const isForgeDetailPage = /^\/[\w-]+\/forge\/[\w-]+$/.test(location.pathname);
  
  // Detect if on Forge page (not detail)
  const isForgePage = /^\/[\w-]+\/forge$/.test(location.pathname);

  // GSAP animation for accent bar
  const accentRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (isForgePage && accentRef.current) {
      gsap.fromTo(
        accentRef.current.querySelector('svg'),
        { scale: 1, rotate: 0, filter: 'drop-shadow(0 0 0px #fbbf24)' },
        {
          scale: 1.18,
          rotate: 8,
          filter: 'drop-shadow(0 0 8px #fbbf24)',
          yoyo: true,
          repeat: -1,
          duration: 1.2,
          ease: 'power1.inOut',
          yoyoEase: true,
        }
      );
    }
    return () => {
      if (accentRef.current) gsap.killTweensOf(accentRef.current.querySelector('svg'));
    };
  }, [isForgePage]);
  
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        currentUsername={currentUsername}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 border-b border-base-300 bg-base-100 dark:bg-base-800 flex items-center justify-between px-3 shrink-0">
          {/* Left side - Menu toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            {/* Submit Button - Only show on problem page */}
            {showSubmitButton && (
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-tr from-primary to-accent hover:opacity-90"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Solution
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Center area - Workspace nav or Forge accent bar */}
          {isCrucibleProblemPage ? (
            <div className="hidden md:flex items-center gap-2">
              <button 
                className="btn btn-ghost btn-sm text-primary font-medium flex items-center gap-1.5 mr-2" 
                onClick={() => handleNavigation('/crucible')} 
                title="Back to Crucible"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Crucible</span>
              </button>
              <div className="flex items-center border-l border-base-200 dark:border-base-700 pl-2 gap-1">
                <button 
                  className="btn btn-sm btn-ghost rounded-md px-2 text-base-content/80 hover:text-base-content" 
                  onClick={handleToggleProblemSidebar} 
                  title="Show/Hide Problem Details"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Problem</span>
                </button>
                <button 
                  className="btn btn-sm btn-ghost rounded-md px-2 text-base-content/80 hover:text-base-content" 
                  onClick={handleToggleChatSidebar} 
                  title="Show/Hide AI Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">AI Chat</span>
                </button>
                <button 
                  className="btn btn-sm btn-ghost rounded-md px-2 text-base-content/80 hover:text-base-content" 
                  onClick={handleSwitchContent} 
                  title="Switch between Solution and Notes"
                >
                  {activeContent === 'solution' ? (
                    <>
                      <StickyNote className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1 text-xs">Notes</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1 text-xs">Solution</span>
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-sm btn-ghost rounded-md px-2 text-base-content/80 hover:text-base-content" 
                  onClick={handleToggleWorkspaceMode} 
                  title="Toggle Workspace Mode"
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Mode</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Arena Navigation */}
          {isArenaPage && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-4">
                {/* Removed chat/leaderboard/showcase buttons */}
              </div>
            </div>
          )}

          {/* Back to Forge button (only on Forge detail page) */}
          {isForgeDetailPage && (
            <button
              className="btn btn-ghost btn-sm text-primary font-medium flex items-center gap-1.5"
              onClick={() => handleNavigation('/forge')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forge
            </button>
          )}
          
          {/* Search icon and input inline in navbar */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {!isSearchOpen && (
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setIsSearchOpen(true)}>
                <Search size={18} />
              </button>
            )}
            {isSearchOpen && (
              <div className="relative flex items-center w-full max-w-xs">
                <Search className="w-4 h-4 absolute left-3 text-base-content/60" />
                <input
                  autoFocus
                  type="text"
                  className="input input-sm input-bordered w-full pl-9 pr-8"
                  placeholder="Search..."
                />
                <button className="btn btn-ghost btn-xs absolute right-1.5" onClick={() => setIsSearchOpen(false)}><X size={16} /></button>
              </div>
            )}
          </div>
          
          {/* Right side - user actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="btn btn-ghost btn-sm btn-circle relative">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-error rounded-full"></span>
            </button>
            
            {/* Theme switcher */}
            <ThemeSwitcher />
            
            {/* User menu */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-base-100 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 