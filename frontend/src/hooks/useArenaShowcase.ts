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
      if (response?.data?.projects && Array.isArray(response.data.projects)) {
        setProjects(response.data.projects);
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

  return { projects, loading, error, upvoteProject, refetch: fetchProjects };
}; 