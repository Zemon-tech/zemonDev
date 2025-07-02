import { SignIn, useAuth, useUser } from '@clerk/clerk-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Get username or fallback
  const username = user?.username || (user ? `user${user.id.slice(-8)}` : '');
  
  // Extract the redirect URL from the query parameters
  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect') || '/';
  
  // Redirect authenticated users to dashboard
  if (isLoaded && isSignedIn && username) {
    return <Navigate to={`/${username}/dashboard`} replace />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-background-secondary rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary font-heading">Welcome Back</h1>
          <p className="mt-2 text-text-secondary">Sign in to continue to Zemon</p>
        </div>
        
        <SignIn 
          routing="path" 
          path="/signin" 
          signUpUrl="/signup"
          redirectUrl={redirectUrl}
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-transparent shadow-none p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-background border border-border text-text hover:bg-background-secondary",
              formButtonPrimary: "bg-primary hover:bg-primary-dark",
              footerAction: "text-text-secondary",
              footerActionLink: "text-primary hover:text-primary-dark"
            }
          }}
        />
      </div>
    </div>
  );
} 