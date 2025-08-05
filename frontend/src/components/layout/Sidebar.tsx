import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Home, Settings, User, Hammer, Beaker, Swords } from "lucide-react";
import SubjectIcon from '@/components/ui/SubjectIcon';
import { useLocation, Link as RouterLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentUsername: string;
  focusMode?: boolean;
  liveEditState?: 'live' | 'edit' | null; // Add this prop for live/edit indicator
}

export const SidebarModern: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  currentUsername,
  focusMode,
  liveEditState
}) => {
  const location = useLocation();
  const [open, setOpen] = useState(isOpen);

  // Helper to check active route
  const isExactRouteActive = (route: string) => {
    const currentPath = location.pathname.replace(/^\/[^/]+\//, '');
    return currentPath.startsWith(route);
  };

  // Sidebar links
  const links = [
    {
      label: "Dashboard",
      href: `/${currentUsername}/dashboard`,
      icon: <Home className="h-5 w-5" />,
      active: isExactRouteActive('dashboard'),
    },
    {
      label: "Forge",
      href: `/${currentUsername}/forge`,
      icon: <Hammer className="h-5 w-5" />,
      active: isExactRouteActive('forge'),
    },
    {
      label: "Crucible",
      href: `/${currentUsername}/crucible`,
      icon: <Beaker className="h-5 w-5" />,
      active: isExactRouteActive('crucible'),
    },
    {
      label: "Arena",
      href: `/${currentUsername}/arena`,
      icon: <Swords className="h-5 w-5" />,
      active: isExactRouteActive('arena'),
    },
    {
      label: "Profile",
      href: `/${currentUsername}`,
      icon: <User className="h-5 w-5" />,
      active: isExactRouteActive(''),
    },
    {
      label: "Settings",
      href: `/${currentUsername}/settings`,
      icon: <Settings className="h-5 w-5" />,
      active: isExactRouteActive('settings'),
    },
  ];

  // Live/Edit indicator (for Crucible)
  const renderLiveEditIndicator = () => {
    if (!liveEditState) return null;
    return (
      <div className="flex items-center justify-center my-2">
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${liveEditState === 'live' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>{liveEditState === 'live' ? 'Live' : 'Edit'}</span>
      </div>
    );
  };

  // Sidebar header (logo)
  const Logo = () => (
    <RouterLink to={`/${currentUsername}/dashboard`} className="flex items-center gap-2 py-2">
      <SubjectIcon className="h-7 w-7" />
      {open && <span className="font-bold text-lg">ZEMON</span>}
    </RouterLink>
  );

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo />
          {renderLiveEditIndicator()}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className={
                  link.active
                    ? 'bg-primary text-primary-content rounded-lg'
                    : 'text-base-content/70 hover:bg-base-100 hover:text-primary rounded-lg'
                }
                as={RouterLink}
              />
            ))}
          </div>
        </div>
        {/* Example: Arena/Crucible sub-sidebar toggles (if needed) */}
        {/* <div className="flex flex-col gap-2">
          <button className="btn btn-sm">Arena Sidebar</button>
          <button className="btn btn-sm">Crucible Sidebar</button>
        </div> */}
      </SidebarBody>
    </Sidebar>
  );
};

export default SidebarModern; 