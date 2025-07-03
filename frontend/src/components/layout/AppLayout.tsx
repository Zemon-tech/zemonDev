import { useState } from 'react';
import { Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import Sidebar from './Sidebar';

// Icons
import { Search, Bell, X } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { username: urlUsername } = useParams();
  const location = useLocation();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  
  // Get the current user's username or fallback
  const currentUsername = user?.username || (user ? `user${user.id.slice(-8)}` : '');
  
  // If the user is loaded and the URL username doesn't match, redirect to the correct URL
  if (isLoaded && user && urlUsername !== currentUsername) {
    // Get the current path without the username
    const pathWithoutUsername = location.pathname.replace(/^\/[^/]+/, '');
    // Redirect to the same path but with the correct username
    return <Navigate to={`/${currentUsername}${pathWithoutUsername}`} replace />;
  }
  
  // Determine active route for highlighting in sidebar
  const isRouteActive = (route: string) => {
    return location.pathname.includes(route);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Workspace nav button handlers (to be implemented via context or events)
  const handleToggleProblemSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-problem-sidebar'));
  };
  const handleToggleChatSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-chat-sidebar'));
  };
  const handleBack = () => {
    navigate(-1);
  };
  
  // Show workspace nav buttons only on /:username/crucible/problem/:id
  const isCrucibleProblemPage = /^\/[\w-]+\/crucible\/problem\/.+/.test(location.pathname);
  
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        currentUsername={currentUsername}
        isRouteActive={isRouteActive}
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
          
          {/* Workspace nav buttons (only on problem page) */}
          {isCrucibleProblemPage && (
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost" onClick={handleBack}>
                ← Back
              </button>
              <button className="btn btn-ghost" onClick={handleToggleProblemSidebar} aria-label="Toggle Problem Details Sidebar">
                ☰ Menu
              </button>
              <button className="btn btn-ghost" onClick={handleToggleChatSidebar} aria-label="Toggle AI Chat Sidebar">
                💬 Chat
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
        <main className="flex-1 overflow-y-auto p-2 bg-base-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 