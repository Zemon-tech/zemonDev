import { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import Sidebar from './Sidebar';
import { useWorkspace } from '@/lib/WorkspaceContext';

// Icons
import { Search, Bell, X, Hammer, MessageCircle, Maximize2, BookOpen, Beaker, FileText, Layers, StickyNote } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { username: urlUsername } = useParams();
  const location = useLocation();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  // Show workspace nav buttons only on /:username/crucible/problem/:id
  const isCrucibleProblemPage = /^\/[\w-]+\/crucible\/problem\/.+/.test(location.pathname);
  
  // Only use workspace context when on a problem page to avoid the error
  const workspaceContext = isCrucibleProblemPage ? useWorkspace() : { activeContent: 'solution' };
  const { activeContent } = workspaceContext;
  
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
  
  // Add handler for full view
  const handleToggleProblemFullView = () => {
    if (isCrucibleProblemPage) {
      window.dispatchEvent(new CustomEvent('toggle-problem-fullview'));
    }
  };

  // Handle navigation with username
  const handleNavigation = (path: string) => {
    navigate(`/${currentUsername}${path}`);
  };
  
  // Show back to forge only on /:username/forge/:id
  const isForgeDetailPage = /^\/[\w-]+\/forge\/[\w-]+$/.test(location.pathname);
  
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
        <header className="h-16 border-b border-base-300 bg-base-100 flex items-center justify-between px-4">
          {/* Left side - Mobile menu toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleSidebar}
              className="btn btn-ghost btn-circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          
          {/* Back to Forge button (only on Forge detail page) */}
          {isForgeDetailPage && (
            <button
              className="btn btn-ghost text-primary font-semibold flex items-center gap-2"
              onClick={() => handleNavigation('/forge')}
            >
              <Hammer className="w-5 h-5" />
              Back to Forge
            </button>
          )}
          
          {/* Workspace nav buttons (only on problem page) */}
          {isCrucibleProblemPage && (
            <div className="flex items-center gap-3">
              <button 
                className="btn btn-ghost text-primary font-semibold flex items-center gap-2" 
                onClick={() => handleNavigation('/crucible')} 
                title="Back to Crucible"
              >
                <Beaker className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Crucible</span>
              </button>
              <button 
                className="btn btn-ghost flex items-center gap-2" 
                onClick={handleToggleProblemSidebar} 
                title="Show/Hide Problem Details"
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">Problem Details</span>
              </button>
              <button 
                className="btn btn-ghost flex items-center gap-2" 
                onClick={handleToggleChatSidebar} 
                title="Show/Hide AI Chat"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">AI Chat</span>
              </button>
              <button 
                className="btn btn-ghost flex items-center gap-2" 
                onClick={handleSwitchContent} 
                title="Switch between Solution and Notes"
              >
                {activeContent === 'solution' ? (
                  <>
                    <StickyNote className="w-5 h-5" />
                    <span className="hidden sm:inline">View Notes</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span className="hidden sm:inline">View Solution</span>
                  </>
                )}
              </button>
              <button 
                className="btn btn-ghost flex items-center gap-2" 
                onClick={handleToggleWorkspaceMode} 
                title="Toggle Workspace Mode"
              >
                <Layers className="w-5 h-5" />
                <span className="hidden sm:inline">Workspace Mode</span>
              </button>
              <button 
                className="btn btn-ghost flex items-center gap-2" 
                onClick={handleToggleProblemFullView} 
                title="Full View Problem Details"
              >
                <Maximize2 className="w-5 h-5" />
                <span className="hidden sm:inline">Full View</span>
              </button>
            </div>
          )}
          
          {/* Search icon and input inline in navbar */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {!isSearchOpen && (
              <button className="btn btn-ghost btn-circle" onClick={() => setIsSearchOpen(true)}>
                <Search size={20} />
              </button>
            )}
            {isSearchOpen && (
              <div className="relative flex items-center w-full max-w-xs">
                <Search className="w-5 h-5 absolute left-3 text-base-content/60" />
                <input
                  autoFocus
                  type="text"
                  className="input input-bordered input-md w-full pl-10 pr-8"
                  placeholder="Search..."
                />
                <button className="btn btn-ghost btn-xs absolute right-1.5" onClick={() => setIsSearchOpen(false)}><X size={18} /></button>
              </div>
            )}
          </div>
          
          {/* Right side - user actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="btn btn-ghost btn-circle relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            
            {/* Theme switcher */}
            <ThemeSwitcher />
            
            {/* User menu */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-hidden h-screen bg-base-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 