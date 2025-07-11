import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, User, Hammer, Beaker, Swords, X, Code } from 'lucide-react';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentUsername: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, currentUsername }) => {
  const location = useLocation();
  
  // Check if we're on a problem page
  const isCrucibleProblemPage = /^\/[\w-]+\/crucible\/problem\/.+/.test(location.pathname);
  
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
      <div className="h-14 flex items-center justify-center border-b border-base-300">
        <Link to={`/${currentUsername}/dashboard`} className={`flex items-center justify-center font-bold text-primary font-heading transition-all duration-200 ${isOpen ? 'text-xl' : 'w-10 h-10'}`}>
          {isOpen ? (
            'ZEMON'
          ) : (
            <img src="/Zemon.svg" alt="Zemon" className="w-full h-full" />
          )}
        </Link>
        {/* Close button for mobile only */}
        {isOpen && (
          <button
            className="md:hidden ml-auto mr-4 text-base-content hover:text-primary"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      {/* Problem indicator (when sidebar is collapsed) */}
      {!isOpen && isCrucibleProblemPage && (
        <div className="mt-2 px-2 py-1 mx-auto rounded-md bg-primary/10 flex items-center justify-center tooltip" data-tip="Problem workspace active">
          <Code size={16} className="text-primary" />
        </div>
      )}
      
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