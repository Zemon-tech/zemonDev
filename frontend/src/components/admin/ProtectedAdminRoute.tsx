import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/context/UserRoleContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ 
  children, 
  fallbackPath = '/arena' 
}) => {
  const { isLoading, hasAdminAccess } = useUserRole();

  // Show loading spinner while checking role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-base-content/70">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect if user doesn't have admin access
  if (!hasAdminAccess()) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
