import { SignInButton } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';

export default function SignInPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  // If already signed in, redirect to dashboard
  if (isSignedIn && user) {
    // Use username if available, otherwise use a fallback
    const username = user.username || `user${user.id.slice(-8)}`;
    return <Navigate to={`/${username}/dashboard`} replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-background border border-border rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Sign In</h1>
          <p className="mt-2 text-text-secondary">Welcome back to Zemon Community</p>
        </div>
        
        <div className="space-y-4">
          <SignInButton mode="modal">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Sign In
            </Button>
          </SignInButton>
          
          <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-primary hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 