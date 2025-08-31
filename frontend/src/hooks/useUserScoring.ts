import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getUserScoringData, UserScoringData } from '../lib/userScoringApi';

interface UseUserScoringReturn {
  scoringData: UserScoringData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserScoring = (): UseUserScoringReturn => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [scoringData, setScoringData] = useState<UserScoringData | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const isFetchingRef = useRef(false);
  const lastRequestTimeRef = useRef<number>(0);

  // Fetch user scoring data - MEMOIZED to prevent infinite re-renders
  const fetchScoringData = useCallback(async (forceRefresh = false) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`[${requestId}] fetchScoringData called`, { forceRefresh, userId: user?.id });
    
    if (!user?.id) {
      console.log(`[${requestId}] No user ID, clearing scoring data`);
      setScoringData(null);
      setIsLoading(false);
      return;
    }

    // Check cache (3 minutes cache for scoring data)
    const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds
    const currentTime = Date.now();
    
    if (!forceRefresh && (currentTime - lastFetchTime) < CACHE_DURATION && scoringData) {
      console.log(`[${requestId}] Using cached scoring data`);
      setIsLoading(false);
      return;
    }

    // Prevent concurrent requests
    if (isFetchingRef.current) {
      console.log(`[${requestId}] Request already in progress, skipping`);
      return;
    }

    // Rate limiting: minimum 1 second between requests
    const timeSinceLastRequest = currentTime - lastRequestTimeRef.current;
    if (timeSinceLastRequest < 1000) {
      console.log(`[${requestId}] Rate limiting, skipping request`);
      return;
    }

    try {
      isFetchingRef.current = true;
      lastRequestTimeRef.current = currentTime;
      setIsLoading(true);
      setError(null);

      console.log(`[${requestId}] Fetching user scoring data...`);
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const data = await getUserScoringData(token);
      console.log(`[${requestId}] Scoring data fetched successfully:`, data);
      
      setScoringData(data);
      setLastFetchTime(currentTime);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user scoring data';
      console.error(`[${requestId}] Error fetching scoring data:`, errorMessage);
      setError(errorMessage);
      
      // Don't clear existing data on error, just show the error
      if (!scoringData) {
        setScoringData(null);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id, getToken, lastFetchTime, scoringData]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchScoringData(true);
  }, [fetchScoringData]);

  // Effect to fetch data when user changes or component mounts
  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchScoringData();
    } else if (isLoaded && !user?.id) {
      // User is not authenticated, clear data
      setScoringData(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isLoaded, user?.id, fetchScoringData]);

  // Auto-refresh every 5 minutes when user is active
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchScoringData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id, fetchScoringData]);

  return {
    scoringData,
    loading,
    error,
    refetch,
  };
};
