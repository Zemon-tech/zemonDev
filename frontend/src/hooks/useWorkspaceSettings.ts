import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getBookmarkedResources, removeBookmark } from '@/lib/settingsApi';
import { ApiService } from '@/services/api.service';

export interface BookmarkedResource {
  _id: string;
  title: string;
  description?: string;
  url?: string;
  type: 'forge' | 'nirvana-tool' | 'nirvana-news' | 'nirvana-hackathon';
  bookmarkedAt: string;
}

export interface ChannelMembership {
  userId: string;
  channelId: string;
  name: string;
  type: 'chat' | 'announcement' | 'showcase' | 'info';
  status: 'pending' | 'approved' | 'denied' | 'banned' | 'kicked';
}

export function useWorkspaceSettings() {
  const { getToken } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedResource[]>([]);
  const [channelMemberships, setChannelMemberships] = useState<ChannelMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leavingChannel, setLeavingChannel] = useState<string | null>(null);



  // Fetch bookmarked resources
  const fetchBookmarks = useCallback(async () => {
    try {
      setError(null);
      const response = await getBookmarkedResources(getToken);
      if (response?.data?.bookmarks) {
        setBookmarks(response.data.bookmarks);
      } else {
        setBookmarks([]);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
      setBookmarks([]);
    }
  }, [getToken]);

  // Fetch channel memberships
  const fetchChannelMemberships = useCallback(async () => {
    try {
      setError(null);
      const response = await ApiService.getUserChannelStatuses(getToken);
      if (response?.data) {
        // Transform the data to match our interface
        const transformedMemberships = response.data.map((item: any) => ({
          userId: item.userId,
          channelId: item.channelId,
          name: item.name,
          type: item.type,
          status: item.status,
        }));
        setChannelMemberships(transformedMemberships);
      } else {
        setChannelMemberships([]);
      }
    } catch (err) {
      console.error('Error fetching channel memberships:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch channel memberships');
      setChannelMemberships([]);
    }
  }, [getToken]);



  // Remove bookmark
  const removeBookmarkItem = useCallback(async (resourceId: string, resourceType: 'forge' | 'nirvana-tool' | 'nirvana-news' | 'nirvana-hackathon') => {
    try {
      setError(null);
      await removeBookmark(resourceId, resourceType, getToken);
      setBookmarks(prev => prev.filter(bookmark => bookmark._id !== resourceId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
      throw err;
    }
  }, [getToken]);

  // Update channel notification settings
  const updateChannelNotifications = useCallback(async (channelId: string, notifications: boolean) => {
    try {
      setError(null);
      // This would need a backend endpoint to update channel notification preferences
      // For now, we'll just update the local state
      setChannelMemberships(prev => prev.map(membership => 
        membership.channelId === channelId 
          ? { ...membership, notifications }
          : membership
      ));
    } catch (err) {
      console.error('Error updating channel notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to update channel notifications');
      throw err;
    }
  }, []);

  // Leave channel
  const leaveChannel = useCallback(async (channelId: string) => {
    try {
      setLeavingChannel(channelId);
      setError(null);
      await ApiService.leaveChannel(channelId, getToken);
      setChannelMemberships(prev => prev.filter(membership => membership.channelId !== channelId));
    } catch (err) {
      console.error('Error leaving channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave channel');
      throw err;
    } finally {
      setLeavingChannel(null);
    }
  }, [getToken]);

  // Initialize all data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBookmarks(),
          fetchChannelMemberships(),
        ]);
      } catch (err) {
        console.error('Error initializing workspace settings:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchBookmarks, fetchChannelMemberships]);

  return {
    bookmarks,
    channelMemberships,
    loading,
    error,
    leavingChannel,
    removeBookmarkItem,
    updateChannelNotifications,
    leaveChannel,
    refetch: () => {
      fetchBookmarks();
      fetchChannelMemberships();
    },
  };
}
