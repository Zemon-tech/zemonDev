import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '../services/api.service';

export interface Channel {
  _id: string;
  name: string;
  type: 'chat' | 'announcement' | 'showcase' | 'info';
  group: 'getting-started' | 'community' | 'hackathons';
  description?: string;
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

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getChannels(getToken);
      const fetchedChannels = response.data;

      setChannels(fetchedChannels);
      setError(null);
    } catch (err) {
      setError('Failed to fetch channels');
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;
    fetchChannels();
  }, [getToken, isSignedIn]);

  return { channels, loading, error, refetch: fetchChannels };
}; 