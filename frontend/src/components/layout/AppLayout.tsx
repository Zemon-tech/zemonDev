import { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import Sidebar from './Sidebar';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';

// Icons
import { Search, Bell, X, MessageCircle, BookOpen, FileText, StickyNote, ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useRef } from 'react';
// [ADD] Import useHotkeys for optional keyboard shortcut
import { useHotkeys } from 'react-hotkeys-hook';
import { Eye, EyeOff } from 'lucide-react'; // [ADD] For toggle icon

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
  
  // Show result page nav buttons only on result page
  const showResultPageButtons = isResultPage;
  
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

  // [ADD] Focus mode state
  const [focusMode, setFocusMode] = useState(false);
  const [navHovered, setNavHovered] = useState(false); // [ADD] For nav bar hover

  // [MODIFY] Auto-enable focus mode on CrucibleProblemPage
  useEffect(() => {
    if (isCrucibleProblemPage) {
      setFocusMode(true);
      setIsSidebarOpen(false); // Hide sidebar by default in focus mode
    } else {
      setFocusMode(false);
      setIsSidebarOpen(true);
    }
  }, [isCrucibleProblemPage, location.pathname]);

  // [OPTIONAL] Keyboard shortcut to toggle focus mode (Cmd+Shift+F)
  useHotkeys('meta+shift+f', () => {
    if (isCrucibleProblemPage) setFocusMode((prev) => !prev);
  }, [isCrucibleProblemPage]);
  
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

  // Handle navigation with username
  const handleNavigation = (path: string) => {
    navigate(`/${currentUsername}${path}`);
  };
  
  // Result page button handlers
  const handleBackToProblem = () => {
    navigate(`/${currentUsername}/crucible`);
  };
  
  const handleReattemptProblem = () => {
    // Dispatch event to trigger reattempt from ResultPage
    window.dispatchEvent(new CustomEvent('reattempt-problem'));
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
  
  // [ADD] Show nav bar if hovered in focus mode
  const shouldShowNav = !focusMode || navHovered;

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar
        isOpen={isSidebarOpen && !focusMode} // [MODIFY] Hide sidebar in focus mode
        toggleSidebar={toggleSidebar}
        currentUsername={currentUsername}
        focusMode={focusMode} // [PASS] focusMode prop for hover logic
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* [ADD] Top-edge hover zone for nav bar in focus mode */}
        {focusMode && (
          <div
            className="fixed top-0 left-0 w-full h-4 z-50 cursor-pointer"
            style={{ pointerEvents: navHovered ? 'none' : 'auto' }}
            onMouseEnter={() => setNavHovered(true)}
          />
        )}
        {/* Top Navigation - now fixed */}
        <header
          className={`fixed top-0 left-0 w-full h-14 border-b border-base-300 bg-base-100 dark:bg-base-800 flex items-center justify-between px-3 shrink-0 z-50 transition-transform duration-300`}
          style={{
            transform: shouldShowNav ? 'translateY(0)' : 'translateY(-100%)',
            opacity: shouldShowNav ? 1 : 0,
            pointerEvents: shouldShowNav ? 'auto' : 'none',
          }}
          onMouseEnter={() => focusMode && setNavHovered(true)}
          onMouseLeave={() => focusMode && setNavHovered(false)}
          tabIndex={-1}
        >
          {/* Left side - Menu toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-9 w-9 p-0 rounded-lg hover:bg-base-200/80 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/crucible')}
                className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                title="Back to Crucible"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Back to Crucible</span>
              </Button>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleProblemSidebar}
                  className="h-9 px-3 rounded-lg hover:bg-base-200/80 transition-all duration-200"
                  title="Show/Hide Problem Details"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline text-sm font-medium">Problem</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleChatSidebar}
                  className="h-9 px-3 rounded-lg hover:bg-base-200/80 transition-all duration-200"
                  title="Show/Hide AI Chat"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline text-sm font-medium">AI Chat</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSwitchContent}
                  className="h-9 px-3 rounded-lg hover:bg-base-200/80 transition-all duration-200"
                  title="Switch between Solution and Notes"
                >
                  {activeContent === 'solution' ? (
                    <>
                      <StickyNote className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline text-sm font-medium">Notes</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline text-sm font-medium">Solution</span>
                    </>
                  )}
                </Button>
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

          {/* Result Page Navigation */}
          {showResultPageButtons && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProblem}
                className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                title="Back to Problem"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Back to Problem</span>
              </Button>
              <Button
                size="sm"
                onClick={handleReattemptProblem}
                className="h-9 px-3 rounded-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-200"
                title="Reattempt Problem"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Reattempt</span>
              </Button>
            </div>
          )}

          {/* Back to Forge button (only on Forge detail page) */}
          {isForgeDetailPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/forge')}
              className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Forge</span>
            </Button>
          )}
          
          {/* Search icon and input inline in navbar */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {!isSearchOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-9 p-0 rounded-lg hover:bg-base-200/80 transition-all duration-200"
              >
                <Search size={18} />
              </Button>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="h-6 w-6 p-0 absolute right-1.5 hover:bg-base-200/80"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
          
          {/* Right side - user actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg hover:bg-base-200/80 transition-all duration-200 relative"
            >
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-error rounded-full"></span>
            </Button>
            {/* Theme switcher */}
            <ThemeSwitcher />
            {/* [MOVE] Focus mode toggle button here */}
            {isCrucibleProblemPage && (
              <button
                className="btn btn-ghost btn-xs rounded-full border border-base-300 hover:bg-base-200 transition-all ml-2"
                onClick={() => setFocusMode((prev) => !prev)}
                title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                type="button"
              >
                {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            {/* User menu */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        {/* Page Content */}
        <main
          className="flex-1 overflow-auto bg-base-100 p-0 transition-transform duration-300"
          style={{
            transform: shouldShowNav ? 'translateY(3.5rem)' : 'translateY(0)', // 3.5rem = 56px = h-14
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
} 