import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Table from '../components/Table';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import ApiService from '../services/api.service';
import type { ArenaChannel } from '../types/arena.types';
import { formatDate } from '../utils/helpers';

// Form validation schema
const channelSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['text', 'announcement', 'readonly']),
  group: z.enum(['getting-started', 'community', 'hackathons']),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string().min(1, 'Creator ID is required'),
  moderators: z.array(z.string()).default([]),
  permissions: z.object({
    canMessage: z.boolean().default(true),
    canRead: z.boolean().default(true),
  }).default({
    canMessage: true,
    canRead: true,
  }),
});

type ChannelFormData = z.infer<typeof channelSchema>;

const ChannelsPage = () => {
  // State
  const [channels, setChannels] = useState<ArenaChannel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ArenaChannel | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Form setup
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema) as any, // Type assertion to fix compatibility issue
    defaultValues: {
      isActive: true,
      moderators: [],
      permissions: {
        canMessage: true,
        canRead: true,
      },
    },
  });

  // Fetch channels on mount and page change
  useEffect(() => {
    fetchChannels();
  }, [currentPage]);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isModalOpen) {
      reset();
      setEditingChannel(null);
    }
  }, [isModalOpen, reset]);

  // Set form values when editing
  useEffect(() => {
    if (editingChannel) {
      setValue('name', editingChannel.name);
      setValue('type', editingChannel.type);
      setValue('group', editingChannel.group);
      setValue('description', editingChannel.description || '');
      setValue('isActive', editingChannel.isActive);
      setValue('createdBy', editingChannel.createdBy);
      setValue('moderators', editingChannel.moderators);
      setValue('permissions.canMessage', editingChannel.permissions.canMessage);
      setValue('permissions.canRead', editingChannel.permissions.canRead);
    }
  }, [editingChannel, setValue]);

  // Fetch channels
  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getChannels() as any;
      
      // Process the grouped channels into a flat array
      const flattenedChannels: ArenaChannel[] = [];
      for (const group in response) {
        if (Object.prototype.hasOwnProperty.call(response, group)) {
          flattenedChannels.push(...response[group]);
        }
      }
      
      setChannels(flattenedChannels);
      // In a real API, you would get total pages from response metadata
      // This is a placeholder calculation
      setTotalPages(Math.ceil(response.length / 10) || 1);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to load channels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (create/update)
  const onSubmit = async (data: ChannelFormData) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      if (editingChannel) {
        // Update existing channel
        await ApiService.updateChannel(editingChannel._id || '', data);
        setSuccessMessage('Channel updated successfully!');
      } else {
        // Create new channel
        await ApiService.createChannel(data);
        setSuccessMessage('Channel created successfully!');
      }
      
      setIsModalOpen(false);
      fetchChannels();
    } catch (err) {
      console.error('Error saving channel:', err);
      setActionError('Failed to save channel. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      await ApiService.deleteChannel(deleteId);
      setSuccessMessage('Channel deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchChannels();
    } catch (err) {
      console.error('Error deleting channel:', err);
      setActionError('Failed to delete channel. Please try again later.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = (channel: ArenaChannel) => {
    setEditingChannel(channel);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Table columns configuration
  const columns = [
    { header: 'Name', accessor: 'name' as keyof ArenaChannel },
    { header: 'Type', accessor: 'type' as keyof ArenaChannel },
    { header: 'Group', accessor: 'group' as keyof ArenaChannel },
    { 
      header: 'Active', 
      accessor: (item: ArenaChannel): ReactNode => (item.isActive ? 'Yes' : 'No')
    },
    { 
      header: 'Created At', 
      accessor: (item: ArenaChannel): ReactNode => formatDate(item.createdAt || new Date())
    },
    {
      header: 'Actions',
      accessor: (item: ArenaChannel): ReactNode => (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item._id || '');
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Channels Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Channel</Button>
      </div>

      {/* Success message */}
      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* Error message */}
      {error && <ErrorAlert message={error} />}

      {/* Channels table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={channels}
            keyExtractor={(item) => item._id || ''}
            emptyMessage="No channels found"
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-4"
          />
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingChannel ? 'Edit Channel' : 'Add New Channel'}
            </h2>
            
            {actionError && <ErrorAlert message={actionError} />}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="text">Text</option>
                  <option value="announcement">Announcement</option>
                  <option value="readonly">Read Only</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <select
                  {...register('group')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="getting-started">Getting Started</option>
                  <option value="community">Community</option>
                  <option value="hackathons">Hackathons</option>
                </select>
                {errors.group && (
                  <p className="mt-1 text-sm text-red-600">{errors.group.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Creator ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creator ID
                </label>
                <input
                  type="text"
                  {...register('createdBy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.createdBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.createdBy.message}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              {/* Permissions */}
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="font-medium mb-2">Permissions</h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canMessage"
                      {...register('permissions.canMessage')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="canMessage" className="ml-2 block text-sm text-gray-700">
                      Can Message
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="canRead"
                      {...register('permissions.canRead')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="canRead" className="ml-2 block text-sm text-gray-700">
                      Can Read
                    </label>
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={actionLoading}
                  loadingText="Saving..."
                >
                  {editingChannel ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this channel? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={actionLoading}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage; 