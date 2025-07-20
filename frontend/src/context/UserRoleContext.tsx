import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

// Types
export type UserRole = 'user' | 'moderator' | 'admin';

interface UserRoleContextType {
  userRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
  hasAdminAccess: () => boolean;
  hasModeratorAccess: () => boolean;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user role from backend
  const fetchUserRole = async () => {
    if (!user?.id) {
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the JWT token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/users/me/role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user role: ${response.statusText}`);
      }

      const data = await response.json();
      setUserRole(data.data?.role || 'user');
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user role');
      setUserRole('user'); // Default to user role on error
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch role when user is loaded
  useEffect(() => {
    if (isLoaded) {
      fetchUserRole();
    }
  }, [user?.id, isLoaded]);

  // Helper functions
  const hasAdminAccess = (): boolean => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const hasModeratorAccess = (): boolean => {
    return userRole === 'moderator' || userRole === 'admin';
  };

  const refetchRole = async (): Promise<void> => {
    await fetchUserRole();
  };

  const contextValue: UserRoleContextType = {
    userRole,
    isLoading,
    error,
    hasAdminAccess,
    hasModeratorAccess,
    refetchRole,
  };

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
