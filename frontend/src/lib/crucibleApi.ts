import { logger } from './utils';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

// A helper function to get the authorization header
// It uses the getToken function passed from a component with access to Clerk's auth context
const getAuthHeader = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  if (!token) {
    // This case should be handled by UI, e.g., redirecting to sign-in
    // or disabling UI elements that require auth.
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

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse<T>(response);
}

// --- API Functions ---

// Fetch all problems (public, no auth needed)
export async function getProblems(filters?: Record<string, any>): Promise<ICrucibleProblem[]> {
    const query = filters ? new URLSearchParams(filters).toString() : '';
    // This is a public endpoint, so we don't need a real getToken.
    const response = await fetch(`${API_BASE_URL}/crucible?${query}`);
    const result = await handleResponse<{ challenges: ICrucibleProblem[] }>(response);
    return result.challenges || [];
}

// Fetch a single problem (public, no auth needed)
export async function getProblem(id: string): Promise<ICrucibleProblem> {
    // This is a public endpoint, so we don't need a real getToken.
    const response = await fetch(`${API_BASE_URL}/crucible/${id}`);
    return handleResponse<ICrucibleProblem>(response);
}

// Fetch solution draft for a problem (auth required)
export async function getDraft(
    problemId: string,
    getToken: () => Promise<string | null>
): Promise<ISolutionDraft> {
  return apiRequest<ISolutionDraft>(`/crucible/${problemId}/draft`, {}, getToken);
}

// Update solution draft (auth required)
export async function updateDraft(
  problemId: string,
  content: string,
  getToken: () => Promise<string | null>
): Promise<ISolutionDraft> {
  return apiRequest<ISolutionDraft>(
    `/crucible/${problemId}/draft`,
    {
      method: 'PUT',
      body: JSON.stringify({ currentContent: content }),
    },
    getToken
  );
}

// Fetch notes for a problem (auth required)
export async function getNotes(
    problemId: string,
    getToken: () => Promise<string | null>
): Promise<ICrucibleNote[]> {
  return apiRequest<ICrucibleNote[]>(`/crucible/${problemId}/notes`, {}, getToken);
}

// Update notes for a problem (auth required)
export async function updateNotes(
  problemId: string,
  notes: { content: string, tags: string[] },
  getToken: () => Promise<string | null>
): Promise<ICrucibleNote> {
  return apiRequest<ICrucibleNote>(
    `/crucible/${problemId}/notes`,
    {
      method: 'PUT',
      body: JSON.stringify(notes),
    },
    getToken
  );
}

// Submit a final solution (auth required)
export async function submitSolution(
    problemId: string,
    content: string,
    getToken: () => Promise<string | null>
) {
    return apiRequest(
        `/crucible/${problemId}/solution`,
        {
            method: 'POST',
            body: JSON.stringify({ content }),
        },
        getToken
    );
} 