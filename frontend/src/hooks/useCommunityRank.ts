import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface CommunityRankData {
  percentile: number; // 1..100 (Top X%)
  rank: number | null;
  total: number;
  streak: number;
  longestStreak: number;
}

export function useCommunityRank() {
  const { getToken } = useAuth();
  const [data, setData] = useState<CommunityRankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';

  const fetchRank = async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/users/me/streak-percentile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch community rank (${res.status})`);
      const json = (await res.json()) as ApiEnvelope<CommunityRankData>;
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community rank');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRank();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  return { data, loading, error, refetch: fetchRank } as const;
}


