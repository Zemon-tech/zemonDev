import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, ExternalLink, Plus, Hash, Loader2, AlertCircle } from 'lucide-react';
import { useArenaShowcase } from '@/hooks/useArenaShowcase';
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

  // Auto-rotating carousel component
  const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      if (images.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }, [images.length]);

    if (!images || images.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full text-base-content/30 text-4xl">
          <Hash className="w-8 h-8" />
        </div>
      );
    }

    if (images.length === 1) {
      return (
        <img
          src={images[0]}
          alt={title}
          className="object-cover w-full h-full"
        />
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <motion.img
            key={index}
            src={image}
            alt={`${title} - Image ${index + 1}`}
            className="absolute inset-0 object-cover w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.05
            }}
            transition={{ 
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 }
            }}
          />
        ))}
      </div>
    );
  };

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
              className="group"
              style={{ maxWidth: 340, minWidth: 0 }}
            >
              <div className="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200 h-64 flex flex-col min-h-0 hover:-translate-y-1 hover:border-primary/40">
                                 {/* Image Thumbnail */}
                 <figure className="h-24 w-full bg-base-200 overflow-hidden flex items-center justify-center">
                   <ImageCarousel images={project.images || []} title={project.title} />
                 </figure>
                {/* Card Body */}
                <div className="card-body flex-1 flex flex-col px-3 py-2 gap-1 min-h-0">
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
                  <h3 className="card-title text-base-content text-sm truncate line-clamp-1" title={project.title}>{project.title}</h3>
                  {/* Description (truncated) */}
                  {project.description && (
                    <p className="text-xs text-base-content/70 line-clamp-2 min-h-0" title={project.description}>{project.description}</p>
                  )}
                  {/* Actions */}
                  <div className="card-actions flex items-center gap-2 mt-auto pt-1 pb-1 justify-between">
                    {/* Upvote */}
                    <span title={project.hasUpvoted ? 'You upvoted' : 'Upvote'}>
                      <button
                        onClick={() => upvoteProject(project._id)}
                        disabled={project.hasUpvoted || project.hasDownvoted}
                        className={cn(
                          "btn btn-xs gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          project.hasUpvoted ? "btn-primary" : "btn-outline"
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
                          "btn btn-xs gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          project.hasDownvoted ? "btn-error" : "btn-outline"
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
                        className="btn btn-ghost btn-xs p-1.5 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors"
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
                          className="btn btn-ghost btn-xs p-1.5 rounded-full hover:bg-base-200 text-base-content/70 hover:text-primary transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </a>
                      </span>
                    )}
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-base-content">Share Your Project</h3>
              <button 
                className="btn btn-ghost btn-sm btn-circle" 
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="alert alert-error mb-6">
                <AlertCircle className="w-5 h-5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Project Title *</span>
                </label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleFormChange} 
                  className="input input-bordered w-full" 
                  placeholder="Enter your project title"
                  required 
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleFormChange} 
                  className="textarea textarea-bordered w-full" 
                  rows={4}
                  placeholder="Describe your project, technologies used, and what makes it special..."
                />
              </div>

              {/* Image URLs */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Project Images (up to 3)</span>
                  <span className="label-text-alt text-base-content/60">Optional</span>
                </label>
                <div className="space-y-2">
                  {[0, 1, 2].map(i => (
                    <input 
                      key={i} 
                      name={`image${i}`} 
                      value={form.images[i]} 
                      onChange={handleFormChange} 
                      className="input input-bordered w-full" 
                      placeholder={`Image URL ${i + 1} (optional)`} 
                    />
                  ))}
                </div>
              </div>

              {/* Repository URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Repository URL *</span>
                </label>
                <input 
                  name="gitRepositoryUrl" 
                  value={form.gitRepositoryUrl} 
                  onChange={handleFormChange} 
                  className="input input-bordered w-full" 
                  placeholder="https://github.com/username/project"
                  required 
                />
              </div>

              {/* Demo URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Demo URL *</span>
                </label>
                <input 
                  name="demoUrl" 
                  value={form.demoUrl} 
                  onChange={handleFormChange} 
                  className="input input-bordered w-full" 
                  placeholder="https://your-demo-url.com"
                  required 
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowModal(false)} 
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Submit Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseChannel; 