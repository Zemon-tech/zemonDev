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
  technicalParameters?: string[];
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

export interface IAnalysisParameter {
  name: string;
  score: number;
  justification: string;
}

export interface ISolutionAnalysisResult {
  _id: string;
  userId: string;
  problemId: string;
  overallScore: number;
  aiConfidence: number;
  summary: string;
  evaluatedParameters: IAnalysisParameter[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    suggestions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
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
// Returns null if no active draft exists (404 from backend)
export async function getDraft(
    problemId: string,
    getToken: () => Promise<string | null>
): Promise<ISolutionDraft | null> {
  try {
    return await apiRequest<ISolutionDraft>(`/crucible/${problemId}/draft`, {}, getToken);
  } catch (error: any) {
    // If it's a 404 error, it means no active draft exists
    if (error.message?.includes('404') || error.message?.includes('No active draft')) {
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

// Update solution draft (auth required)
// Creates a new draft if none exists
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
): Promise<ICrucibleNote> {
  return apiRequest<ICrucibleNote>(`/crucible/${problemId}/notes`, {}, getToken);
}

// Update notes for a problem (auth required)
export async function updateNotes(
  problemId: string,
  content: string,
  tags: string[],
  getToken: () => Promise<string | null>
): Promise<ICrucibleNote> {
  return apiRequest<ICrucibleNote>(
    `/crucible/${problemId}/notes`,
    {
      method: 'PUT',
      body: JSON.stringify({ content, tags }),
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

// Submit solution for analysis (auth required)
// Enhanced error handling for analysis failures
export async function submitSolutionForAnalysis(
  problemId: string,
  getToken: () => Promise<string | null>
): Promise<{ analysisId: string }> {
  try {
    return await apiRequest<{ analysisId: string }>(
      `/crucible/${problemId}/analyze`,
      {
        method: 'POST',
      },
      getToken
    );
  } catch (error: any) {
    // Handle specific analysis errors
    if (error.message?.includes('503')) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }
    if (error.message?.includes('422')) {
      throw new Error('Unable to analyze solution. Please check your solution content and try again.');
    }
    if (error.message?.includes('500')) {
      throw new Error('Analysis failed due to a server error. Please try again.');
    }
    // Re-throw other errors
    throw error;
  }
}

// Get analysis result (auth required)
export async function getAnalysisResult(
  analysisId: string,
  getToken: () => Promise<string | null>
): Promise<ISolutionAnalysisResult> {
  return apiRequest<ISolutionAnalysisResult>(
    `/crucible/results/${analysisId}`,
    {},
    getToken
  );
} 

// Fetch latest analysis for current user/problem (auth required)
// Returns null if no analysis exists
export async function getLatestAnalysis(
  problemId: string,
  getToken: () => Promise<string | null>
): Promise<ISolutionAnalysisResult | null> {
  try {
    return await apiRequest<ISolutionAnalysisResult>(
      `/crucible/${problemId}/solutions/latest`,
      {},
      getToken
    );
  } catch (error: any) {
    // If it's a 404 error, it means no analysis exists
    if (error.message?.includes('404') || error.message?.includes('No analysis found')) {
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

// Fetch all analyses for current user/problem (auth required)
export async function getAnalysisHistory(
  problemId: string,
  getToken: () => Promise<string | null>
): Promise<ISolutionAnalysisResult[]> {
  return apiRequest<ISolutionAnalysisResult[]>(
    `/crucible/${problemId}/solutions/history`,
    {},
    getToken
  );
}

// Create a new draft for reattempting a problem (auth required)
export async function reattemptDraft(
  problemId: string,
  getToken: () => Promise<string | null>
): Promise<ISolutionDraft> {
  return apiRequest<ISolutionDraft>(
    `/crucible/${problemId}/draft/reattempt`,
    { method: 'POST' },
    getToken
  );
} 

// Fetch all versions of a draft (auth required)
export async function getDraftVersions(
  problemId: string,
  getToken: () => Promise<string | null>
): Promise<Array<{ content: string; timestamp: Date; description: string }>> {
  return apiRequest<Array<{ content: string; timestamp: Date; description: string }>>(
    `/crucible/${problemId}/draft/versions`,
    {},
    getToken
  );
} 

// Check if user has analysis for a problem and return analysis ID if exists
export async function checkUserAnalysisForProblem(
  problemId: string,
  getToken: () => Promise<string | null>
): Promise<string | null> {
  try {
    const analysis = await getLatestAnalysis(problemId, getToken);
    return analysis ? analysis._id : null;
  } catch (error: any) {
    // If there's an error (like network issues), return null to allow normal navigation
    console.warn('Error checking analysis for problem:', error);
    return null;
  }
} 