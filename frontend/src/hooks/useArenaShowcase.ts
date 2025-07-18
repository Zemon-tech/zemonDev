import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '../services/api.service';

export interface Project {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  username: string;
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getShowcaseProjects(getToken);
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
      await ApiService.upvoteProject(projectId, getToken);
      setProjects(prev => prev.map(project => 
        project._id === projectId 
          ? { ...project, upvotes: project.upvotes + 1, hasUpvoted: true }
          : project
      ));
    } catch (error) {
      console.error('Failed to upvote project:', error);
    }
  };

  const downvoteProject = async (projectId: string) => {
    try {
      await ApiService.downvoteProject(projectId, getToken);
      setProjects(prev => prev.map(project =>
        project._id === projectId
          ? { ...project, downvotes: project.downvotes + 1, hasDownvoted: true }
          : project
      ));
    } catch (error) {
      console.error('Failed to downvote project:', error);
    }
  };

  const removeDownvoteProject = async (projectId: string) => {
    try {
      await ApiService.removeDownvoteProject(projectId, getToken);
      setProjects(prev => prev.map(project =>
        project._id === projectId
          ? { ...project, downvotes: project.downvotes - 1, hasDownvoted: false }
          : project
      ));
    } catch (error) {
      console.error('Failed to remove downvote:', error);
    }
  };

  return { projects, loading, error, upvoteProject, downvoteProject, removeDownvoteProject, refetch: fetchProjects };
}; 