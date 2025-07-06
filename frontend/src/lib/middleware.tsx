import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { logger } from './utils';

// Token cache to avoid unnecessary token refreshes
interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * A React hook to get and set the Clerk auth token for API requests
 */
export function useClerkToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isTokenSet, setIsTokenSet] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    
    const setAuthToken = async () => {
      if (!isLoaded || !isSignedIn) {
        if (isMounted) setIsTokenSet(false);
        return;
      }
      
      try {
        // Check if we have a valid cached token
        const now = Date.now();
        if (tokenCache && tokenCache.expiresAt > now + TOKEN_EXPIRY_BUFFER) {
          // Use cached token
          logger.debug('Using cached auth token');
          
          // Set token in localStorage for API requests
          localStorage.setItem('authToken', tokenCache.token);
          
          if (isMounted) setIsTokenSet(true);
          return;
        }
        
        // Get a fresh token
        logger.debug('Fetching fresh auth token');
        const token = await getToken();
        
        if (token) {
          // Cache the token with expiration (default to 1 hour if we can't parse)
          try {
            // Split the token and get the payload part (second part)
            const parts = token.split('.');
            if (parts.length !== 3 || !parts[1]) throw new Error('Invalid JWT format');
            
            // Base64 decode and parse the payload
            const decodedPayload = atob(parts[1]);
            const payload = JSON.parse(decodedPayload);
            const expiresAt = payload.exp * 1000; // Convert to milliseconds
            
            tokenCache = { token, expiresAt };
            
            // Schedule refresh before expiration
            const timeToExpiry = expiresAt - now - TOKEN_EXPIRY_BUFFER;
            if (timeToExpiry > 0) {
              refreshTimer = setTimeout(setAuthToken, timeToExpiry);
            }
          } catch (e) {
            // If token parsing fails, set a default expiration of 1 hour
            logger.warn('Failed to parse JWT token:', e);
            tokenCache = { token, expiresAt: now + 60 * 60 * 1000 };
          }
          
          // Set token in localStorage for API requests
          localStorage.setItem('authToken', token);
          
          if (isMounted) setIsTokenSet(true);
        } else {
          if (isMounted) setIsTokenSet(false);
        }
      } catch (error) {
        logger.error('Error setting auth token:', error);
        if (isMounted) setIsTokenSet(false);
      }
    };
    
    setAuthToken();
    
    return () => {
      isMounted = false;
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [getToken, isLoaded, isSignedIn]);
  
  return { isTokenSet };
}

// Add an interceptor for API requests to include the auth token
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken && init) {
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${authToken}`
      };
    }
    
    return originalFetch(input, init);
  };
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