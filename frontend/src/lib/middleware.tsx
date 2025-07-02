import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

/**
 * A React hook that acts as middleware for protected routes
 * This will redirect unauthenticated users to the signin page
 * when they try to access protected routes
 */
export function useAuthMiddleware() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Wait until Clerk has loaded
    if (!isLoaded) return;
    
    // Check if the route is a protected route (starts with a username path)
    const isProtectedRoute = /^\/[^/]+\//.test(location.pathname);
    
    // If it's a protected route and user is not signed in, redirect to signin
    if (isProtectedRoute && !isSignedIn) {
      // Save the attempted URL to redirect back after login
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/signin?redirect=${returnUrl}`, { replace: true });
      return;
    }
    
    // If user is on the root path and is signed in, redirect to their dashboard
    if (location.pathname === '/' && isSignedIn && user) {
      // Use username if available, otherwise use a fallback
      const username = user.username || `user${user.id.slice(-8)}`;
      navigate(`/${username}/dashboard`, { replace: true });
      return;
    }
  }, [isLoaded, isSignedIn, user, location.pathname, location.search, navigate]);
  
  return { isLoaded, isSignedIn, user };
}

/**
 * A React component that wraps protected routes
 * and ensures the user is authenticated
 */
export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const { isLoaded, isSignedIn } = useAuthMiddleware();
    
    // Show loading state while Clerk is initializing
    if (!isLoaded) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    
    // If authenticated, render the component
    if (isSignedIn) {
      return <Component {...props} />;
    }
    
    // This is a fallback, but the useEffect in useAuthMiddleware
    // should handle the redirect before we reach this point
    return null;
  };
} 