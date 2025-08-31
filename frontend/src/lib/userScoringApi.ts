import { logger } from './utils';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : 'http://localhost:3001/api';

// Type definitions for user scoring data
export interface UserScoringData {
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  skills: Array<{
    skill: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    progress: number;
    problemsSolved: number;
    totalPoints: number;
    averageScore: number;
    lastSolvedAt?: string;
    lastUpdated: string;
  }>;
  techStack: Array<{
    technology: string;
    category: string;
    proficiency: number;
    problemsSolved: number;
    totalPoints: number;
    averageScore: number;
    lastUsedAt?: string;
    lastUpdated: string;
  }>;
  learningProgress: Array<{
    topic: string;
    category: string;
    mastery: number;
    problemsSolved: number;
    totalPoints: number;
    averageScore: number;
    lastStudiedAt?: string;
    lastUpdated: string;
  }>;
  problemsByDifficulty: {
    easy: { solved: number; averageScore: number; totalPoints: number };
    medium: { solved: number; averageScore: number; totalPoints: number };
    hard: { solved: number; averageScore: number; totalPoints: number };
    expert: { solved: number; averageScore: number; totalPoints: number };
  };
  problemsByCategory: {
    algorithms: { solved: number; averageScore: number; totalPoints: number };
    'system-design': { solved: number; averageScore: number; totalPoints: number };
    'web-development': { solved: number; averageScore: number; totalPoints: number };
    'mobile-development': { solved: number; averageScore: number; totalPoints: number };
    'data-science': { solved: number; averageScore: number; totalPoints: number };
    devops: { solved: number; averageScore: number; totalPoints: number };
    frontend: { solved: number; averageScore: number; totalPoints: number };
    backend: { solved: number; averageScore: number; totalPoints: number };
  };
}

/**
 * Get user scoring and skill tracking data
 * @param token - Authentication token
 * @returns Promise<UserScoringData>
 */
export async function getUserScoringData(token: string): Promise<UserScoringData> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/scoring`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    logger.error('Error fetching user scoring data:', error);
    throw error;
  }
}

/**
 * Get user's top skills by points earned
 * @param skills - Array of skills from scoring data
 * @param limit - Number of top skills to return (default: 5)
 * @returns Array of top skills sorted by totalPoints
 */
export function getTopSkills(skills: UserScoringData['skills'], limit: number = 5) {
  return skills
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

/**
 * Get user's top technologies by points earned
 * @param techStack - Array of technologies from scoring data
 * @param limit - Number of top technologies to return (default: 5)
 * @returns Array of top technologies sorted by totalPoints
 */
export function getTopTechnologies(techStack: UserScoringData['techStack'], limit: number = 5) {
  return techStack
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

/**
 * Get user's learning progress by mastery level
 * @param learningProgress - Array of learning topics from scoring data
 * @param limit - Number of top topics to return (default: 5)
 * @returns Array of top learning topics sorted by mastery
 */
export function getTopLearningTopics(learningProgress: UserScoringData['learningProgress'], limit: number = 5) {
  return learningProgress
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, limit);
}

/**
 * Calculate skill level based on points and problems solved
 * @param totalPoints - Total points earned in a skill
 * @param problemsSolved - Number of problems solved in that skill
 * @returns Skill level string
 */
export function calculateSkillLevel(totalPoints: number, problemsSolved: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (problemsSolved < 3) return 'beginner';
  
  const averagePoints = totalPoints / problemsSolved;
  
  if (averagePoints >= 30 && problemsSolved >= 10) return 'expert';
  if (averagePoints >= 20 && problemsSolved >= 5) return 'advanced';
  if (averagePoints >= 10 && problemsSolved >= 3) return 'intermediate';
  
  return 'beginner';
}

/**
 * Get category breakdown for visualization
 * @param problemsByCategory - Category data from scoring
 * @returns Array of categories with solved count and total points
 */
export function getCategoryBreakdown(problemsByCategory: UserScoringData['problemsByCategory']) {
  return Object.entries(problemsByCategory)
    .map(([category, data]) => ({
      category: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      solved: data.solved,
      totalPoints: data.totalPoints,
      averageScore: data.averageScore,
    }))
    .filter(item => item.solved > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Get difficulty breakdown for visualization
 * @param problemsByDifficulty - Difficulty data from scoring
 * @returns Array of difficulties with solved count and total points
 */
export function getDifficultyBreakdown(problemsByDifficulty: UserScoringData['problemsByDifficulty']) {
  return Object.entries(problemsByDifficulty)
    .map(([difficulty, data]) => ({
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      solved: data.solved,
      totalPoints: data.totalPoints,
      averageScore: data.averageScore,
    }))
    .filter(item => item.solved > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
}
