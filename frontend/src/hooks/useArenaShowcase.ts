import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '../services/api.service';
import { useNotification } from './useNotification';

export interface Project {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  username: string;
  userId: string | { _id: string; fullName: string; profilePicture?: string };
  upvotes: number;
  hasUpvoted: boolean;
  downvotes: number; // ADDED
  hasDownvoted: boolean; // ADDED
  submittedAt: Date;
}

export const useArenaShowcase = () => {
  const { getToken, isSignedIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasterRef, showSuccess, showError } = useNotification();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getShowcaseProjects();
      const userId = isSignedIn && response?.data?.userId ? response.data.userId : null;
      if (response?.data?.projects && Array.isArray(response.data.projects)) {
        setProjects(response.data.projects.map((project: any) => ({
          ...project,
          hasUpvoted: userId ? (project.upvotedBy || []).some((id: string) => id === userId) : false,
          hasDownvoted: userId ? (project.downvotedBy || []).some((id: string) => id === userId) : false,
        })));
      } else {
        setProjects([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) return;
    fetchProjects();
  }, [getToken, isSignedIn]);

  const upvoteProject = async (projectId: string) => {
    try {
      const project = projects.find(p => p._id === projectId);
      if (!project) return;

      // If already upvoted, remove the upvote
      if (project.hasUpvoted) {
        const response = await ApiService.removeUpvoteProject(projectId, getToken);
        if (response?.data) {
          setProjects(prev => prev.map(project => 
            project._id === projectId 
              ? { 
                  ...project, 
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  hasUpvoted: response.data.hasUpvoted,
                  hasDownvoted: response.data.hasDownvoted
                }
              : project
          ));
          showSuccess('Upvote removed successfully');
        }
      } else {
        // Add upvote (backend will handle removing downvote if needed)
        const response = await ApiService.upvoteProject(projectId, getToken);
        if (response?.data) {
          setProjects(prev => prev.map(project => 
            project._id === projectId 
              ? { 
                  ...project, 
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  hasUpvoted: response.data.hasUpvoted,
                  hasDownvoted: response.data.hasDownvoted
                }
            : project
          ));
          showSuccess('Project upvoted successfully!');
        }
      }
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to upvote project:', error);
      // Show error message to user
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to upvote project';
      showError(errorMessage, 'Upvote Failed');
    }
  };

  const downvoteProject = async (projectId: string) => {
    try {
      const project = projects.find(p => p._id === projectId);
      if (!project) return;

      // If already downvoted, remove the downvote
      if (project.hasDownvoted) {
        const response = await ApiService.removeDownvoteProject(projectId, getToken);
        if (response?.data) {
          setProjects(prev => prev.map(project =>
            project._id === projectId
              ? { 
                  ...project, 
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  hasUpvoted: response.data.hasUpvoted,
                  hasDownvoted: response.data.hasDownvoted
                }
            : project
          ));
          showSuccess('Downvote removed successfully');
        }
      } else {
        // Add downvote (backend will handle removing upvote if needed)
        const response = await ApiService.downvoteProject(projectId, getToken);
        if (response?.data) {
          setProjects(prev => prev.map(project =>
            project._id === projectId
              ? { 
                  ...project, 
                  upvotes: response.data.upvotes,
                  downvotes: response.data.downvotes,
                  hasUpvoted: response.data.hasUpvoted,
                  hasDownvoted: response.data.hasDownvoted
                }
            : project
          ));
          showSuccess('Project downvoted successfully');
        }
      }
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to downvote project:', error);
      // Show error message to user
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to downvote project';
      showError(errorMessage, 'Downvote Failed');
    }
  };

  const removeDownvoteProject = async (projectId: string) => {
    try {
      const response = await ApiService.removeDownvoteProject(projectId, getToken);
      if (response?.data) {
        setProjects(prev => prev.map(project =>
          project._id === projectId
            ? { 
                ...project, 
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                hasUpvoted: response.data.hasUpvoted,
                hasDownvoted: response.data.hasDownvoted
              }
          : project
        ));
      }
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to remove downvote:', error);
      if (error.message) {
        setError(error.message);
      }
    }
  };

  const removeUpvoteProject = async (projectId: string) => {
    try {
      const response = await ApiService.removeUpvoteProject(projectId, getToken);
      if (response?.data) {
        setProjects(prev => prev.map(project =>
          project._id === projectId
            ? { 
                ...project, 
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                hasUpvoted: response.data.hasUpvoted,
                hasDownvoted: response.data.hasDownvoted
              }
          : project
        ));
      }
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to remove upvote:', error);
      if (error.message) {
        setError(error.message);
      }
    }
  };

  return { 
    projects, 
    loading, 
    error, 
    upvoteProject, 
    downvoteProject, 
    removeUpvoteProject,
    removeDownvoteProject, 
    refetch: fetchProjects,
    toasterRef
  };
}; 