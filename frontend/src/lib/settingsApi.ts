

export interface ProfileUpdateData {
  fullName?: string;
  username?: string;
  profile?: {
    bio?: string;
    aboutMe?: string;
    location?: string;
    skills?: string[];
    toolsAndTech?: string[];
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me`, {
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me/password`, {
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me/skills`, {
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me`, {
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/users/me/export`, {
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