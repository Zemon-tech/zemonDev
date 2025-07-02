import { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation, Navigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import ThemeToggle from '../ui/ThemeToggle';

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
  
  // Check if the URL username matches the current user's username
  const isCorrectUser = isLoaded && urlUsername === currentUsername;
  
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
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop & Mobile */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        bg-background-secondary border-r border-border w-64 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link to={`/${currentUsername}/dashboard`} className="text-xl font-bold text-primary font-heading">
            ZEMON
          </Link>
          <button 
            className="md:hidden text-text-secondary hover:text-primary" 
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
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
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
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
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
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
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
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
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
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
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
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-background hover:text-primary'
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
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4">
          {/* Left side - Mobile menu toggle */}
          <div className="md:hidden">
            <button 
              onClick={toggleSidebar}
              className="text-text-secondary hover:text-primary"
            >
              <Menu size={24} />
            </button>
          </div>
          
          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-4 relative">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
              />
              <Search 
                className="absolute left-3 top-2.5 text-text-secondary" 
                size={18} 
              />
            </div>
            
            {/* Search results dropdown */}
            {isSearchOpen && (
              <div className="absolute w-full mt-1 bg-background border border-border rounded-lg shadow-lg z-10 p-2">
                <p className="text-text-secondary p-2">Type to search...</p>
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
            
            {/* Theme toggle */}
            <ThemeToggle />
            
            {/* User menu */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 