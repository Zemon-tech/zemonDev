import { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import SidebarModern from './Sidebar';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
// Icons
import { Search, Bell, X, MessageCircle, BookOpen, FileText, StickyNote, ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Eye, EyeOff } from 'lucide-react';

export default function AppLayout() {
  // Change initial state to false so sidebar is collapsed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      window.dispatchEvent(new CustomEvent('submit-solution'));
    } catch (error) {
      console.error('Failed to submit solution:', error);
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
  // Focus mode state
  const [focusMode, setFocusMode] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  // Auto-enable focus mode on CrucibleProblemPage
  useEffect(() => {
    if (isCrucibleProblemPage) {
      setFocusMode(true);
      setIsSidebarOpen(false);
    } else {
      setFocusMode(false);
      setIsSidebarOpen(true);
    }
  }, [isCrucibleProblemPage, location.pathname]);
  // Keyboard shortcut to toggle focus mode (Cmd+Shift+F)
  useHotkeys('meta+shift+f', () => {
    if (isCrucibleProblemPage) setFocusMode((prev) => !prev);
  }, [isCrucibleProblemPage]);
  // Get the current user's username or fallback
  const currentUsername = user?.username || (user ? `user${user.id.slice(-8)}` : '');
  // If the user is loaded and the URL username doesn't match, redirect to the correct URL
  if (isLoaded && user && urlUsername !== currentUsername) {
    const pathWithoutUsername = location.pathname.replace(/^\/[^/]+/, '');
    return <Navigate to={`/${currentUsername}${pathWithoutUsername}`} replace />;
  }
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
  // Show nav bar if hovered in focus mode
  const shouldShowNav = !focusMode || navHovered;

  // Example: pass live/edit state for Crucible
  let liveEditState: 'live' | 'edit' | null = null;
  if (isCrucibleProblemPage) {
    // TODO: Replace with actual logic to determine live/edit state
    liveEditState = 'edit';
  }

  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - Desktop & Mobile */}
      <SidebarModern
        isOpen={isSidebarOpen && !focusMode}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        currentUsername={currentUsername}
        focusMode={focusMode}
        liveEditState={liveEditState}
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
        {/* Top Navigation */}
        <header
          className={`h-14 border-b border-base-300 bg-base-100 dark:bg-base-800 flex items-center justify-between px-3 shrink-0 transition-transform duration-300 z-50 ${shouldShowNav ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}
          onMouseEnter={() => focusMode && setNavHovered(true)}
          onMouseLeave={() => focusMode && setNavHovered(false)}
          tabIndex={-1}
        >
          {/* Left side - Menu toggle (REMOVED, now handled in sidebar) */}
          <div className="flex items-center gap-4">
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
            {/* Edit indicator for Crucible edit mode (REMOVED as requested) */}
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
            {/* Focus mode toggle button */}
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
        <main className="flex-1 overflow-auto bg-base-100 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 