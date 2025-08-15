import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  getAvailableBadges, 
  getAvailableMilestones, 
  getEnhancedUserAchievements,
  getUserSkills,
  updateUserSkills,
  type Badge,
  type Milestone,
  type EnhancedUserAchievements
} from '../lib/achievementsApi';

export function useAchievements() {
  const { getToken } = useAuth();
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [availableMilestones, setAvailableMilestones] = useState<Milestone[]>([]);
  const [userAchievements, setUserAchievements] = useState<EnhancedUserAchievements | null>(null);
  const [userSkills, setUserSkills] = useState<any>(null);
  const [loading, setLoading] = useState({
    badges: false,
    milestones: false,
    achievements: false,
    skills: false
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch available badges (admin-created)
  const fetchAvailableBadges = useCallback(async () => {
    setLoading(prev => ({ ...prev, badges: true }));
    setError(null);
    
    try {
      const badges = await getAvailableBadges();
      setAvailableBadges(badges);
    } catch (err) {
      setError('Failed to fetch available badges');
      console.error('Error fetching badges:', err);
    } finally {
      setLoading(prev => ({ ...prev, badges: false }));
    }
  }, []);

  // Fetch available milestones (admin-created)
  const fetchAvailableMilestones = useCallback(async () => {
    setLoading(prev => ({ ...prev, milestones: true }));
    setError(null);
    
    try {
      const milestones = await getAvailableMilestones();
      setAvailableMilestones(milestones);
    } catch (err) {
      setError('Failed to fetch available milestones');
      console.error('Error fetching milestones:', err);
    } finally {
      setLoading(prev => ({ ...prev, milestones: false }));
    }
  }, []);

  // Fetch enhanced user achievements
  const fetchUserAchievements = useCallback(async () => {
    if (!getToken) return;
    
    setLoading(prev => ({ ...prev, achievements: true }));
    setError(null);
    
    try {
      const achievements = await getEnhancedUserAchievements(getToken);
      setUserAchievements(achievements);
    } catch (err) {
      setError('Failed to fetch user achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(prev => ({ ...prev, achievements: false }));
    }
  }, [getToken]);

  // Fetch user skills
  const fetchUserSkills = useCallback(async () => {
    if (!getToken) return;
    
    setLoading(prev => ({ ...prev, skills: true }));
    setError(null);
    
    try {
      const skills = await getUserSkills(getToken);
      setUserSkills(skills);
    } catch (err) {
      setError('Failed to fetch user skills');
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  }, [getToken]);

  // Update user skills
  const updateSkills = useCallback(async (skills: string[]) => {
    if (!getToken) return;
    
    setLoading(prev => ({ ...prev, skills: true }));
    setError(null);
    
    try {
      const updatedSkills = await updateUserSkills(skills, getToken);
      setUserSkills(updatedSkills);
      return updatedSkills;
    } catch (err) {
      setError('Failed to update user skills');
      console.error('Error updating skills:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  }, [getToken]);

  // Fetch all achievement data
  const fetchAllAchievementData = useCallback(async () => {
    await Promise.all([
      fetchAvailableBadges(),
      fetchAvailableMilestones(),
      fetchUserAchievements(),
      fetchUserSkills()
    ]);
  }, [fetchAvailableBadges, fetchAvailableMilestones, fetchUserAchievements, fetchUserSkills]);

  // Initial data fetch
  useEffect(() => {
    fetchAllAchievementData();
  }, [fetchAllAchievementData]);

  // Refresh functions
  const refreshBadges = fetchAvailableBadges;
  const refreshMilestones = fetchAvailableMilestones;
  const refreshAchievements = fetchUserAchievements;
  const refreshSkills = fetchUserSkills;
  const refreshAll = fetchAllAchievementData;

  return {
    // Data
    availableBadges,
    availableMilestones,
    userAchievements,
    userSkills,
    
    // Loading states
    loading,
    isLoading: loading.badges || loading.milestones || loading.achievements || loading.skills,
    
    // Error state
    error,
    
    // Actions
    refreshBadges,
    refreshMilestones,
    refreshAchievements,
    refreshSkills,
    refreshAll,
    updateSkills,
    
    // Helper functions
    getBadgeById: (id: string) => availableBadges.find(badge => badge._id === id),
    getMilestoneById: (id: string) => availableMilestones.find(milestone => milestone._id === id),
    getUserBadgeById: (id: string) => userAchievements?.badges.find(badge => badge.id === id),
    getUserMilestoneById: (id: string) => userAchievements?.milestones.find(milestone => milestone.id === id),
  };
}
