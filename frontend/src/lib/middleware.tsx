import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { setAuthToken } from './crucibleApi';

/**
 * A React hook to get and set the Clerk auth token for API requests
 */
export function useClerkToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tokenRefreshTimerRef = useRef<number | null>(null);
  const tokenRetryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  
  useEffect(() => {
    // Only try to get the token if Clerk is loaded
    if (!isLoaded) return;
    
    // Function to get and set the token
    async function fetchAndSetToken() {
      try {
        // Only attempt to get a token if the user is signed in
        if (!isSignedIn) {
          console.log('User not signed in, skipping token fetch');
          return;
        }
        
        const token = await getToken();
        if (token) {
          setAuthToken(token);
          console.log('Auth token set successfully');
          // Reset retry count on success
          tokenRetryCountRef.current = 0;
        } else {
          console.error('No token received from Clerk');
          handleTokenError('No token received');
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
        handleTokenError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // Handle token fetch errors with retry logic
    function handleTokenError(errorMessage: string) {
      // Don't clear the token on error, as it might still be valid
      // Only retry if we haven't exceeded the retry count
      if (tokenRetryCountRef.current < MAX_RETRIES) {
        const delay = Math.pow(2, tokenRetryCountRef.current) * 1000;
        console.log(`Retrying token fetch in ${delay}ms... (${tokenRetryCountRef.current + 1}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          tokenRetryCountRef.current += 1;
          fetchAndSetToken();
        }, delay);
      } else {
        console.error(`Failed to get auth token after ${MAX_RETRIES} attempts`);
      }
    }
    
    // Initial token fetch
    fetchAndSetToken();
    
    // Set up a timer to refresh the token periodically (every 5 minutes)
    tokenRefreshTimerRef.current = window.setInterval(fetchAndSetToken, 5 * 60 * 1000);
    
    return () => {
      // Clean up the timer on unmount
      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current);
        tokenRefreshTimerRef.current = null;
      }
      // Don't clear the auth token on unmount, as it might be needed for other components
    };
  }, [isLoaded, isSignedIn, getToken]);
}

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
  
  // Use the token hook to set up the auth token
  useClerkToken();
  
  useEffect(() => {
    // Wait until Clerk has loaded
    if (!isLoaded) return;
    
    // Log auth state for debugging
    console.log('Auth middleware state:', { isLoaded, isSignedIn, path: location.pathname });
    
    // Check if the route is a protected route (starts with a username path)
    const isProtectedRoute = /^\/[^/]+\//.test(location.pathname);
    
    // If it's a protected route and user is not signed in, redirect to signin
    if (isProtectedRoute && !isSignedIn) {
      // Save the attempted URL to redirect back after login
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      console.log('Redirecting to signin, unauthorized access to:', location.pathname);
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
    const [showLoading, setShowLoading] = useState(true);
    
    // Add a small delay before showing the loading spinner to prevent flashing
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }, []);
    
    // Show loading state while Clerk is initializing, but only after a short delay
    if (!isLoaded) {
      return showLoading ? null : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-3 text-sm text-gray-500">Loading authentication...</p>
        </div>
      );
    }
    
    // If authenticated, render the component
    if (isSignedIn) {
      return <Component {...props} />;
    }
    
    // This is a fallback, but the useEffect in useAuthMiddleware
    // should handle the redirect before we reach this point
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  };
} 