import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'channels' | 'content'>('users');

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'channels' as const, label: 'Channels', icon: '📺' },
    { id: 'content' as const, label: 'Content', icon: '📝' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-base-content/70">Coming Soon</p>
            <p className="text-sm text-base-content/50 mt-2">
              Manage user roles, permissions, and account settings
            </p>
          </div>
        );
      case 'channels':
        return (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-2">Channel Management</h3>
            <p className="text-base-content/70">Coming Soon</p>
            <p className="text-sm text-base-content/50 mt-2">
              Create, edit, and manage arena channels
            </p>
          </div>
        );
      case 'content':
        return (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Content Management</h3>
            <p className="text-base-content/70">Coming Soon</p>
            <p className="text-sm text-base-content/50 mt-2">
              Moderate messages, announcements, and showcase content
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`absolute inset-0 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* Overlay - Covers entire Arena content area including sidebar */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />
      
      {/* Panel Container - full height slide animation */}
      <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-base-100 border-t border-base-300 shadow-lg w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <button 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
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
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '80vh' }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
