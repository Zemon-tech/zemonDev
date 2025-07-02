import { useState } from 'react';
import { Link, Outlet, useParams, useLocation, Navigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

// Icons
import { 
  Home, 
  Settings, 
  User, 
  Hammer, 
  Beaker, 
  Swords, 
  Search, 
  Bell, 
  Menu, 
  X 
} from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { username: urlUsername } = useParams();
  const location = useLocation();
  const { user, isLoaded } = useUser();
  
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
  
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar - Desktop & Mobile */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        bg-base-200 border-r border-base-300 w-64 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-base-300">
          <Link to={`/${currentUsername}/dashboard`} className="text-xl font-bold text-primary font-heading">
            ZEMON
          </Link>
          <button 
            className="md:hidden text-base-content hover:text-primary" 
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            <li>
              <Link 
                to={`/${currentUsername}/dashboard`}
                className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                  isRouteActive('dashboard') 
                    ? 'active bg-primary text-primary-content' 
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
                }`}
              >
                <Home className="mr-3" size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to={`/${currentUsername}/forge`}
                className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                  isRouteActive('forge') 
                    ? 'active bg-primary text-primary-content' 
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
                }`}
              >
                <Hammer className="mr-3" size={20} />
                <span>Forge</span>
              </Link>
            </li>
            <li>
              <Link 
                to={`/${currentUsername}/crucible`}
                className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                  isRouteActive('crucible') 
                    ? 'active bg-primary text-primary-content' 
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
                }`}
              >
                <Beaker className="mr-3" size={20} />
                <span>Crucible</span>
              </Link>
            </li>
            <li>
              <Link 
                to={`/${currentUsername}/arena`}
                className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                  isRouteActive('arena') 
                    ? 'active bg-primary text-primary-content' 
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
                }`}
              >
                <Swords className="mr-3" size={20} />
                <span>Arena</span>
              </Link>
            </li>
            <li>
              <Link 
                to={`/${currentUsername}/profile`}
                className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                  isRouteActive('profile') 
                    ? 'active bg-primary text-primary-content' 
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
                }`}
              >
                <User className="mr-3" size={20} />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link 
                to={`/${currentUsername}/settings`}
                className={`flex items-center px-4 py-3 text-base rounded-lg transition-colors ${
                  isRouteActive('settings') 
                    ? 'active bg-primary text-primary-content' 
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
                }`}
              >
                <Settings className="mr-3" size={20} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 border-b border-base-300 bg-base-100 flex items-center justify-between px-4">
          {/* Left side - Mobile menu toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleSidebar}
              className="text-base-content/70 hover:text-primary"
            >
              <Menu size={24} />
            </button>
          </div>
          
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