import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink, Share2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';

interface ShowcaseProject {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  username: string;
  submittedAt: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: {
    fullName: string;
  };
  upvotes: number;
  downvotes: number;
}

const ShowcaseManagement: React.FC = () => {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminShowcaseProjects(
        getToken,
        statusFilter === 'all' ? undefined : statusFilter,
        currentPage,
        20
      );
      
      if (response?.data?.projects) {
        setProjects(response.data.projects);
        setTotalPages(response.data.pagination.totalPages);
        setTotalProjects(response.data.pagination.totalProjects);
      } else {
        setProjects([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, currentPage]);

  const handleApprove = async (projectId: string) => {
    try {
      setActionLoading(projectId);
      await ApiService.approveShowcaseProject(projectId, getToken);
      // Refresh the list
      await fetchProjects();
    } catch (err: any) {
      console.error('Error approving project:', err);
      setError(err.message || 'Failed to approve project');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (projectId: string) => {
    try {
      setActionLoading(projectId);
      await ApiService.rejectShowcaseProject(projectId, 'Rejected by admin', getToken);
      // Refresh the list
      await fetchProjects();
    } catch (err: any) {
      console.error('Error rejecting project:', err);
      setError(err.message || 'Failed to reject project');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading showcase projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-error" />
        <p className="mt-2 text-error">{error}</p>
        <button 
          className="btn btn-primary btn-sm mt-4"
          onClick={() => fetchProjects()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-base-content">Showcase Management</h2>
          <p className="text-base-content/70 mt-1">
            Manage and approve showcase projects submitted by users
          </p>
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          <select 
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'pending' | 'approved');
              setCurrentPage(1);
            }}
          >
            <option value="all">All Projects ({totalProjects})</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-base-content/70">
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <motion.tr
                  key={project._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-base-200/50"
                >
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base-content">{project.title}</span>
                      <span className="text-sm text-base-content/70">by {project.username}</span>
                      {project.description && (
                        <span className="text-xs text-base-content/60 mt-1 line-clamp-2">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-base-content/70">
                      {formatDate(project.submittedAt)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      project.isApproved 
                        ? 'badge-success' 
                        : 'badge-warning'
                    }`}>
                      {project.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {/* View Links */}
                      <div className="flex gap-1">
                        <a
                          href={project.gitRepositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-xs"
                          title="View Repository"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-xs"
                            title="View Demo"
                          >
                            <Share2 className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Approval Actions */}
                      {!project.isApproved && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprove(project._id)}
                            disabled={actionLoading === project._id}
                            className="btn btn-success btn-xs"
                            title="Approve Project"
                          >
                            {actionLoading === project._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(project._id)}
                            disabled={actionLoading === project._id}
                            className="btn btn-error btn-xs"
                            title="Reject Project"
                          >
                            {actionLoading === project._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-sm">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseManagement; 