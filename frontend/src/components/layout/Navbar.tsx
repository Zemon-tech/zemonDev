import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';

export default function Navbar() {
  return (
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
          <Link to="/forge" className="text-text hover:text-primary transition-colors">
            Forge
          </Link>
          <Link to="/crucible" className="text-text hover:text-primary transition-colors">
            Crucible
          </Link>
          <Link to="/arena" className="text-text hover:text-primary transition-colors">
            Arena
          </Link>
          <ThemeToggle />
          <SignInButton mode="modal">
            <button className="btn btn-ghost">Login</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-primary">Sign Up</button>
          </SignUpButton>
        </div>
      </div>
    </nav>
  );
} 