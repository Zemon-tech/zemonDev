import React from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import AdminPanel from '@/components/admin/AdminPanel';

const AdminPage: React.FC = () => {
  const { userRole } = useUserRole();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-base-content/70">
            Welcome to the admin panel. Current role: <span className="badge badge-primary">{userRole}</span>
          </p>
        </div>
        
        {/* Admin Panel as a fixed component instead of drawer */}
        <div className="bg-base-100 rounded-lg shadow-lg">
          <AdminPanel isOpen={true} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
