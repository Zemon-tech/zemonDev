

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'crucible' | 'forge' | 'arena' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  iconUrl?: string;
}

export interface Milestone {
  _id: string;
  name: string;
  description: string;
  category: 'problems' | 'resources' | 'collaboration' | 'streak';
  thresholds: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  points: number;
  iconUrl?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'crucible' | 'forge' | 'arena' | 'streak' | 'special';
  earnedAt: string;
  metadata?: Record<string, any>;
  badgeDetails?: Badge | null;
}

export interface UserMilestone {
  id: string;
  name: string;
  description: string;
  achievedAt: string;
  category: 'problems' | 'resources' | 'collaboration' | 'streak';
  value: number;
  milestoneDetails?: Milestone | null;
}

export interface NextMilestone {
  milestoneId: string;
  name: string;
  description: string;
  category: 'problems' | 'resources' | 'collaboration' | 'streak';
  currentValue: number;
  nextLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  nextThreshold: number | null;
  progress: number;
  isAchieved: boolean;
}

export interface UserCertificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  category: 'technical' | 'academic' | 'professional' | 'platform';
  thumbnailUrl?: string;
  verified: boolean;
}

export interface EnhancedUserAchievements {
  badges: UserBadge[];
  milestones: UserMilestone[];
  certificates: UserCertificate[];
  nextMilestones: NextMilestone[];
  stats: {
    totalBadges: number;
    totalCertificates: number;
    reputation: number;
    problemsSolved: number;
    totalScore: number;
    skillMastery: number;
    lastProblemSolved?: string;
  };
}

/**
 * Get all available badges (admin-created)
 */
export async function getAvailableBadges(): Promise<Badge[]> {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/badges`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch available badges');
    }
    
    const data = await response.json();
    return data.data.badges || [];
  } catch (error) {
    console.error('Error fetching available badges:', error);
    return [];
  }
}

/**
 * Get all available milestones (admin-created)
 */
export async function getAvailableMilestones(): Promise<Milestone[]> {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/milestones`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch available milestones');
    }
    
    const data = await response.json();
    return data.data.milestones || [];
  } catch (error) {
    console.error('Error fetching available milestones:', error);
    return [];
  }
}

/**
 * Get enhanced user achievements with full badge/milestone details
 */
export async function getEnhancedUserAchievements(
  getToken: () => Promise<string | null>
): Promise<EnhancedUserAchievements | null> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/achievements/enhanced`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch enhanced achievements');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching enhanced achievements:', error);
    return null;
  }
}

/**
 * Get user skills and progress
 */
export async function getUserSkills(
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/skills`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user skills');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return null;
  }
}

/**
 * Update user skills
 */
export async function updateUserSkills(
  skills: string[],
  getToken: () => Promise<string | null>
): Promise<any> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/skills`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ skills }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user skills');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating user skills:', error);
    throw error;
  }
}
