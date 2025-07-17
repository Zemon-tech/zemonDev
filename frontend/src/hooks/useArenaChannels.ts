import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '../services/api.service';

export interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'announcement' | 'readonly';
  group: 'getting-started' | 'community' | 'hackathons';
  unreadCount?: number;
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
  parentChannelId?: string | null; // <-- Add for sub-channel support
}

export const useArenaChannels = () => {
  const { getToken, isSignedIn } = useAuth();
  const [channels, setChannels] = useState<Record<string, Channel[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchChannels = async () => {
      try {
        const response = await ApiService.getChannels(getToken);
        setChannels(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch channels');
        console.error('Error fetching channels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [getToken, isSignedIn]);

  return { channels, loading, error };
}; 