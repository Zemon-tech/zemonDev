import React, { useState } from 'react';
import UserList from './UserList';
import JoinRequestsTable from './JoinRequestsTable';
import ChannelManagement from './ChannelManagement';
import ShowcaseManagement from './ShowcaseManagement';
import { useUserRole } from '@/context/UserRoleContext';


const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'channels' | 'showcase' | 'joinRequests'>('users');
  const { hasAdminAccess } = useUserRole();

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'channels' as const, label: 'Channels', icon: '📺' },
    { id: 'showcase' as const, label: 'Showcase', icon: '⭐' },
    { id: 'joinRequests' as const, label: 'Join Requests', icon: '🔗' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserList />;
      case 'channels':
        return hasAdminAccess() ? (
          <ChannelManagement />
        ) : (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-base-content/70">You need admin privileges to access channel management</p>
          </div>
        );
      case 'showcase':
        return <ShowcaseManagement />;
      case 'joinRequests':
        return <JoinRequestsTable />;
      default:
        return null;
    }
  };

  // Simulate current role (replace with actual role logic if available)
  const currentRole = 'admin';

  return (
    <div className="bg-base-100 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-start justify-start p-4 border-b border-base-300">
        <h2 className="text-xl font-bold mb-1">Admin Panel</h2>
        <span className="text-sm text-base-content/70">Current role: {currentRole}</span>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab tab-bordered flex-1 ${
              activeTab === tab.id ? 'tab-active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content - Takes remaining space with scroll */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
