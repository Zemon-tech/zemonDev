import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useArenaChannels, Channel } from '@/hooks/useArenaChannels';
import { ApiService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Edit, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ChannelManagementProps {}

const ChannelManagement: React.FC<ChannelManagementProps> = () => {
  const { getToken } = useAuth();
  const { channels, loading, error } = useArenaChannels();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Get all parent channels (channels without parentChannelId)
  const parentChannels = Object.values(channels).flat().filter(
    channel => !channel.parentChannelId
  );

  // Get all channels for the selector (parent + sub-channels)
  const allChannels = Object.values(channels).flat();

  const handleEditDescription = (channel: Channel) => {
    setSelectedChannel(channel);
    setDescription(channel.description || '');
    setIsModalOpen(true);
    setUpdateSuccess(false);
  };

  const handleUpdateDescription = async () => {
    if (!selectedChannel) return;

    setIsUpdating(true);
    try {
      await ApiService.updateChannelDescription(selectedChannel._id, description, getToken);
      setUpdateSuccess(true);
      
      // Update the local state to reflect the change
      // Note: In a real app, you might want to refetch the channels
      setTimeout(() => {
        setIsModalOpen(false);
        setUpdateSuccess(false);
        // Trigger a page reload or refetch channels
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to update channel description:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatChannelName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading channels...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-error">
        <AlertCircle className="w-8 h-8 mr-2" />
        <span>Error loading channels: {error}</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Channel Management</h3>
        <p className="text-base-content/70">
          Manage channel descriptions and settings
        </p>
      </div>

      {/* Parent Channels Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="text-left">Title</th>
              <th className="text-left">Type</th>
              <th className="text-left">Description</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parentChannels.map((channel) => (
              <tr key={channel._id}>
                <td className="font-medium">
                  {formatChannelName(channel.name)}
                </td>
                <td>
                  <span className={`badge badge-sm ${
                    channel.type === 'info' ? 'badge-primary' :
                    channel.type === 'announcement' ? 'badge-secondary' :
                    channel.type === 'showcase' ? 'badge-accent' :
                    'badge-neutral'
                  }`}>
                    {channel.type}
                  </span>
                </td>
                <td className="max-w-xs">
                  <div className="truncate" title={channel.description || 'No description'}>
                    {channel.description || 'No description'}
                  </div>
                </td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditDescription(channel)}
                    className="btn btn-sm btn-outline"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Description Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => !isUpdating && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-base-200 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">
                Edit Channel Description
              </h3>

              {updateSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                  <p className="text-success font-semibold">Description updated successfully!</p>
                </div>
              ) : (
                <>
                  {/* Channel Selector */}
                  <div className="mb-4">
                    <label className="label">
                      <span className="label-text font-medium">Select Channel</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={selectedChannel?._id || ''}
                      onChange={(e) => {
                        const channel = allChannels.find(c => c._id === e.target.value);
                        if (channel) {
                          setSelectedChannel(channel);
                          setDescription(channel.description || '');
                        }
                      }}
                    >
                      <option value="">Select a channel...</option>
                      {allChannels.map((channel) => (
                        <option key={channel._id} value={channel._id}>
                          {formatChannelName(channel.name)} 
                          {channel.parentChannelId ? ' (Sub-channel)' : ' (Parent)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Field */}
                  <div className="mb-6">
                    <label className="label">
                      <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full h-32"
                      placeholder="Enter channel description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateDescription}
                      disabled={isUpdating || !selectedChannel}
                      className="btn btn-primary"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Description'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChannelManagement; 