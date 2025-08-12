

export interface ProfileUpdateData {
  fullName?: string;
  username?: string;
  profile?: {
    bio?: string;
    aboutMe?: string;
    location?: string;
    skills?: string[];
    toolsAndTech?: string[];
    skillProgress?: Array<{
      skill: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      progress: number;
    }>;
  };
  achievements?: {
    badges?: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: 'crucible' | 'forge' | 'arena' | 'streak' | 'special';
      metadata?: Record<string, any>;
    }>;
    certificates?: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      credentialUrl?: string;
      category: 'technical' | 'academic' | 'professional' | 'platform';
    }>;
    milestones?: Array<{
      id: string;
      name: string;
      description: string;
      category: 'problems' | 'resources' | 'collaboration' | 'streak';
      value: number;
    }>;
  };
  socialLinks?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  college?: {
    collegeName?: string;
    course?: string;
    branch?: string;
    year?: number;
    city?: string;
    state?: string;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface SkillsUpdateData {
  skills: string[];
}

/**
 * Update user profile information
 */
export async function updateProfile(
  data: ProfileUpdateData,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Change user password
 */
export async function changePassword(
  data: PasswordChangeData,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

/**
 * Update user skills
 */
export async function updateSkills(
  data: SkillsUpdateData,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/skills`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update skills');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating skills:', error);
    throw error;
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

/**
 * Export user data
 */
export async function exportUserData(
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

// Project Management APIs
export interface ProjectData {
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  isArchived?: boolean;
}

/**
 * Get user's projects
 */
export async function getUserProjects(
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch projects');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

/**
 * Submit a new project
 */
export async function submitProject(
  data: ProjectData,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/arena/showcase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting project:', error);
    throw error;
  }
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  data: Partial<ProjectData>,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/arena/showcase/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/arena/showcase/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Workspace Management APIs
export interface WorkspacePreferences {
  editorSettings: {
    fontSize: number;
    theme: string;
    wordWrap: boolean;
  };
  layout: {
    showProblemSidebar: boolean;
    showChatSidebar: boolean;
    sidebarWidths: {
      problem: number;
      chat: number;
    };
  };
  notifications: {
    channelUpdates: boolean;
    projectApprovals: boolean;
    mentions: boolean;
  };
}

/**
 * Get user's workspace preferences
 */
export async function getWorkspacePreferences(
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/workspace-preferences`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch workspace preferences');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workspace preferences:', error);
    throw error;
  }
}

/**
 * Update workspace preferences
 */
export async function updateWorkspacePreferences(
  data: WorkspacePreferences,
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/workspace-preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update workspace preferences');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating workspace preferences:', error);
    throw error;
  }
}

/**
 * Get user's bookmarked resources
 */
export async function getBookmarkedResources(
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/bookmarks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bookmarks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
}

/**
 * Remove bookmark
 */
export async function removeBookmark(
  resourceId: string,
  resourceType: 'forge' | 'nirvana-tool' | 'nirvana-news' | 'nirvana-hackathon',
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/bookmarks/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ resourceType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove bookmark');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
} 