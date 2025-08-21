import { logger } from './utils';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Type definitions for profile-related data
export interface IUserAnalysisHistory {
  _id: string;
  userId: string;
  problemId: {
    _id: string;
    title: string;
  };
  solutionContent?: string;
  overallScore: number;
  aiConfidence: number;
  summary: string;
  evaluatedParameters: Array<{
    name: string;
    score: number;
    justification: string;
  }>;
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    suggestions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserActiveDraft {
  _id: string;
  userId: string;
  problemId: {
    _id: string;
    title: string;
  };
  currentContent: string;
  versions?: Array<{
    content: string;
    timestamp: Date;
    description: string;
  }>;
  status: 'active' | 'archived';
  lastEdited: Date;
  autoSaveEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// A helper function to get the authorization header
const getAuthHeader = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) {
    logger.warn('No auth token available. User might be signed out.');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text();
    logger.error('API Error:', response.status, errorBody);
    
    // Try to parse error response for better error messages
    try {
      const errorData = JSON.parse(errorBody);
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    } catch (parseError) {
      // If parsing fails, use the raw error body
    }
    
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  try {
    const data = await response.json();
    // The actual data is often nested in a 'data' property
    return (data.data || data) as T;
  } catch (error) {
    logger.error('Error parsing JSON response:', error);
    throw new Error('Invalid JSON response from server.');
  }
}

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

  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response);
  } catch (error) {
    logger.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get user's recent analysis history across all problems
 * @param getToken - Function to get authentication token
 * @returns Promise<IUserAnalysisHistory[]> - Array of user's recent analyses
 */
export async function getUserAnalysisHistory(
  getToken: () => Promise<string | null>
): Promise<IUserAnalysisHistory[]> {
  return apiRequest<IUserAnalysisHistory[]>(
    '/profile/crucible/analyses',
    {},
    getToken
  );
}

/**
 * Get user's recent active drafts across all problems
 * @param getToken - Function to get authentication token
 * @returns Promise<IUserActiveDraft[]> - Array of user's active drafts
 */
export async function getUserActiveDrafts(
  getToken: () => Promise<string | null>
): Promise<IUserActiveDraft[]> {
  return apiRequest<IUserActiveDraft[]>(
    '/profile/crucible/drafts',
    {},
    getToken
  );
} 

/**
 * Get public user's recent analysis history by username
 * @param username - public username
 */
export async function getPublicUserAnalysisHistory(username: string): Promise<IUserAnalysisHistory[]> {
  const url = `${API_BASE_URL}/profile/public/${encodeURIComponent(username)}/crucible/analyses`;
  const response = await fetch(url);
  return handleResponse<IUserAnalysisHistory[]>(response);
}

/**
 * Get public user's active drafts by username
 * @param username - public username
 */
export async function getPublicUserActiveDrafts(username: string): Promise<IUserActiveDraft[]> {
  const url = `${API_BASE_URL}/profile/public/${encodeURIComponent(username)}/crucible/drafts`;
  const response = await fetch(url);
  return handleResponse<IUserActiveDraft[]>(response);
}