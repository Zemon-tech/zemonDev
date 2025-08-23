import { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Sidebar from './Sidebar';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useSidebar } from '@/lib/SidebarContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu';
import { useArenaChannels, Channel as ArenaChannel } from '@/hooks/useArenaChannels';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';
import { useNotification } from '@/hooks/useNotification';
import Toaster from '@/components/ui/toast';
import { useForge } from '@/context/ForgeContext';
import UserSearch from '@/components/ui/UserSearch';

// Icons
import { MessageCircle, BookOpen, FileText, StickyNote, ArrowLeft, Send, Loader2, Sparkles, Hash, Volume2, Star, MessageSquare, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useRef } from 'react';
// [ADD] Import useHotkeys for optional keyboard shortcut
import { useHotkeys } from 'react-hotkeys-hook';
import { Eye, EyeOff } from 'lucide-react'; // [ADD] For toggle icon
import { Lock, Unlock } from 'lucide-react'; // [ADD] For nav lock button icon

export default function AppLayout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { username: urlUsername } = useParams();
  const location = useLocation();
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();
  
  // Notifications
  const { toasterRef } = useNotification();
  
  // Forge context
  const { currentForgeTitle } = useForge();
  
  // Arena channels data
  const { channels: arenaChannels, loading: arenaChannelsLoading } = useArenaChannels();
  
  // Helper function to get channel icon
  const getChannelIcon = (channel: ArenaChannel) => {
    switch (channel.type) {
      case 'info':
        return <Hash className="w-4 h-4" />;
      case 'announcement':
        return <Volume2 className="w-4 h-4" />;
      case 'showcase':
        return <Star className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  // Helper function to build channel tree
  const buildChannelTree = (channelList: ArenaChannel[]) => {
    const parents = channelList.filter(c => !c.parentChannelId);
    const children = channelList.filter(c => c.parentChannelId);
    const childMap: Record<string, ArenaChannel[]> = {};
    children.forEach(child => {
      if (!child.parentChannelId) return;
      if (!childMap[child.parentChannelId]) childMap[child.parentChannelId] = [];
      childMap[child.parentChannelId].push(child);
    });
    return parents.map(parent => ({
      parent,
      children: childMap[parent._id] || []
    }));
  };

  // Handle arena channel navigation
  const handleArenaChannelSelect = (channelId: string) => {
    // Dispatch event to ArenaPage to switch to the selected channel
    window.dispatchEvent(new CustomEvent('arena-channel-select', { detail: { channelId } }));
  };

  // Handle Nirvana navigation (special case)
  const handleNirvanaSelect = () => {
    // Dispatch event to ArenaPage to show Nirvana
    window.dispatchEvent(new CustomEvent('arena-show-nirvana'));
  };

  // Always call useWorkspace to maintain hook order consistency
  const workspaceContext = useWorkspace();
  
  // Use sidebar context instead of local state
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  
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
  
  // [MODIFY] Focus mode state - respect persisted sidebar state
  const [focusMode, setFocusMode] = useState(false);
  const [navHovered, setNavHovered] = useState(false); // [ADD] For nav bar hover
  const [navLockedOpen, setNavLockedOpen] = useState(false); // [ADD] Nav lock state

  // [MODIFY] Auto-enable focus mode on CrucibleProblemPage - but don't force sidebar state
  useEffect(() => {
    if (isCrucibleProblemPage) {
      setFocusMode(true);
      // Don't force sidebar to close - let user's persisted preference remain
    } else {
      setFocusMode(false);
      // Don't force sidebar to open - let user's persisted preference remain
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
  
  // toggleSidebar is now provided by the SidebarContext
  
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
  
  // [MODIFY] Show nav bar if not in focus mode, or if navHovered, or if navLockedOpen
  const shouldShowNav = !focusMode || navHovered || navLockedOpen;
  
  // [ADD] Calculate sidebar width for layout adjustments
  const getSidebarWidth = () => {
    if (focusMode) {
      return 0; // Sidebar is hidden in focus mode
    }
    return isSidebarOpen ? 224 : 80; // w-56 = 224px, w-20 = 80px
  };
  
  const sidebarWidth = getSidebarWidth();

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
        {focusMode && !navLockedOpen && (
          <div
            className="fixed top-0 left-0 w-full h-4 z-50 cursor-pointer"
            style={{ pointerEvents: navHovered ? 'none' : 'auto' }}
            onMouseEnter={() => setNavHovered(true)}
          />
        )}
        {/* Top Navigation - now fixed with sidebar offset */}
        <header
          className={`fixed top-0 left-0 w-full h-14 border-b border-base-300 bg-base-100 dark:bg-base-800 flex items-center justify-between shrink-0 z-40 transition-all duration-300`}
          style={{
            transform: shouldShowNav ? 'translateY(0)' : 'translateY(-100%)',
            left: `${sidebarWidth}px`,
            width: `calc(100vw - ${sidebarWidth}px)`,
            opacity: shouldShowNav ? 1 : 0,
            pointerEvents: shouldShowNav ? 'auto' : 'none',
            paddingLeft: '12px',
            paddingRight: '20px',
          }}
          onMouseEnter={() => focusMode && setNavHovered(true)}
          onMouseLeave={() => focusMode && !navLockedOpen && setNavHovered(false)}
          tabIndex={-1}
        >
          {/* Left side - Menu toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-9 w-9 p-0 rounded-lg hover:bg-base-200 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Button>
          </div>

          {/* Center area - Workspace nav, Result page buttons, or Forge accent bar */}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleProblemSidebar}
                className="h-9 px-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                title="Show/Hide Problem Details"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Problem</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleChatSidebar}
                className="h-9 px-3 rounded-lg hover:bg-base-200 transition-all duration-200"
                title="Show/Hide AI Chat"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI Chat</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwitchContent}
                className="h-9 px-3 rounded-lg hover:bg-base-200 transition-all duration-200"
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
              {/* Submit Button - Only show on problem page */}
              {showSubmitButton && (
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-tr from-primary to-accent hover:opacity-90 ml-4"
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
          ) : showResultPageButtons ? (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProblem}
                className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                title="Back to Crucible"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Back to Crucible</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReattemptProblem}
                className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                title="Reattempt Problem"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Reattempt Problem</span>
              </Button>
            </div>
          ) : isArenaPage ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Nirvana Channel */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNirvanaSelect}
                className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                title="Nirvana"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Nirvana</span>
              </Button>
              
              {/* Parent Channels with Dropdowns */}
              {!arenaChannelsLoading && Object.entries(arenaChannels).map(([, channelList]) => {
                const channelTree = buildChannelTree(channelList);
                return channelTree.map(({ parent, children }) => (
                  <DropdownMenu
                    key={parent._id}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                      >
                        {getChannelIcon(parent)}
                        <span className="hidden sm:inline text-sm font-medium ml-2">
                          {parent.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    }
                  >
                    {/* Parent channel item */}
                    <DropdownItem
                      onClick={() => handleArenaChannelSelect(parent._id)}
                      icon={getChannelIcon(parent)}
                    >
                      {parent.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </DropdownItem>
                    
                    {/* Child channels */}
                    {children.map(child => (
                      <DropdownItem
                        key={child._id}
                        onClick={() => handleArenaChannelSelect(child._id)}
                        icon={getChannelIcon(child)}
                        className="pl-6"
                      >
                        {child.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                ));
              })}
              

            </div>
          ) : null}

          {/* Back to Forge button (only on Forge detail page) */}
          {isForgeDetailPage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/forge')}
                className="h-9 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Back to Forge</span>
              </Button>
              
              {/* Forge Title */}
              {currentForgeTitle && (
                <div className="flex items-center ml-4">
                  <span className="text-lg font-semibold text-base-content truncate max-w-md">
                    {currentForgeTitle}
                  </span>
                </div>
              )}
            </>
          )}
          
          {/* User Search */}
          <div className="flex-1 flex justify-end items-center gap-2">
            <UserSearch 
              placeholder="Search users..."
              className="max-w-xs"
            />
          </div>
          
          {/* Right side - user actions */}
          <div className="flex items-center space-x-3 mr-4 relative z-50">
            {/* Notifications */}
            <NotificationPopover className="h-9 w-9" toasterRef={toasterRef} />
            {/* [ADD] Nav lock button - only on Crucible Problem Page in focus mode */}
            {isCrucibleProblemPage && focusMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNavLockedOpen((prev) => !prev)}
                className="h-9 w-9 p-0 rounded-lg hover:bg-base-200 transition-all duration-200"
                title={navLockedOpen ? 'Unlock Navigation Bar (auto-hide)' : 'Lock Navigation Bar Open'}
              >
                {navLockedOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
            )}
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
            {/* User menu - Removed Clerk avatar */}
            {/* <UserButton afterSignOutUrl="/" /> */}
          </div>
        </header>
        
        {/* Page Content */}
        <main
          className="overflow-auto bg-base-100 p-0 transition-all duration-300 absolute"
          style={{
            top: shouldShowNav ? '3.5rem' : '0',
            left: `${sidebarWidth}px`,
            width: `calc(100vw - ${sidebarWidth}px)`,
            height: shouldShowNav ? 'calc(100vh - 3.5rem)' : '100vh',
          }}
        >
          <Outlet />
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster ref={toasterRef} />
    </div>
  );
}