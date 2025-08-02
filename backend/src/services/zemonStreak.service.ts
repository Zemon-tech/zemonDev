import User from '../models/user.model';
import { Types } from 'mongoose';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastVisit: Date | null;
  todayVisited: boolean;
}

/**
 * Record a daily visit and update streak counters
 * @param userId - The user's ID
 * @returns Updated streak information
 */
export const recordDailyVisit = async (userId: string | Types.ObjectId): Promise<StreakInfo> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  let currentStreak = user.zemonStreak || 0;
  let longestStreak = user.longestZemonStreak || 0;
  let todayVisited = false;

  // Check if user already visited today
  if (user.lastZemonVisit) {
    const lastVisitDate = new Date(user.lastZemonVisit);
    const lastVisitDay = new Date(lastVisitDate.getFullYear(), lastVisitDate.getMonth(), lastVisitDate.getDate());
    
    if (lastVisitDay.getTime() === today.getTime()) {
      // User already visited today, return current info
      todayVisited = true;
      return {
        currentStreak,
        longestStreak,
        lastVisit: user.lastZemonVisit,
        todayVisited
      };
    }
  }

  // Check if this is a consecutive day
  if (user.lastZemonVisit) {
    const lastVisitDate = new Date(user.lastZemonVisit);
    const lastVisitDay = new Date(lastVisitDate.getFullYear(), lastVisitDate.getMonth(), lastVisitDate.getDate());
    
    if (lastVisitDay.getTime() === yesterday.getTime()) {
      // Consecutive day - increment streak
      currentStreak += 1;
    } else {
      // Streak broken - reset to 1
      currentStreak = 1;
    }
  } else {
    // First visit ever
    currentStreak = 1;
  }

  // Update longest streak if current streak is longer
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Update user in database
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        zemonStreak: currentStreak,
        longestZemonStreak: longestStreak,
        lastZemonVisit: now
      }
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('Failed to update user streak');
  }

  return {
    currentStreak,
    longestStreak,
    lastVisit: now,
    todayVisited: false
  };
};

/**
 * Get current streak information without recording a visit
 * @param userId - The user's ID
 * @returns Current streak information
 */
export const getStreakInfo = async (userId: string | Types.ObjectId): Promise<StreakInfo> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let todayVisited = false;
  let currentStreak = user.zemonStreak || 0;
  
  // Check if user visited today
  if (user.lastZemonVisit) {
    const lastVisitDate = new Date(user.lastZemonVisit);
    const lastVisitDay = new Date(lastVisitDate.getFullYear(), lastVisitDate.getMonth(), lastVisitDate.getDate());
    
    if (lastVisitDay.getTime() === today.getTime()) {
      todayVisited = true;
      // If user visited today, ensure they have at least 1 streak
      if (currentStreak === 0) {
        currentStreak = 1;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: user.longestZemonStreak || 0,
    lastVisit: user.lastZemonVisit || null,
    todayVisited
  };
};

/**
 * Reset user's streak (for testing or admin purposes)
 * @param userId - The user's ID
 * @returns Updated streak information
 */
export const resetStreak = async (userId: string | Types.ObjectId): Promise<StreakInfo> => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        zemonStreak: 0,
        longestZemonStreak: 0,
        lastZemonVisit: null
      }
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error('Failed to reset user streak');
  }

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastVisit: null,
    todayVisited: false
  };
}; 