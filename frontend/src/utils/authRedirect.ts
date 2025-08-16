/**
 * Utility functions for handling authentication redirects
 */

export const getLandingUrl = (): string => {
  return import.meta.env.VITE_LANDING_URL || 'https://your-landing-site.vercel.app';
};

export const redirectToLanding = (): void => {
  const landingUrl = getLandingUrl();
  window.location.href = landingUrl;
};

export const isAuthenticated = (): boolean => {
  // Check for Clerk session cookie
  const hasSessionCookie = document.cookie.includes('__session');
  
  // Also check localStorage as backup
  const hasAuthToken = !!localStorage.getItem('clerk-db');
  
  return hasSessionCookie || hasAuthToken;
};

export const checkAuthAndRedirect = (): boolean => {
  if (!isAuthenticated()) {
    redirectToLanding();
    return false;
  }
  return true;
};
