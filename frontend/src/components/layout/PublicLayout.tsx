import { Link } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';
import { SignInButton, SignUpButton, useAuth, useUser } from '@clerk/clerk-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function PublicLayout() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  
  // Get username or fallback
  const username = user?.username || (user ? `user${user.id.slice(-8)}` : '');
  
  // Don't show sign in/up buttons on auth pages
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="navbar bg-background border-b border-border">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary font-heading">
              ZEMON
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-text hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-text hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/blogs" className="text-text hover:text-primary transition-colors">
              Blogs
            </Link>
            <Link to="/pricing" className="text-text hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/developers" className="text-text hover:text-primary transition-colors">
              Developers
            </Link>
            <ThemeToggle />
            
            {/* Show auth buttons only if not signed in and not on auth pages */}
            {!isSignedIn && !isAuthPage && (
              <>
                <SignInButton mode="modal">
                  <button className="btn btn-ghost">Log In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-primary">Sign Up</button>
                </SignUpButton>
              </>
            )}
            
            {/* Show dashboard link if signed in */}
            {isSignedIn && username && (
              <Link to={`/${username}/dashboard`} className="btn btn-primary">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-background-secondary py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary font-heading">Zemon Community</h3>
              <p className="text-text-secondary">
                The ultimate platform for college students to learn, build, and showcase their programming skills.
              </p>
            </div>
            <div>
              <h4 className="text-md font-bold mb-4 text-primary font-heading">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/forge" className="text-text-secondary hover:text-primary">The Forge</Link></li>
                <li><Link to="/crucible" className="text-text-secondary hover:text-primary">The Crucible</Link></li>
                <li><Link to="/arena" className="text-text-secondary hover:text-primary">The Arena</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-bold mb-4 text-primary font-heading">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-text-secondary hover:text-primary">About Us</Link></li>
                <li><Link to="/blogs" className="text-text-secondary hover:text-primary">Blog</Link></li>
                <li><Link to="/contact" className="text-text-secondary hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-bold mb-4 text-primary font-heading">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-text-secondary hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-text-secondary hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-border text-center text-text-secondary">
            <p>© {new Date().getFullYear()} Zemon Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 