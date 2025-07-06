import { useAuth } from '@clerk/clerk-react';
import { logger } from './utils';

// Type definitions
export interface ICrucibleProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  constraints: string[];
  expectedOutcome: string;
  hints?: string[];
  createdBy?: string;
  metrics?: {
    attempts: number;
    solutions: number;
    successRate: number;
  };
  estimatedTime?: number;
  learningObjectives?: string[];
  prerequisites?: Array<{ name: string; link: string }>;
  userPersona?: {
    name: string;
    journey: string;
  };
  dataAssumptions?: string[];
  edgeCases?: string[];
  relatedResources?: Array<{ title: string; link: string }>;
  subtasks?: string[];
  communityTips?: Array<{ content: string; author: string }>;
  aiPrompts?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICrucibleNote {
  _id?: string;
  userId?: string;
  problemId: string;
  content: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISolutionDraft {
  _id?: string;
  userId?: string;
  problemId: string;
  currentContent: string;
  versions?: Array<{
    content: string;
    timestamp: Date;
    description: string;
  }>;
  status?: 'active' | 'archived';
  lastEdited?: Date;
  autoSaveEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Function to get auth token from Clerk
// This needs to be called within a component using the useAuth hook
let authToken: string | null = null;

// Try to get token from localStorage if available
try {
  const storedToken = localStorage.getItem('clerk_auth_token');
  if (storedToken) {
    authToken = storedToken;
    logger.log('Auth token loaded from storage');
  }
} catch (e) {
  logger.error('Error accessing localStorage:', e);
}

export function setAuthToken(token: string | null) {
  authToken = token;
  logger.log(`Auth token ${token ? 'set' : 'cleared'}`);
  
  // Store token in localStorage for persistence
  if (token) {
    try {
      localStorage.setItem('clerk_auth_token', token);
    } catch (e) {
      logger.error('Error storing auth token:', e);
    }
  }
}

// Default fetch options to include credentials and auth token if available
function getFetchOptions() {
  const options: RequestInit = {
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Add authorization header if token is available
  if (authToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`
    };
  }

  return options;
}

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    // Handle different status codes with specific error messages
    if (response.status === 429) {
      throw new Error(`API error: 429 - Too Many Requests. Please try again later.`);
    } else if (response.status === 401 || response.status === 403) {
      throw new Error(`Unauthenticated or unauthorized. Please sign in again.`);
    } else if (response.status === 500) {
      // Check if the 500 error is due to authentication issues (common with Clerk)
      const text = await response.text();
      if (text.includes('Unauthenticated') || text.includes('Authentication') || 
          text.includes('auth') || text.includes('token')) {
        throw new Error(`Unauthenticated or unauthorized. Please sign in again.`);
      }
      throw new Error(`Server error: ${text.substring(0, 100)}...`);
    }
    
    // Try to get JSON response for error details
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (jsonError) {
      // Fallback if JSON parsing fails
      throw new Error(`API error: ${response.status}`);
    }
  }
  
  // Handle successful responses
  try {
    const rawData = await response.json();
    
    // Special case for /api/crucible endpoint
    if (response.url.endsWith('/api/crucible')) {
      // Return the challenges directly if they exist in the response
      if (rawData && rawData.data && rawData.data.challenges) {
        return rawData.data;
      }
    }
    
    // Check if the response has a data property
    if (rawData.data !== undefined) {
      return rawData.data;
    } else {
      // Return the raw response if no data property exists
      return rawData;
    }
  } catch (error) {
    logger.error('Error parsing JSON response:', error);
    throw new Error('Invalid response format from server');
  }
}

// API request helper with retry logic
async function apiRequest(url: string, options = {}, retries = 3): Promise<any> {
  try {
    const baseOptions = getFetchOptions();
    const mergedOptions = { ...baseOptions, ...options };
    
    // Merge headers properly
    if (options && (options as any).headers) {
      mergedOptions.headers = { ...baseOptions.headers, ...(options as any).headers };
    }
    
    const response = await fetch(url, mergedOptions);
    return await handleResponse(response);
  } catch (error) {
    // Handle rate limiting with exponential backoff
    if (error instanceof Error && error.message.includes('429') && retries > 0) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      logger.log(`Rate limited, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiRequest(url, options, retries - 1);
    }
    
    // Handle authentication errors
    if (error instanceof Error && 
        (error.message.includes('Unauthenticated') || 
         error.message.includes('unauthorized') ||
         error.message.includes('401') || 
         error.message.includes('403'))) {
      logger.error('Authentication error in API request:', error.message);
      // Don't clear the token here, let the authentication system handle it
    }
    
    throw error;
  }
}

// Create a simple debounce mechanism
const pendingRequests: Record<string, Promise<any>> = {};

// Debounced API request to prevent duplicate calls
async function debouncedApiRequest(url: string, options = {}, retries = 3): Promise<any> {
  const requestKey = `${url}-${JSON.stringify(options)}`;
  
  // If there's already a pending request for this exact URL and options, return that promise
  if (pendingRequests[requestKey]) {
    return pendingRequests[requestKey];
  }
  
  // Otherwise, make a new request and store it
  const requestPromise = apiRequest(url, options, retries)
    .finally(() => {
      // Clean up after request completes or fails
      delete pendingRequests[requestKey];
    });
  
  pendingRequests[requestKey] = requestPromise;
  return requestPromise;
}

// Problem endpoints
export async function getProblems(page = 1, limit = 10) {
  const response = await debouncedApiRequest(`/api/crucible?page=${page}&limit=${limit}`);
  return response;
}

export async function getProblem(problemId: string): Promise<ICrucibleProblem> {
  const response = await debouncedApiRequest(`/api/crucible/${problemId}`);
  return response;
}

// Notes endpoints
export async function getNotes(problemId: string): Promise<ICrucibleNote> {
  return apiRequest(`/api/crucible/${problemId}/notes`);
}

export async function updateNotes(problemId: string, data: Partial<ICrucibleNote>): Promise<ICrucibleNote> {
  return apiRequest(`/api/crucible/${problemId}/notes`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNotes(problemId: string): Promise<void> {
  return apiRequest(`/api/crucible/${problemId}/notes`, {
    method: 'DELETE',
  });
}

// Draft endpoints
export async function getDraft(problemId: string): Promise<ISolutionDraft> {
  return apiRequest(`/api/crucible/${problemId}/draft`);
}

export async function updateDraft(
  problemId: string,
  content: string,
  saveAsVersion = false,
  versionDescription = ''
): Promise<ISolutionDraft> {
  return apiRequest(`/api/crucible/${problemId}/draft`, {
    method: 'PUT',
    body: JSON.stringify({
      currentContent: content,
      saveAsVersion,
      versionDescription
    }),
  });
}

export async function archiveDraft(problemId: string): Promise<ISolutionDraft> {
  return apiRequest(`/api/crucible/${problemId}/draft/archive`, {
    method: 'PUT',
  });
}

export async function getDraftVersions(problemId: string): Promise<ISolutionDraft['versions']> {
  return apiRequest(`/api/crucible/${problemId}/draft/versions`);
}

// Solution submission
export async function submitSolution(problemId: string, content: string) {
  return apiRequest(`/api/crucible/${problemId}/solutions`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
} 