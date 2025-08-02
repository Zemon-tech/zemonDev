import { logger } from './utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('API Error:', response.status, errorBody);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  try {
    const data = await response.json();
    return (data.data || data) as T;
  } catch (error) {
    logger.error('Error parsing JSON response:', error);
    throw new Error('Invalid JSON response from server.');
  }
}

// Utility for Forge API
export async function getForgeResources({ type = '', tags = '', difficulty = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ type, tags, difficulty, page: String(page), limit: String(limit) });
  const response = await fetch(`${API_BASE_URL}/forge?${params.toString()}`);
  const result = await handleResponse<{ resources: any[] }>(response);
  return result.resources || [];
}

export async function getForgeResource(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/forge/${id}`);
  return handleResponse<any>(response);
}

/**
 * Registers a "view" for a resource.
 * This is a side-effecting call that returns the updated resource.
 */
export async function registerForgeResourceView(id: string, getToken: () => Promise<string | null>): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      console.warn('User not authenticated. View will not be registered.');
      return getForgeResource(id);
    }

    const response = await fetch(`${API_BASE_URL}/forge/${id}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    return handleResponse<any>(response);
  } catch (error) {
    console.error('Failed to register view, but fetching resource anyway:', error);
    return getForgeResource(id);
  }
}

/**
 * Bookmark or unbookmark a resource
 * @param id - Resource ID
 * @param getToken - Function to get auth token
 * @returns Promise with bookmark status
 */
export async function toggleBookmark(id: string, getToken: () => Promise<string | null>): Promise<{ isBookmarked: boolean }> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/forge/${id}/bookmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<{ isBookmarked: boolean }>(response);
  } catch (error) {
    console.error('Failed to toggle bookmark:', error);
    throw error;
  }
}

/**
 * Get user's bookmarked resources
 * @param getToken - Function to get auth token
 * @returns Promise with bookmarked resources
 */
export async function getBookmarkedResources(getToken: () => Promise<string | null>): Promise<any[]> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = await handleResponse<any>(response);
    return userData.bookmarkedResources || [];
  } catch (error) {
    console.error('Failed to get bookmarked resources:', error);
    return [];
  }
} 