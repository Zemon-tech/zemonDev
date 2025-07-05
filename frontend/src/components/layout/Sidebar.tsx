import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, User, Hammer, Beaker, Swords, X, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentUsername: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, currentUsername }) => {
  const location = useLocation();
  
  // More precise active route check
  const isExactRouteActive = (route: string) => {
    const currentPath = location.pathname.replace(/^\/[^/]+\//, ''); // Remove username from path
    return currentPath.startsWith(route);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
      bg-base-200 border-r border-base-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-base-300">
        <Link to={`/${currentUsername}/dashboard`} className={`font-bold text-primary font-heading transition-all duration-200 ${isOpen ? 'text-xl' : 'text-lg'}`}>
          {isOpen ? 'ZEMON' : 'Z'}
        </Link>
        {/* Collapse/Expand button for desktop */}
        <button
          className="hidden md:block text-base-content hover:text-primary transition-transform"
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
        {/* Close button for mobile */}
        <button
          className="md:hidden text-base-content hover:text-primary"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
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
              className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                isExactRouteActive('dashboard')
                  ? 'active bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
              } ${isOpen ? 'px-4' : 'justify-center'} `}
            >
              <Home className={isOpen ? 'mr-3' : ''} size={20} />
              {isOpen && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link
              to={`/${currentUsername}/forge`}
              className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                isExactRouteActive('forge')
                  ? 'active bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
              } ${isOpen ? 'px-4' : 'justify-center'} `}
            >
              <Hammer className={isOpen ? 'mr-3' : ''} size={20} />
              {isOpen && <span>Forge</span>}
            </Link>
          </li>
          <li>
            <Link
              to={`/${currentUsername}/crucible`}
              className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                isExactRouteActive('crucible')
                  ? 'active bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
              } ${isOpen ? 'px-4' : 'justify-center'} `}
            >
              <Beaker className={isOpen ? 'mr-3' : ''} size={20} />
              {isOpen && <span>Crucible</span>}
            </Link>
          </li>
          <li>
            <Link
              to={`/${currentUsername}/arena`}
              className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                isExactRouteActive('arena')
                  ? 'active bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
              } ${isOpen ? 'px-4' : 'justify-center'} `}
            >
              <Swords className={isOpen ? 'mr-3' : ''} size={20} />
              {isOpen && <span>Arena</span>}
            </Link>
          </li>
          <li>
            <Link
              to={`/${currentUsername}/profile`}
              className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                isExactRouteActive('profile')
                  ? 'active bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
              } ${isOpen ? 'px-4' : 'justify-center'} `}
            >
              <User className={isOpen ? 'mr-3' : ''} size={20} />
              {isOpen && <span>Profile</span>}
            </Link>
          </li>
          <li>
            <Link
              to={`/${currentUsername}/settings`}
              className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                isExactRouteActive('settings')
                  ? 'active bg-primary text-primary-content'
                  : 'text-base-content/70 hover:bg-base-100 hover:text-primary'
              } ${isOpen ? 'px-4' : 'justify-center'} `}
            >
              <Settings className={isOpen ? 'mr-3' : ''} size={20} />
              {isOpen && <span>Settings</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 