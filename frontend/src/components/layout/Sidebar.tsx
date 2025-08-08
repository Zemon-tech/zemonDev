import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, User, Hammer, Beaker, Swords, X, PanelLeftClose } from 'lucide-react';
import React from 'react';
import SubjectIcon from '@/components/ui/SubjectIcon';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentUsername: string;
  focusMode?: boolean; // [ADD] focusMode prop
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, currentUsername, focusMode }) => {
  const location = useLocation();
  const [hovered, setHovered] = React.useState(false);

  // [ADD] Show sidebar if hovered in focus mode
  const shouldShow = focusMode ? hovered : isOpen;

  // [ADD] Hover zone for focus mode
  React.useEffect(() => {
    if (!focusMode) return;
    const handleMouseLeave = () => setHovered(false);
    if (hovered) {
      window.addEventListener('mousemove', handleMouseLeave);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseLeave);
    };
  }, [focusMode, hovered]);

  // Check if we're on the arena page
  const isArenaPage = /^\/[\w-]+\/arena/.test(location.pathname);

  // More precise active route check
  const isExactRouteActive = (route: string) => {
    const currentPath = location.pathname.replace(/^\/[^/]+\//, ''); // Remove username from path
    return currentPath.startsWith(route);
  };

  // [FIX] Sidebar width and shadow logic for focus mode
  let sidebarWidth = 'w-64';
  let sidebarShadow = '';
  let sidebarBg = 'bg-base-200';
  if (focusMode) {
    if (hovered) {
      sidebarWidth = 'w-64';
      sidebarShadow = 'shadow-xl';
      sidebarBg = 'bg-base-200';
    } else {
      sidebarWidth = 'w-0';
      sidebarShadow = '';
      sidebarBg = 'bg-transparent';
    }
  } else {
    sidebarWidth = isOpen ? 'w-64' : 'w-20';
    sidebarShadow = '';
    sidebarBg = 'bg-base-200';
  }

  return (
    <>
      {/* [ADD] Invisible hover zone for focus mode */}
      {focusMode && (
        <div
          className="fixed left-0 top-0 h-full w-4 z-50 cursor-pointer"
          style={{ pointerEvents: hovered ? 'none' : 'auto' }}
          onMouseEnter={() => setHovered(true)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform ${shouldShow ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarBg} border-r border-base-300 flex flex-col ${sidebarWidth} ${sidebarShadow}`}
        onMouseLeave={() => focusMode && setHovered(false)}
        onMouseEnter={() => focusMode && setHovered(true)}
        tabIndex={-1}
        aria-hidden={!shouldShow}
        style={{ minWidth: focusMode && !hovered ? 0 : undefined }}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-center border-b border-base-300">
          <Link to={`/${currentUsername}/dashboard`} className={`flex items-center justify-center font-bold text-primary font-heading transition-all duration-200 ${isOpen ? 'text-xl' : 'w-10 h-10'}`}>
            {isOpen ? (
              'ZEMON'
            ) : (
              <SubjectIcon className="w-full h-full" />
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

        {/* Arena indicator (when sidebar is collapsed) */}
        {!isOpen && isArenaPage && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-arena-sidebar'))}
            className="mt-2 px-2 py-1 mx-auto rounded-md bg-primary/10 flex items-center justify-center tooltip hover:bg-primary/20 transition-colors"
            data-tip="Arena sidebar collapsed"
          >
            <PanelLeftClose size={16} className="text-primary" />
          </button>
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
                to={`/${currentUsername}`}
                className={`flex items-center py-3 text-base rounded-lg transition-colors ${
                  isExactRouteActive('')
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
    </>
  );
};

export default Sidebar; 