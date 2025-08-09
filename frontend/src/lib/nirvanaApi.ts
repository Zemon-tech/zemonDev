import { logger } from './utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Type definitions
export interface INirvanaFeedItem {
  _id: string;
  type: 'hackathon' | 'news' | 'tool';
  title: string;
  content: string;
  timestamp: Date;
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
    profilePicture?: string;
    role?: string;
  };
  metadata?: {
    hackathonName?: string;
    prize?: string;
    participants?: number;
    category?: string;
    tags?: string[];
    link?: string;
    deadline?: Date;
    status?: string;
    toolName?: string;
    rating?: number;
    views?: number;
    progress?: number;
    image?: string;
  };
  reactions: {
    likes: number;
    shares: number;
    bookmarks: number;
  };
  userReactions: {
    likes: boolean;
    shares: boolean;
    bookmarks: boolean;
  };
  isPinned: boolean;
  isVerified: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface INirvanaFeedResponse {
  items: INirvanaFeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface INirvanaHackathonData {
  title: string;
  content: string;
  description: string;
  prize: string;
  participants: number;
  category: string;
  tags: string[];
  deadline: Date;
  status: string;
  hackathonName: string;
  link?: string;
  image?: string;
}

export interface INirvanaNewsData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  progress?: number;
  link?: string;
  image?: string;
}

export interface INirvanaToolData {
  title: string;
  content: string;
  toolName: string;
  category: string;
  tags: string[];
  rating: number;
  views: number;
  link?: string;
  image?: string;
}

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

// Helper function to get authorization header
const getAuthHeader = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) {
    logger.warn('No auth token available. User might be signed out.');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<T> {
  const authHeader = await getAuthHeader(getToken);
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (authHeader.Authorization) {
    headers.set('Authorization', authHeader.Authorization);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

// Get Nirvana feed with filters and pagination
export async function getNirvanaFeed(
  getToken: () => Promise<string | null>,
  params: {
    type?: 'hackathon' | 'news' | 'tool';
    page?: number;
    limit?: number;
  } = {}
): Promise<INirvanaFeedResponse> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.append('type', params.type);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  
  const queryString = searchParams.toString();
  const endpoint = `/nirvana/feed${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<INirvanaFeedResponse>(endpoint, {}, getToken);
}

// Create new hackathon
export async function createNirvanaHackathon(
  data: INirvanaHackathonData,
  getToken: () => Promise<string | null>
): Promise<INirvanaFeedItem> {
  return apiRequest<INirvanaFeedItem>('/nirvana/hackathons', {
    method: 'POST',
    body: JSON.stringify(data),
  }, getToken);
}

// Create new news
export async function createNirvanaNews(
  data: INirvanaNewsData,
  getToken: () => Promise<string | null>
): Promise<INirvanaFeedItem> {
  return apiRequest<INirvanaFeedItem>('/nirvana/news', {
    method: 'POST',
    body: JSON.stringify(data),
  }, getToken);
}

// Create new tool
export async function createNirvanaTool(
  data: INirvanaToolData,
  getToken: () => Promise<string | null>
): Promise<INirvanaFeedItem> {
  return apiRequest<INirvanaFeedItem>('/nirvana/tools', {
    method: 'POST',
    body: JSON.stringify(data),
  }, getToken);
}

// Update reaction (increment/decrement). Backend may or may not support toggle.
// We accept an action to remain compatible without backend changes.
export async function updateNirvanaReaction(
  type: 'hackathon' | 'news' | 'tool',
  id: string,
  reactionType: 'likes' | 'shares' | 'bookmarks',
  action: 'increment' | 'decrement',
  getToken: () => Promise<string | null>
): Promise<{ success: boolean; newCount?: number } & Record<string, any>> {
  // Primary request with action (compatible with existing backend)
  try {
    return await apiRequest<{ success: boolean; newCount?: number } & Record<string, any>>(
      `/nirvana/${type}/${id}/reaction`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reactionType, action }),
      },
      getToken
    );
  } catch (err) {
    // Fallback: try without action if backend expects toggle
    try {
      return await apiRequest<{ success: boolean; newCount?: number } & Record<string, any>>(
        `/nirvana/${type}/${id}/reaction`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reactionType }),
        },
        getToken
      );
    } catch (err2) {
      throw err2;
    }
  }
}

// Toggle pin status (admin/moderator only)
export async function toggleNirvanaPin(
  type: 'hackathon' | 'news' | 'tool',
  id: string,
  getToken: () => Promise<string | null>
): Promise<{ success: boolean; isPinned: boolean }> {
  return apiRequest<{ success: boolean; isPinned: boolean }>(`/nirvana/${type}/${id}/pin`, {
    method: 'PATCH',
  }, getToken);
}

// Toggle verification status (admin/moderator only)
export async function toggleNirvanaVerification(
  type: 'hackathon' | 'news' | 'tool',
  id: string,
  getToken: () => Promise<string | null>
): Promise<{ success: boolean; isVerified: boolean }> {
  return apiRequest<{ success: boolean; isVerified: boolean }>(`/nirvana/${type}/${id}/verify`, {
    method: 'PATCH',
  }, getToken);
}

// Update priority (admin/moderator only)
export async function updateNirvanaPriority(
  type: 'hackathon' | 'news' | 'tool',
  id: string,
  priority: 'high' | 'medium' | 'low',
  getToken: () => Promise<string | null>
): Promise<{ success: boolean; priority: string }> {
  return apiRequest<{ success: boolean; priority: string }>(`/nirvana/${type}/${id}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
  }, getToken);
}

// Update item (owner or admin/moderator only)
export async function updateNirvanaItem(
  type: 'hackathon' | 'news' | 'tool',
  id: string,
  data: any,
  getToken: () => Promise<string | null>
): Promise<any> {
  return apiRequest<any>(`/nirvana/${type}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, getToken);
}

// Delete item (owner or admin/moderator only)
export async function deleteNirvanaItem(
  type: 'hackathon' | 'news' | 'tool',
  id: string,
  getToken: () => Promise<string | null>
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/nirvana/${type}/${id}`, {
    method: 'DELETE',
  }, getToken);
}
