import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useArenaSocket } from '../hooks/useArenaSocket';

// Types
export type UserRole = 'user' | 'moderator' | 'admin';

interface ChannelRole {
  role: string;
  grantedBy?: string;
  grantedAt?: Date;
}

interface UserRoleContextType {
  userRole: UserRole | null; // Backward compatibility
  globalRole: UserRole | null;
  globalRoles: any[];
  channelRoles: Record<string, ChannelRole>;
  allRoles: any[];
  isLoading: boolean;
  error: string | null;
  hasAdminAccess: (channelId?: string) => boolean;
  hasModeratorAccess: (channelId?: string) => boolean;
  hasChannelAdminAccess: (channelId: string) => boolean;
  hasChannelModeratorAccess: (channelId: string) => boolean;
  getUserChannelRole: (channelId: string) => string | null;
  refetchRole: () => Promise<void>;
}

// Create context
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// Provider component
interface UserRoleProviderProps {
  children: ReactNode;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { socket } = useArenaSocket();
  const [userRole, setUserRole] = useState<UserRole | null>(null); // Backward compatibility
  const [globalRole, setGlobalRole] = useState<UserRole | null>(null);
  const [globalRoles, setGlobalRoles] = useState<any[]>([]);
  const [channelRoles, setChannelRoles] = useState<Record<string, ChannelRole>>({});
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const isFetchingRef = useRef(false);
  const lastRequestTimeRef = useRef<number>(0);

  // Fetch user role from backend - MEMOIZED to prevent infinite re-renders
  const fetchUserRole = useCallback(async (forceRefresh = false) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`[${requestId}] fetchUserRole called`, { forceRefresh, userId: user?.id });
    
    if (!user?.id) {
      console.log(`[${requestId}] No user ID, clearing role data`);
      setUserRole(null);
      setGlobalRole(null);
      setGlobalRoles([]);
      setChannelRoles({});
      setAllRoles([]);
      setIsLoading(false);
      return;
    }

    // Check cache (5 minutes cache)
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    const currentTime = Date.now();
    
    if (!forceRefresh && (currentTime - lastFetchTime) < CACHE_DURATION && allRoles.length > 0) {
      console.log(`[${requestId}] Using cached role data`);
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests using ref
    if (isFetchingRef.current) {
      console.log(`[${requestId}] Role fetch already in progress, skipping`);
      return;
    }

    // Prevent rapid successive requests (debounce)
    if (!forceRefresh && (currentTime - lastRequestTimeRef.current) < 1000) { // 1 second debounce
      console.log(`[${requestId}] Request too soon after last request, skipping`);
      return;
    }
    lastRequestTimeRef.current = currentTime;

    try {
      console.log(`[${requestId}] Starting role fetch`);
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Get the JWT token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/users/me/role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch user role: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Set backward compatibility field
      setUserRole(data.data?.role || 'user');
      
      // Set new role data structure
      setGlobalRole(data.data?.globalRole || 'user');
      setGlobalRoles(data.data?.globalRoles || []);
      setChannelRoles(data.data?.channelRoles || {});
      setAllRoles(data.data?.allRoles || []);
      
      // Update cache timestamp
      setLastFetchTime(currentTime);
      console.log(`[${requestId}] Role data fetched and cached successfully`);
    } catch (err) {
      console.error(`[${requestId}] Error fetching user role:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user role');
      setUserRole('user'); // Default to user role on error
      setGlobalRole('user');
      setGlobalRoles([]);
      setChannelRoles({});
      setAllRoles([]);
    } finally {
      console.log(`[${requestId}] Role fetch completed`);
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id, getToken, lastFetchTime, allRoles.length]);

  // Effect to fetch role when user is loaded
  useEffect(() => {
    console.log('UserRoleContext useEffect triggered', { isLoaded, userId: user?.id });
    if (isLoaded && user?.id) {
      fetchUserRole();
    }
  }, [user?.id, isLoaded, fetchUserRole]);

  // Effect to listen for role change notifications
  useEffect(() => {
    if (!socket) return;

    const handleRoleUpdated = (data: { channelId?: string; role: string }) => {
      console.log('Role updated notification received:', data);
      // Force refresh role data when role changes
      fetchUserRole(true);
    };

    const handleChannelPermissionsUpdated = (data: { channelId: string }) => {
      console.log('Channel permissions updated notification received:', data);
      // Force refresh role data when channel permissions change
      fetchUserRole(true);
    };

    // Listen for role change events
    socket.on('role_updated', handleRoleUpdated);
    socket.on('channel_permissions_updated', handleChannelPermissionsUpdated);

    return () => {
      socket.off('role_updated', handleRoleUpdated);
      socket.off('channel_permissions_updated', handleChannelPermissionsUpdated);
    };
  }, [socket, fetchUserRole]);

  // Helper functions - MEMOIZED to prevent infinite re-renders
  const hasAdminAccess = useCallback((channelId?: string): boolean => {
    // If no channelId provided, check global role (backward compatibility)
    if (!channelId) {
      return globalRole === 'admin' || globalRole === 'moderator';
    }
    
    // Check global role first
    if (globalRole === 'admin' || globalRole === 'moderator') {
      return true;
    }
    
    // Check channel-specific role
    const channelRole = channelRoles[channelId];
    return channelRole?.role === 'admin' || channelRole?.role === 'moderator';
  }, [globalRole, channelRoles]);

  const hasModeratorAccess = useCallback((channelId?: string): boolean => {
    // If no channelId provided, check global role (backward compatibility)
    if (!channelId) {
      return globalRole === 'moderator' || globalRole === 'admin';
    }
    
    // Check global role first
    if (globalRole === 'moderator' || globalRole === 'admin') {
      return true;
    }
    
    // Check channel-specific role
    const channelRole = channelRoles[channelId];
    return channelRole?.role === 'moderator' || channelRole?.role === 'admin';
  }, [globalRole, channelRoles]);

  const hasChannelAdminAccess = useCallback((channelId: string): boolean => {
    // Check global admin role first
    if (globalRole === 'admin') {
      return true;
    }
    
    // Check channel-specific admin role
    const channelRole = channelRoles[channelId];
    return channelRole?.role === 'admin';
  }, [globalRole, channelRoles]);

  const hasChannelModeratorAccess = useCallback((channelId: string): boolean => {
    // Check global roles first
    if (globalRole === 'admin' || globalRole === 'moderator') {
      return true;
    }
    
    // Check channel-specific moderator role
    const channelRole = channelRoles[channelId];
    return channelRole?.role === 'moderator';
  }, [globalRole, channelRoles]);

  const getUserChannelRole = useCallback((channelId: string): string | null => {
    const channelRole = channelRoles[channelId];
    return channelRole?.role || null;
  }, [channelRoles]);

  const refetchRole = useCallback(async (forceRefresh = false): Promise<void> => {
    await fetchUserRole(forceRefresh);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: UserRoleContextType = useMemo(() => ({
    userRole,
    globalRole,
    globalRoles,
    channelRoles,
    allRoles,
    isLoading,
    error,
    hasAdminAccess,
    hasModeratorAccess,
    hasChannelAdminAccess,
    hasChannelModeratorAccess,
    getUserChannelRole,
    refetchRole,
  }), [
    userRole,
    globalRole,
    globalRoles,
    channelRoles,
    allRoles,
    isLoading,
    error,
    hasAdminAccess,
    hasModeratorAccess,
    hasChannelAdminAccess,
    hasChannelModeratorAccess,
    getUserChannelRole,
    refetchRole,
  ]);

  return (
    <UserRoleContext.Provider value={contextValue}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Custom hook to use the context
export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

export default UserRoleContext;
