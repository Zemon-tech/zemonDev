import React, { useEffect, useState } from 'react';

interface ProjectShowcase {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  userId: string;
  username: string;
  upvotes: number;
  upvotedBy: string[];
  downvotes: number;
  downvotedBy: string[];
  submittedAt: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

interface ApiResponse {
  projects: ProjectShowcase[];
  page: number;
  limit: number;
  total: number;
}

const ShowcasePage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectShowcase[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchProjects = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/showcase?page=${pageNum}&limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch showcase projects');
      const data = await res.json();
      setProjects(data.data.projects);
      setPage(data.data.page);
      setTotal(data.data.total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`http://localhost:3001/api/dev-admin/showcase/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) throw new Error('Failed to approve project');
      await fetchProjects(page);
    } catch (err: any) {
      alert(err.message || 'Approve failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/showcase/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete project');
      fetchProjects(page);
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Showcase</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 mb-4">
            <thead>
              <tr>
                <th className="px-2 py-1 border">Title</th>
                <th className="px-2 py-1 border">Username</th>
                <th className="px-2 py-1 border">Git Repo</th>
                <th className="px-2 py-1 border">Demo URL</th>
                <th className="px-2 py-1 border">Upvotes</th>
                <th className="px-2 py-1 border">Downvotes</th>
                <th className="px-2 py-1 border">Approved</th>
                <th className="px-2 py-1 border">Submitted At</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj._id}>
                  <td className="px-2 py-1 border">{proj.title}</td>
                  <td className="px-2 py-1 border">{proj.username}</td>
                  <td className="px-2 py-1 border max-w-xs truncate">
                    <a href={proj.gitRepositoryUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {proj.gitRepositoryUrl}
                    </a>
                  </td>
                  <td className="px-2 py-1 border max-w-xs truncate">
                    <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {proj.demoUrl}
                    </a>
                  </td>
                  <td className="px-2 py-1 border text-center">{proj.upvotes}</td>
                  <td className="px-2 py-1 border text-center">{proj.downvotes}</td>
                  <td className="px-2 py-1 border text-center">{proj.isApproved ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1 border">{new Date(proj.submittedAt).toLocaleString()}</td>
                  <td className="px-2 py-1 border flex gap-2">
                    {!proj.isApproved && (
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                        onClick={() => handleApprove(proj._id)}
                        disabled={approvingId === proj._id}
                      >
                        {approvingId === proj._id ? 'Approving...' : 'Approve'}
                      </button>
                    )}
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(proj._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShowcasePage; 