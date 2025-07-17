import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

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
  parentChannelId: z.string().nullable().optional(), // <-- Add parentChannelId
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
  const methods = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema) as any, // Type assertion to fix compatibility issue
    defaultValues: {
      isActive: true,
      moderators: [],
      permissions: {
        canMessage: true,
        canRead: true,
      },
      parentChannelId: null,
    },
  });
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = methods;

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
      setValue('parentChannelId', editingChannel.parentChannelId || null); // <-- Prefill parentChannelId
    }
  }, [editingChannel, setValue]);

  // Fetch channels
  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use dev-admin endpoint for flat, up-to-date list
      const response = await ApiService.getAllDevChannels() as ArenaChannel[];
      setChannels(response);
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
      // FIX 2: Ensure parentChannelId is null if empty string
      if (data.parentChannelId === '') data.parentChannelId = null;
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
      // FIX 3: Always await fetchChannels after modal closes
      await fetchChannels();
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
      // FIX 3: Always await fetchChannels after modal closes
      await fetchChannels();
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

  // 1. Group channels by category and show hierarchy
  const groupedChannels = ['getting-started', 'community', 'hackathons'].map((cat) => ({
    group: cat,
    channels: channels.filter((c) => c.group === cat && !c.parentChannelId),
  }));

  // Helper to get sub-channels
  const getSubChannels = (parentId: string): ArenaChannel[] => channels.filter((c) => c.parentChannelId === parentId);

  // Helper to render channel rows recursively (as table rows, with styling for sub-channels)
  const renderChannelRow = (channel: ArenaChannel, level = 0): React.ReactNode[] => {
    const isSub = level > 0;
    return [
      <tr
        key={channel._id}
        className={
          isSub
            ? 'bg-blue-50/40 border-l-4 border-blue-200 text-gray-700 hover:bg-blue-100/60 transition'
            : 'hover:bg-gray-50 transition'
        }
      >
        <td className="px-6 py-3 whitespace-nowrap font-medium flex items-center" style={{ paddingLeft: 24 * level }}>
          {isSub && <span className="mr-2 text-blue-400">↳</span>}
          {channel.name}
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm">{channel.type}</td>
        <td className="px-6 py-3 whitespace-nowrap text-sm">{channel.group}</td>
        <td className="px-6 py-3 whitespace-nowrap text-sm">{channel.isActive ? 'Yes' : 'No'}</td>
        <td className="px-6 py-3 whitespace-nowrap text-sm">{channel.createdAt ? formatDate(channel.createdAt) : '-'}</td>
        <td className="px-6 py-3 whitespace-nowrap text-sm">
          <div className="flex space-x-2">
            <Button variant="primary" size="small" onClick={() => { handleEdit(channel); }}>Edit</Button>
            <Button variant="danger" size="small" onClick={() => handleDeleteClick(channel._id || '')}>Delete</Button>
          </div>
        </td>
      </tr>,
      ...getSubChannels(channel._id || '').flatMap((sub) => renderChannelRow(sub, level + 1)),
    ];
  };

  // Add state for dynamic form logic
  const [isParent, setIsParent] = useState(false);
  const [allowedSubTypes, setAllowedSubTypes] = useState<string[]>([]);

  // Watch parentChannelId to determine if this is a sub-channel
  const parentChannelId = watch('parentChannelId');
  useEffect(() => {
    if (parentChannelId) {
      setIsParent(false);
      setAllowedSubTypes([]);
    }
  }, [parentChannelId]);

  // Watch type for standalone
  const type = watch('type');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Channels Management</h1>
        <Button onClick={() => { setIsModalOpen(true); setEditingChannel(null); }} size="large" className="shadow-md">+ Add Channel</Button>
      </div>
      {successMessage && <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />}
      {error && <ErrorAlert message={error} />}
      {/* Channels table - grouped by category and hierarchy */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {groupedChannels.map(({ group, channels: groupChannels }) => (
            <div key={group} className="mb-10">
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mr-2">
                  {group.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-gray-400 text-xs">{groupChannels.length} channels</span>
              </div>
              <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Active</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {groupChannels.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-6 text-gray-400">No channels</td></tr>
                    ) : (
                      groupChannels.flatMap((ch) => renderChannelRow(ch))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-4"
          />
        </>
      )}
      {/* Create/Edit Modal - beautiful, modern, clean */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingChannel(null); }} title={editingChannel ? 'Edit Channel' : 'Add New Channel'} size="lg">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="name" label="Channel Name" error={errors.name?.message} placeholder="e.g. General, Announcements" />
              <FormField name="group" label="Category" type="select" error={errors.group?.message}>
                <option value="getting-started">Getting Started</option>
                <option value="community">Community</option>
                <option value="hackathons">Hackathons</option>
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="parentChannelId" label="Parent Channel" type="select" error={errors.parentChannelId?.message}>
                <option value="">None (Top-level)</option>
                {channels.filter(c => !c.parentChannelId && (!editingChannel || c._id !== editingChannel._id)).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </FormField>
              <div className="flex items-center text-xs text-gray-500 mt-2 md:mt-0">
                <InformationCircleIcon className="h-5 w-5 mr-1 text-blue-400" />
                If selected, this channel will be a sub-channel (chat/announcement/showcase only).
              </div>
            </div>
            {!parentChannelId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel Type</label>
                  <div className="flex items-center space-x-6 mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" checked={isParent} onChange={() => setIsParent(true)} className="mr-2 accent-blue-600" />
                      <span className="font-medium">Parent (can have sub-channels)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" checked={!isParent} onChange={() => setIsParent(false)} className="mr-2 accent-blue-600" />
                      <span className="font-medium">Standalone (pick function)</span>
                    </label>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <InformationCircleIcon className="h-5 w-5 mr-1 text-blue-400" />
                    Parent channels can have sub-channels. Standalone channels must pick a function.
                  </div>
                </div>
                {isParent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Sub-Channel Types</label>
                    <div className="flex space-x-4 mt-2">
                      {['text', 'announcement', 'readonly'].map((t) => (
                        <label key={t} className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={allowedSubTypes.includes(t)} onChange={() => setAllowedSubTypes((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className="mr-2 accent-blue-600" />
                          <span className="font-medium">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <InformationCircleIcon className="h-5 w-5 mr-1 text-blue-400" />
                      Select which types of sub-channels this parent can have.
                    </div>
                  </div>
                )}
              </div>
            )}
            {((!parentChannelId && !isParent) || parentChannelId) && (
              <FormField name="type" label="Function" type="select" error={errors.type?.message}>
                <option value="text">Chat</option>
                <option value="announcement">Announcement</option>
                <option value="readonly">Showcase</option>
              </FormField>
            )}
            <FormField name="description" label="Description" type="textarea" error={errors.description?.message} placeholder="Describe the purpose of this channel..." rows={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="createdBy" label="Creator ID" error={errors.createdBy?.message} placeholder="User ID of creator" />
              <FormField name="isActive" label="Active" type="checkbox" error={errors.isActive?.message} />
            </div>
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2 text-gray-700 flex items-center"><InformationCircleIcon className="h-5 w-5 mr-2 text-blue-400" />Permissions</h3>
              <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0">
                <FormField name="permissions.canMessage" label="Can Message" type="checkbox" error={errors.permissions?.canMessage?.message} />
                <FormField name="permissions.canRead" label="Can Read" type="checkbox" error={errors.permissions?.canRead?.message} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button" size="large">Cancel</Button>
              <Button type="submit" isLoading={actionLoading} loadingText="Saving..." size="large">{editingChannel ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </FormProvider>
      </Modal>
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