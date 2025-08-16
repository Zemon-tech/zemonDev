import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { checkAuthAndRedirect } from '../../utils/authRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        setShouldRender(true);
      } else {
        // User is not authenticated, redirect to landing site
        checkAuthAndRedirect();
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
