import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { checkAuthAndRedirect, getLandingUrl } from '../utils/authRedirect';

export const useAuthRedirect = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Small delay to ensure Clerk has fully processed the auth state
      const timer = setTimeout(() => {
        checkAuthAndRedirect();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  return {
    isSignedIn,
    isLoaded,
    user,
    landingUrl: getLandingUrl()
  };
};
