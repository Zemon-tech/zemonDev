import React from 'react';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnrichedMembership {
  userId: string;
  channelId: string;
  name: string;
  type: 'chat' | 'announcement' | 'showcase' | 'info';
  status: 'pending' | 'approved' | 'denied' | 'banned' | 'kicked';
  computedRole: string;
  channel?: {
    _id: string;
    name: string;
    type: string;
    group: string;
    description?: string;
  };
}

interface RolesAndPermissionsCardProps {
  memberships: EnrichedMembership[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin':
      return 'badge badge-error';
    case 'moderator':
      return 'badge badge-warning';
    case 'member':
    default:
      return 'badge badge-neutral';
  }
};

export const RolesAndPermissionsCard: React.FC<RolesAndPermissionsCardProps> = ({
  memberships,
  loading,
  error,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="bg-base-100 rounded-xl shadow border border-base-300 p-5">
        <div className="font-semibold text-base-content flex items-center gap-2 text-lg mb-4">
          <Shield size={18} className="text-primary" /> 
          Roles & Permissions
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-base-200 rounded-lg border border-base-300">
              <div className="skeleton h-4 w-32"></div>
              <div className="skeleton h-4 w-20"></div>
              <div className="skeleton h-4 w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-100 rounded-xl shadow border border-base-300 p-5">
        <div className="font-semibold text-base-content flex items-center gap-2 text-lg mb-4">
          <Shield size={18} className="text-primary" /> 
          Roles & Permissions
        </div>
        
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-semibold">Error loading roles and permissions</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRetry}
            className="ml-auto"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (memberships.length === 0) {
    return (
      <div className="bg-base-100 rounded-xl shadow border border-base-300 p-5">
        <div className="font-semibold text-base-content flex items-center gap-2 text-lg mb-4">
          <Shield size={18} className="text-primary" /> 
          Roles & Permissions
        </div>
        
        <div className="text-center py-8 text-base-content/60">
          <Shield size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium mb-2">No channel memberships found</p>
          <p className="text-sm">You haven't joined any channels yet, or your memberships are still pending approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl shadow border border-base-300 p-5">
      <div className="font-semibold text-base-content flex items-center gap-2 text-lg mb-4">
        <Shield size={18} className="text-primary" /> 
        Roles & Permissions
      </div>
      
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="text-left font-semibold text-base-content/80">Channel</th>
              <th className="text-left font-semibold text-base-content/80">Role</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr key={membership.channelId} className="hover:bg-base-200/50">
                <td className="font-medium text-base-content">
                  {membership.name}
                </td>
                <td>
                  <span className={getRoleBadgeClass(membership.computedRole)}>
                    {membership.computedRole.charAt(0).toUpperCase() + membership.computedRole.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-base-content/50 text-center">
        Showing {memberships.length} approved channel membership{memberships.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
