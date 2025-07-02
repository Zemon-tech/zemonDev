import { SignUp, useAuth, useUser } from '@clerk/clerk-react';
import { useLocation, Navigate } from 'react-router-dom';

export default function SignUpPage() {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Get username or fallback
  const username = user?.username || (user ? `user${user.id.slice(-8)}` : '');
  
  // Extract the redirect URL from the query parameters
  const params = new URLSearchParams(location.search);
  const redirectUrl = params.get('redirect') || '/';
  const nextSection = params.get('next');
  
  // If there's a specific section to redirect to after signup
  const finalRedirectUrl = nextSection && username 
    ? `/${username}/${nextSection}` 
    : redirectUrl;
  
  // Redirect authenticated users to dashboard
  if (isLoaded && isSignedIn && username) {
    return <Navigate to={`/${username}/dashboard`} replace />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-background-secondary rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary font-heading">Join Zemon</h1>
          <p className="mt-2 text-text-secondary">Create your account to get started</p>
        </div>
        
        <SignUp 
          routing="path" 
          path="/signup" 
          signInUrl="/signin"
          redirectUrl={finalRedirectUrl}
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