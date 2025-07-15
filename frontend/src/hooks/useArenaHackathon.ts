import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '../services/api.service';

export interface Hackathon {
  _id: string;
  title: string;
  description: string;
  problem: string;
  constraints: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  leaderboard: Array<{
    userId: string;
    username: string;
    score: number;
    submissionTime: Date;
  }>;
}

export const useArenaHackathon = () => {
  const { getToken, isSignedIn } = useAuth();
  const [currentHackathon, setCurrentHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchHackathon = async () => {
      try {
        const response = await ApiService.getCurrentHackathon(getToken);
        setCurrentHackathon(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch hackathon');
        console.error('Error fetching hackathon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [getToken, isSignedIn]);

  return { currentHackathon, loading, error };
}; 