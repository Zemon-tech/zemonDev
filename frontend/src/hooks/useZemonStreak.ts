import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastVisit: Date | null;
  todayVisited: boolean;
}

export const useZemonStreak = () => {
  const { getToken } = useAuth();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch streak info
  const fetchStreakInfo = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me/streak`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch streak info');
      }

      const data = await response.json();
      setStreakInfo(data.data);
    } catch (err) {
      console.error('Error fetching streak info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch streak info');
    } finally {
      setLoading(false);
    }
  };

  // Record daily visit
  const recordDailyVisit = async () => {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me/visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStreakInfo(data.data);
      }
    } catch (err) {
      console.error('Error recording daily visit:', err);
    }
  };

  // Auto-record visit on mount if not visited today
  useEffect(() => {
    const initializeStreak = async () => {
      await fetchStreakInfo();
    };

    initializeStreak();
  }, []);

  // Record visit if not visited today (separate effect to avoid race condition)
  useEffect(() => {
    if (streakInfo && !streakInfo.todayVisited && !loading) {
      recordDailyVisit();
    }
  }, [streakInfo, loading]);

  return {
    streakInfo,
    loading,
    error,
    recordDailyVisit,
    refetch: fetchStreakInfo,
  };
}; 