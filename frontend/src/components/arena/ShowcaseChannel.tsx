import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThumbsUp, ThumbsDown, Plus, Hash, Loader2, AlertCircle, Calendar, Github, Globe, User, MessageSquare } from 'lucide-react';
import { useArenaShowcase } from '@/hooks/useArenaShowcase';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';
import Toaster from '@/components/ui/toast';

const ShowcaseChannel: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading, error, upvoteProject, downvoteProject, refetch, toasterRef } = useArenaShowcase();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  // Resolve avatar URL similar to Nirvana live feed to support historic shapes
  const resolveAvatarUrl = (p: any): string => {
    return (
      (p?.userId as any)?.profilePicture ||
      (p?.author as any)?.profilePicture ||
      p?.author?.avatar ||
      p?.userAvatar ||
      p?.avatar ||
      p?.user?.avatar ||
      (p?.user as any)?.profilePicture ||
      ''
    );
  };

  // Handle user actions
  const handleViewProfile = (project: any) => {
    const username = (project?.userId as any)?.username || project?.username;
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const handleMessageUser = (project: any) => {
    const username = (project?.userId as any)?.username || project?.username;
    if (username) {
      // Navigate to direct message with the user
      navigate(`/arena?dm=${username}`);
    }
  };
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
      }, 4000);

      return () => clearInterval(interval);
    }, [images.length]);

    if (!images || images.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-base-200/50 to-base-300/30 text-base-content/30 rounded-t-xl">
          <div className="text-center">
            <Hash className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium opacity-60">No Image</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden rounded-t-xl">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - Image ${index + 1}`}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 rounded-t-xl",
              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            draggable={false}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
            {images.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentImageIndex ? "bg-white/90 shadow-sm" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-t-xl" />
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
        userAvatar: user.imageUrl || '', // Add user avatar
        upvotes: 0,
        upvotedBy: [],
        submittedAt: new Date().toISOString(),
        isApproved: false,
      }, getToken);
      setShowModal(false);
      setForm({ title: '', description: '', images: ['', '', ''], gitRepositoryUrl: '', demoUrl: '' });
      refetch();
      toasterRef.current?.show({
        title: 'Project Submitted',
        message: 'Your project has been submitted successfully and is pending approval.',
        variant: 'success',
        duration: 4000,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to submit project.';
      setFormError(errorMessage);
      toasterRef.current?.show({
        title: 'Submission Failed',
        message: errorMessage,
        variant: 'error',
        duration: 5000,
      });
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
      <div className="flex-1 overflow-y-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/70 col-span-full">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-base-200/50 rounded-full flex items-center justify-center">
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
              <Card className="h-90 bg-base-100/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group/card backdrop-blur-sm rounded-xl flex flex-col p-0">
                {/* Image Section with increased height and rounded top corners */}
                <div className="relative h-45 w-full overflow-hidden bg-gradient-to-br from-base-200/30 to-base-300/20 flex-shrink-0">
                  <ImageCarousel images={project.images || []} title={project.title} />
                </div>

                {/* Content Section with proper padding and spacing */}
                <div className="px-4 pt-4 pb-5 flex-1 flex flex-col">
                  {/* Title and Date Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base-content text-sm leading-tight line-clamp-2 flex-1" title={project.title}>
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-base-content/50 whitespace-nowrap flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(project.submittedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Description with fixed height */}
                  <div className="h-10 mb-3 flex-shrink-0">
                    {project.description && (
                      <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed" title={project.description}>
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* User Info and Actions Row - with proper bottom padding */}
                  <div className="flex items-center justify-between gap-3 mt-auto">
                    {/* User Info with proper avatar and dropdown */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-pointer hover:bg-base-200/50 rounded-md px-1 py-0.5 -mx-1 transition-colors">
                            <div className="relative flex items-center justify-center">
                              {/* White background for transparent avatars */}
                              <div className="absolute inset-0 w-6 h-6 rounded-full bg-white"></div>
                              <Avatar className="w-6 h-6 border border-base-200/50 shadow-sm relative z-10">
                                {/* Use actual user avatar if available */}
                                <AvatarImage 
                                  src={resolveAvatarUrl(project)} 
                                  alt={((project as any)?.userId as any)?.fullName || project.username || 'User'}
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                  {project.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <span className="text-xs text-base-content/70 truncate font-medium">
                              {((project as any)?.userId as any)?.fullName || project.username}
                            </span>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="start">
                          <DropdownMenuLabel className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center">
                              <div className="absolute inset-0 w-6 h-6 rounded-full bg-white"></div>
                              <Avatar className="w-6 h-6 relative z-10">
                                <AvatarImage src={resolveAvatarUrl(project)} />
                                <AvatarFallback className="text-sm">{(project.username || 'U').charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{((project as any)?.userId as any)?.fullName || project.username}</span>
                              <span className="text-xs text-base-content/60">@{project.username}</span>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleViewProfile(project)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <User className="w-4 h-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleMessageUser(project)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Action Buttons with better spacing */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Like Button */}
                      <button
                        onClick={() => upvoteProject(project._id)}
                        title={project.hasUpvoted ? 'Remove upvote' : 'Upvote'}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm",
                          project.hasUpvoted 
                            ? "bg-primary/15 text-primary border border-primary/30" 
                            : "bg-base-200/60 text-base-content/70 hover:bg-primary/10 hover:text-primary border border-transparent"
                        )}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{project.upvotes}</span>
                      </button>

                      {/* Dislike Button */}
                      <button
                        onClick={() => downvoteProject(project._id)}
                        title={project.hasDownvoted ? 'Remove downvote' : 'Downvote'}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm",
                          project.hasDownvoted 
                            ? "bg-error/15 text-error border border-error/30" 
                            : "bg-base-200/60 text-base-content/70 hover:bg-error/10 hover:text-error border border-transparent"
                        )}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>{project.downvotes}</span>
                      </button>

                      {/* External Links */}
                      <div className="flex items-center gap-1">
                        <a
                          href={project.gitRepositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Repository"
                          className="p-1.5 rounded-full bg-base-200/60 text-base-content/60 hover:bg-base-content/10 hover:text-base-content transition-all duration-200 hover:scale-105"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Demo"
                            className="p-1.5 rounded-full bg-base-200/60 text-base-content/60 hover:bg-base-content/10 hover:text-base-content transition-all duration-200 hover:scale-105"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Enhanced Add Project Button */}
      <div className="px-4 pb-4">
        <Button
          className={cn(
            "w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            "text-primary-foreground border-0 shadow-lg hover:shadow-xl",
            "flex items-center justify-center gap-2.5 h-11 text-sm font-bold",
            "transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
          )}
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Share Your Project</span>
        </Button>
      </div>

      {/* Project Submission Modal - Rest of the modal code remains the same */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0"
          >
            {/* Modal content remains the same as before */}
            <div className="flex items-center justify-between p-6 border-b border-base-200/60">
              <h3 className="text-xl font-bold text-base-content">Share Your Project</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-base-200/60" 
                onClick={() => setShowModal(false)}
              >
                ✕
              </Button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-error" />
                <span className="text-error text-sm">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Project Title *</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2.5 border border-base-200 rounded-xl bg-base-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200" 
                  placeholder="Enter your project title"
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2.5 border border-base-200 rounded-xl bg-base-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none" 
                  rows={4}
                  placeholder="Describe your project, technologies used, and what makes it special..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">
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
                      className="w-full px-3 py-2.5 border border-base-200 rounded-xl bg-base-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200" 
                      placeholder={`Image URL ${i + 1} (optional)`} 
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Repository URL *</label>
                <input 
                  name="gitRepositoryUrl" 
                  value={form.gitRepositoryUrl} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2.5 border border-base-200 rounded-xl bg-base-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200" 
                  placeholder="https://github.com/username/project"
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Demo URL *</label>
                <input 
                  name="demoUrl" 
                  value={form.demoUrl} 
                  onChange={handleFormChange} 
                  className="w-full px-3 py-2.5 border border-base-200 rounded-xl bg-base-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200" 
                  placeholder="https://your-demo-url.com"
                  required 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-base-200/60">
                <Button 
                  type="button" 
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setShowModal(false)} 
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl border-0"
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

      <Toaster ref={toasterRef} />
    </div>
  );
};

export default ShowcaseChannel;
