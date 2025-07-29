import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { ApiService } from '../services/api.service';

// TypeScript interfaces matching MongoDB schema
export interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  fullName: string;
  username: string;
  collegeDetails?: {
    name?: string;
    branch?: string;
    year?: number;
  };
  profile?: {
    headline?: string;
    bio?: string;
    aboutMe?: string;
    location?: string;
    skills?: string[];
    toolsAndTech?: string[];
  };
  interests: string[];
  stats: {
    problemsSolved: number;
    resourcesCreated: number;
    reputation: number;
  };
  bookmarkedResources: string[];
  completedSolutions: string[];
  activeDrafts: string[];
  archivedDrafts: string[];
  workspacePreferences: {
    defaultEditorSettings: {
      fontSize: number;
      theme: string;
      wordWrap: boolean;
    };
    defaultLayout: {
      showProblemSidebar: boolean;
      showChatSidebar: boolean;
    };
  };
  college?: {
    collegeName?: string;
    course?: string;
    branch?: string;
    year?: number;
    city?: string;
    state?: string;
  };
  socialLinks?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const isFetchingRef = useRef(false);
  const lastRequestTimeRef = useRef<number>(0);

  // Fetch user profile from backend - MEMOIZED to prevent infinite re-renders
  const fetchUserProfile = useCallback(async (forceRefresh = false) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`[${requestId}] fetchUserProfile called`, { forceRefresh, userId: user?.id });
    
    if (!user?.id) {
      console.log(`[${requestId}] No user ID, clearing profile data`);
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    // Check cache (5 minutes cache)
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    const currentTime = Date.now();
    
    if (!forceRefresh && (currentTime - lastFetchTime) < CACHE_DURATION && userProfile) {
      console.log(`[${requestId}] Using cached profile data`);
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests using ref
    if (isFetchingRef.current) {
      console.log(`[${requestId}] Profile fetch already in progress, skipping`);
      return;
    }

    // Prevent rapid successive requests (debounce)
    if (!forceRefresh && (currentTime - lastRequestTimeRef.current) < 1000) { // 1 second debounce
      console.log(`[${requestId}] Request too soon after last request, skipping`);
      return;
    }
    lastRequestTimeRef.current = currentTime;

    try {
      console.log(`[${requestId}] Starting profile fetch`);
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Fetch user profile using ApiService
      const response = await ApiService.getCurrentUser(getToken);
      
      if (response.success && response.data) {
        setUserProfile(response.data);
        // Update cache timestamp
        setLastFetchTime(currentTime);
        console.log(`[${requestId}] Profile data fetched and cached successfully`);
      } else {
        throw new Error('Failed to fetch user profile: Invalid response');
      }
    } catch (err) {
      console.error(`[${requestId}] Error fetching user profile:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      setUserProfile(null);
    } finally {
      console.log(`[${requestId}] Profile fetch completed`);
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id, getToken, lastFetchTime, userProfile]);

  // Effect to fetch profile when user is loaded
  useEffect(() => {
    console.log('useUserProfile useEffect triggered', { isLoaded, userId: user?.id });
    if (isLoaded && user?.id) {
      fetchUserProfile();
    }
  }, [user?.id, isLoaded, fetchUserProfile]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchUserProfile(true);
  }, [fetchUserProfile]);

  // Update profile function (placeholder for future implementation)
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    // TODO: Implement profile update functionality
    console.log('Profile update requested:', updates);
    // For now, just refetch the profile
    await refetch();
  }, [refetch]);

  return {
    userProfile,
    loading,
    error,
    refetch,
    updateProfile,
  };
};

// Helper functions for safe data access and formatting
export const formatEducation = (college?: UserProfile['college']): string => {
  if (!college?.course || !college?.branch) return 'Education not specified';
  return `${college.course} in ${college.branch}`;
};

export const formatCollegeLocation = (college?: UserProfile['college']): string => {
  if (!college?.collegeName || !college?.state) return '';
  return `${college.collegeName}, ${college.state}`;
};

export const getDisplayName = (userProfile: UserProfile | null): string => {
  return userProfile?.fullName || 'User';
};

export const getDisplayBio = (userProfile: UserProfile | null): string => {
  return userProfile?.profile?.bio || 'No bio available';
};

export const getDisplayLocation = (userProfile: UserProfile | null): string => {
  return userProfile?.profile?.location || 'Location not specified';
};

export const getSkills = (userProfile: UserProfile | null): string[] => {
  return userProfile?.profile?.skills || [];
};

export const getToolsAndTech = (userProfile: UserProfile | null): string[] => {
  return userProfile?.profile?.toolsAndTech || [];
};

export const getSocialLinks = (userProfile: UserProfile | null) => {
  return userProfile?.socialLinks || {};
}; 