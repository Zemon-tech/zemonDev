import { Link, useLocation } from 'react-router-dom';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { useUserRole } from '@/context/UserRoleContext';
import { Settings } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import SubjectIcon from '@/components/ui/SubjectIcon';

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { hasAdminAccess } = useUserRole();
  const location = useLocation();
  
  // Extract username from path for admin link
  const pathSegments = location.pathname.split('/');
  const username = pathSegments[1];
  
  return (
    <nav className="navbar bg-background border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary font-heading">
            <SubjectIcon className="w-8 h-8" />
            ZEMON
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-text hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/forge" className="text-text hover:text-primary transition-colors">
            Forge
          </Link>
          <Link to="/crucible" className="text-text hover:text-primary transition-colors">
            Crucible
          </Link>
          <Link to="/arena" className="text-text hover:text-primary transition-colors">
            Arena
          </Link>
          
          {/* Admin Panel Button - Only visible to admins/moderators */}
          {isSignedIn && hasAdminAccess() && (
            <Link 
              to={`/${username}/admin`} 
              className="btn btn-ghost btn-sm"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
              Admin
            </Link>
          )}
          
          <ThemeSwitcher />
          
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="btn btn-ghost">Login</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary">Sign Up</button>
              </SignUpButton>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}