import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, ExternalLink, Plus, Hash, Loader2, AlertCircle } from 'lucide-react';
import { useArenaShowcase, Project as ShowcaseProject } from '@/hooks/useArenaShowcase';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';

const ShowcaseChannel: React.FC = () => {
  const { projects, loading, error, upvoteProject, downvoteProject, removeDownvoteProject, refetch } = useArenaShowcase();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    images: ['', '', ''],
    gitRepositoryUrl: '',
    demoUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('image')) {
      const idx = parseInt(name.replace('image', ''));
      setForm((f) => ({ ...f, images: f.images.map((img, i) => (i === idx ? value : img)) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isSignedIn || !user) {
      setFormError('You must be signed in to submit a project.');
      return;
    }
    if (!form.title || !form.gitRepositoryUrl || !form.demoUrl) {
      setFormError('Title, repository URL, and demo URL are required.');
      return;
    }
    setSubmitting(true);
    try {
      await ApiService.submitShowcaseProject({
        title: form.title,
        description: form.description,
        images: form.images.filter(Boolean),
        gitRepositoryUrl: form.gitRepositoryUrl,
        demoUrl: form.demoUrl,
        userId: user.id,
        username: user.username || user.firstName || 'user',
        upvotes: 0,
        upvotedBy: [],
        submittedAt: new Date().toISOString(),
        isApproved: false,
      }, getToken);
      setShowModal(false);
      setForm({ title: '', description: '', images: ['', '', ''], gitRepositoryUrl: '', demoUrl: '' });
      refetch();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <AlertCircle className="w-8 h-8 text-error" />
        <p className="mt-2 text-error">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/70 col-span-full">
            <p>No projects have been shared yet.</p>
            <p className="mt-2">Be the first to share your work!</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group bg-white rounded-xl border border-base-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col min-h-0 h-64", // fixed height
                "hover:-translate-y-1 hover:border-primary/40"
              )}
              style={{ maxWidth: 340, minWidth: 0 }}
            >
              {/* Image Thumbnail */}
              <div className="h-24 w-full bg-base-200 rounded-t-xl overflow-hidden flex items-center justify-center">
                {project.images && project.images[0] ? (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-base-content/30 text-4xl">
                    <Hash className="w-8 h-8" />
                  </div>
                )}
              </div>
              {/* Card Content */}
              <div className="flex-1 flex flex-col px-3 py-2 gap-1 min-h-0">
                {/* Header: Avatar, Username, Date */}
                <div className="flex items-center gap-2 text-xs text-base-content/70 mb-0 min-w-0">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>{project.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-base-content/80 truncate max-w-[80px]">{project.username}</span>
                  <span className="mx-1">•</span>
                  <span className="truncate max-w-[60px]">{new Date(project.submittedAt).toLocaleDateString()}</span>
                </div>
                {/* Title */}
                <h3 className="font-semibold text-base-content text-sm truncate line-clamp-1" title={project.title}>{project.title}</h3>
                {/* Description (truncated) */}
                {project.description && (
                  <p className="text-xs text-base-content/70 line-clamp-2 min-h-0" title={project.description}>{project.description}</p>
                )}
                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-1 pb-1 justify-between">
                  {/* Upvote */}
                  <span title={project.hasUpvoted ? 'You upvoted' : 'Upvote'}>
                    <button
                      onClick={() => upvoteProject(project._id)}
                      disabled={project.hasUpvoted || project.hasDownvoted}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-base-200",
                        project.hasUpvoted ? "bg-primary/10 text-primary border-primary" : "bg-base-100 text-base-content/70 hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{project.upvotes}</span>
                    </button>
                  </span>
                  {/* Downvote */}
                  <span title={project.hasDownvoted ? 'You downvoted' : 'Downvote'}>
                    <button
                      onClick={() => project.hasDownvoted ? removeDownvoteProject(project._id) : downvoteProject(project._id)}
                      disabled={project.hasUpvoted}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-base-200",
                        project.hasDownvoted ? "bg-red-100 text-red-600 border-red-300" : "bg-base-100 text-base-content/70 hover:bg-red-100 hover:text-red-600"
                      )}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{project.downvotes}</span>
                    </button>
                  </span>
                  {/* Repo */}
                  <span title="View Repository">
                    <a
                      href={project.gitRepositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </span>
                  {/* Demo */}
                  {project.demoUrl && (
                    <span title="View Demo">
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Project Button */}
      <div className="px-4 pb-6">
        <Button
          className={cn(
            "w-full bg-primary hover:bg-primary/90",
            "text-primary-content border-none",
            "flex items-center justify-center gap-2"
          )}
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Share Your Project</span>
        </Button>
      </div>
      {/* Project Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Share Your Project</h2>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input name="title" value={form.title} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full border rounded px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (up to 3)</label>
                {[0,1,2].map(i => (
                  <input key={i} name={`image${i}`} value={form.images[i]} onChange={handleFormChange} className="w-full border rounded px-3 py-2 mb-1" placeholder={`Image URL ${i+1}`} />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repository URL *</label>
                <input name="gitRepositoryUrl" value={form.gitRepositoryUrl} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Demo URL *</label>
                <input name="demoUrl" value={form.demoUrl} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseChannel; 