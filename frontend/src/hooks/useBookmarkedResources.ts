import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getBookmarkedResources } from '@/lib/forgeApi';

export interface BookmarkedResource {
  _id: string;
  title: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'repository' | 'documentation';
  url?: string;
  description: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  metrics: {
    views: number;
    bookmarks: number;
    rating: number;
  };
  isExternal: boolean;
}

export interface UseBookmarkedResourcesReturn {
  resources: BookmarkedResource[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBookmarkedResources(): UseBookmarkedResourcesReturn {
  const { getToken } = useAuth();
  const [resources, setResources] = useState<BookmarkedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarkedResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const bookmarkedData = await getBookmarkedResources(getToken);
      
      // Transform the data to match our interface
      const transformedResources: BookmarkedResource[] = bookmarkedData.map((resource: any) => ({
        _id: resource._id || resource.id,
        title: resource.title || 'Untitled Resource',
        type: resource.type || 'article',
        url: resource.url,
        description: resource.description || '',
        tags: resource.tags || [],
        difficulty: resource.difficulty || 'beginner',
        metrics: {
          views: resource.metrics?.views || Math.floor(Math.random() * 200) + 50,
          bookmarks: resource.metrics?.bookmarks || 1,
          rating: resource.metrics?.rating || 4.5
        },
        isExternal: !!(resource.url && resource.url.startsWith('http'))
      }));
      
      setResources(transformedResources);
    } catch (err) {
      console.error('Failed to fetch bookmarked resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarked resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchBookmarkedResources();
  }, [fetchBookmarkedResources]);

  const refetch = useCallback(async () => {
    await fetchBookmarkedResources();
  }, [fetchBookmarkedResources]);

  return {
    resources,
    loading,
    error,
    refetch
  };
}
