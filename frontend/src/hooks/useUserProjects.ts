import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getUserProjects, submitProject, updateProject, deleteProject, ProjectData } from '@/lib/settingsApi';

export interface Project {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  userId: string;
  username: string;
  upvotes: number;
  downvotes: number;
  submittedAt: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  views?: number;
  bookmarks?: number;
  isArchived?: boolean;
}

export function useUserProjects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserProjects(getToken);
      if (response?.data?.projects) {
        setProjects(response.data.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const createProject = useCallback(async (projectData: ProjectData) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await submitProject(projectData, getToken);
      if (response?.data?.project) {
        setProjects(prev => [response.data.project, ...prev]);
        return response.data.project;
      }
      throw new Error('Failed to create project');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [getToken]);

  const editProject = useCallback(async (projectId: string, projectData: Partial<ProjectData>) => {
    try {
      setUpdating(projectId);
      setError(null);
      const response = await updateProject(projectId, projectData, getToken);
      if (response?.data?.project) {
        setProjects(prev => prev.map(project => 
          project._id === projectId ? response.data.project : project
        ));
        return response.data.project;
      }
      throw new Error('Failed to update project');
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setUpdating(null);
    }
  }, [getToken]);

  const removeProject = useCallback(async (projectId: string) => {
    try {
      setDeleting(projectId);
      setError(null);
      await deleteProject(projectId, getToken);
      setProjects(prev => prev.filter(project => project._id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setDeleting(null);
    }
  }, [getToken]);

  const archiveProject = useCallback(async (projectId: string) => {
    try {
      setUpdating(projectId);
      setError(null);
      const response = await updateProject(projectId, { isArchived: true }, getToken);
      if (response?.data?.project) {
        setProjects(prev => prev.map(project => 
          project._id === projectId ? response.data.project : project
        ));
        return response.data.project;
      }
      throw new Error('Failed to archive project');
    } catch (err) {
      console.error('Error archiving project:', err);
      setError(err instanceof Error ? err.message : 'Failed to archive project');
      throw err;
    } finally {
      setUpdating(null);
    }
  }, [getToken]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    submitting,
    updating,
    deleting,
    fetchProjects,
    createProject,
    editProject,
    removeProject,
    archiveProject,
  };
}
