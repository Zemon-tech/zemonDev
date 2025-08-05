import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Share2, ExternalLink, Plus, Hash, Loader2, AlertCircle, Calendar, User, Github, Globe } from 'lucide-react';
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

  // Enhanced Image Carousel component with better aesthetics
  const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      if (images.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000); // Slightly longer interval for better UX

      return () => clearInterval(interval);
    }, [images.length]);

    if (!images || images.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-base-200 to-base-300 text-base-content/40">
          <div className="text-center">
            <Hash className="w-10 h-10 mx-auto mb-1 opacity-50" />
            <p className="text-xs font-medium">No Image</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - Image ${index + 1}`}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            draggable={false}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1 z-20">
            {images.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  index === currentImageIndex ? "bg-white/80" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}
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
      <div className="flex-1 overflow-y-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/70 col-span-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-base-200 rounded-full flex items-center justify-center">
                <Hash className="w-8 h-8 text-base-content/40" />
              </div>
              <div>
                <p className="text-lg font-semibold">No projects shared yet</p>
                <p className="text-sm mt-1">Be the first to showcase your work!</p>
              </div>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="h-full bg-base-200/80 border-base-300/50 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 overflow-hidden group/card p-0">
                {/* --- Compact Image Section --- */}
                <div className="relative h-38 w-full overflow-hidden">
                  <ImageCarousel images={project.images || []} title={project.title} />
                </div>

                              {/* --- Card Content --- */}
              <CardHeader className="pb-2 pt-2 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-base-content text-base truncate" title={project.title}>
                      {project.title}
                    </h3>
                    <span className="text-xs text-base-content/50 flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-base-content/70 line-clamp-2 mt-1" title={project.description}>
                      {project.description}
                    </p>
                  )}
                </CardHeader>

                {/* --- Card Footer: User + Actions --- */}
                <CardFooter className="flex items-center justify-between gap-2 px-4 pb-3 pt-2">
                  {/* User info, compact */}
                  <div className="flex items-center gap-1 min-w-0">
                    <Avatar className="w-5 h-5 border border-base-200">
                      <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                        {project.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-base-content/70 truncate max-w-[70px]">{project.username}</span>
                  </div>
                  {/* Actions: Like/Dislike/Links, all inline, icon-only */}
                  <div className="flex items-center gap-2">
                    {/* Like */}
                    <button
                      onClick={() => upvoteProject(project._id)}
                      disabled={project.hasUpvoted || project.hasDownvoted}
                      title={project.hasUpvoted ? 'You upvoted' : 'Upvote'}
                      className={cn(
                        "group/like flex items-center gap-1 text-xs text-base-content/70 hover:text-primary transition-colors disabled:opacity-60 p-0 border-none bg-transparent shadow-none focus:outline-none",
                        project.hasUpvoted && "text-primary"
                      )}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{project.upvotes}</span>
                    </button>
                    {/* Dislike */}
                    <button
                      onClick={() => project.hasDownvoted ? removeDownvoteProject(project._id) : downvoteProject(project._id)}
                      disabled={project.hasUpvoted}
                      title={project.hasDownvoted ? 'You downvoted' : 'Downvote'}
                      className={cn(
                        "group/dislike flex items-center gap-1 text-xs text-base-content/70 hover:text-error transition-colors disabled:opacity-60 p-0 border-none bg-transparent shadow-none focus:outline-none",
                        project.hasDownvoted && "text-error"
                      )}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{project.downvotes}</span>
                    </button>
                    {/* Repo */}
                    <a
                      href={project.gitRepositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Repository"
                      className="text-base-content/60 hover:text-base-content/90 p-0"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    {/* Demo */}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Demo"
                        className="text-base-content/60 hover:text-base-content/90 p-0"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Enhanced Add Project Button */}
      <div className="px-4 pb-6">
        <Button
          className={cn(
            "w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            "text-primary-foreground border-none shadow-lg hover:shadow-xl",
            "flex items-center justify-center gap-2 h-12 text-base font-medium",
            "transition-all duration-300 hover:-translate-y-0.5"
          )}
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-5 h-5" />
          <span>Share Your Project</span>
        </Button>
      </div>

      {/* Project Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-base-300/50"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-base-300/50">
              <h3 className="text-2xl font-bold text-base-content">Share Your Project</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full" 
                onClick={() => setShowModal(false)}
              >
                ✕
              </Button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mx-6 mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-destructive text-sm">{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-base-content">
                  Project Title *
                </label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" 
                  placeholder="Enter your project title"
                  required 
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-base-content">
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none" 
                  rows={4}
                  placeholder="Describe your project, technologies used, and what makes it special..."
                />
              </div>

              {/* Image URLs */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-base-content">
                  Project Images (up to 3)
                  <span className="text-base-content/60 font-normal ml-1">Optional</span>
                </label>
                <div className="space-y-2">
                  {[0, 1, 2].map(i => (
                    <input 
                      key={i} 
                      name={`image${i}`} 
                      value={form.images[i]} 
                      onChange={handleFormChange} 
                      className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" 
                      placeholder={`Image URL ${i + 1} (optional)`} 
                    />
                  ))}
                </div>
              </div>

              {/* Repository URL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-base-content">
                  Repository URL *
                </label>
                <input 
                  name="gitRepositoryUrl" 
                  value={form.gitRepositoryUrl} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" 
                  placeholder="https://github.com/username/project"
                  required 
                />
              </div>

              {/* Demo URL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-base-content">
                  Demo URL *
                </label>
                <input 
                  name="demoUrl" 
                  value={form.demoUrl} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2 border border-base-300 rounded-lg bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" 
                  placeholder="https://your-demo-url.com"
                  required 
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-base-300/50">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowModal(false)} 
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ShowcaseChannel; 