import { useEffect, useMemo, useRef, useState } from 'react';

export interface StreakLeaderboardUser {
  id: string;
  name: string;
  username?: string;
  streak: number;
  longestStreak: number;
  lastVisit: string | null;
  points: number;
  avatar?: string | null;
}

export interface StreakLeaderboardItem {
  id: string;
  name: string;
  username?: string;
  streak: number;
  points: number;
  rank: number;
  avatar: string; // always present after fallback
}

interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

function buildAvatarFallback(seed: string): string {
  const safe = encodeURIComponent(seed || 'Zemon User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${safe}`;
}

export function useStreakLeaderboard(limit: number = 3) {
  const [raw, setRaw] = useState<StreakLeaderboardUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';

  const fetchLeaderboard = async (attempt = 1) => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${baseUrl}/users/leaderboard/streak?limit=${Math.max(1, Math.min(limit, 10))}`);
      if (!res.ok) throw new Error(`Failed to fetch leaderboard (${res.status})`);
      const json = (await res.json()) as ApiEnvelope<StreakLeaderboardUser[]>;
      setRaw(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      if (attempt < 2) {
        // one lightweight retry
        return fetchLeaderboard(attempt + 1);
      }
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setRaw(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, baseUrl]);

  const data: StreakLeaderboardItem[] = useMemo(() => {
    if (!raw) return [];
    return raw.map((u, idx) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      streak: u.streak,
      points: u.points ?? 0,
      rank: idx + 1,
      avatar: u.avatar || buildAvatarFallback(u.username || u.name),
    }));
  }, [raw]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchLeaderboard(),
  } as const;
}


