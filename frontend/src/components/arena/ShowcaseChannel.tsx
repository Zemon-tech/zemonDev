import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Share2, ExternalLink, Plus, Hash, Loader2, AlertCircle } from 'lucide-react';
import { useArenaShowcase, Project as ShowcaseProject } from '@/hooks/useArenaShowcase';

const ShowcaseChannel: React.FC = () => {
  const { projects, loading, error, upvoteProject } = useArenaShowcase();

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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/70">
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
                "group bg-base-200 rounded-lg overflow-hidden",
                "border border-base-300 hover:border-base-400",
                "transition-all duration-200"
              )}
            >
              {project.images && project.images.length > 0 && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Project Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 rounded-full">
                    <AvatarFallback>
                      {project.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-base-content">{project.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-base-content/70">
                          <span>{project.username}</span>
                          <span>•</span>
                          <span>{new Date(project.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a
                        href={project.demoUrl || project.gitRepositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base-content/70 hover:text-base-content transition-colors duration-200"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    
                    {/* Project Description */}
                    {project.description && (
                      <p className="mt-2 text-sm text-base-content/80">
                        {project.description}
                      </p>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => upvoteProject(project._id)}
                        disabled={project.hasUpvoted}
                        className={cn(
                          "flex items-center gap-1.5 text-sm",
                          "transition-colors duration-200",
                          project.hasUpvoted
                            ? "text-primary"
                            : "text-base-content/70 hover:text-base-content"
                        )}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{project.upvotes}</span>
                      </button>
                      <a 
                        href={project.gitRepositoryUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-base-content/70 hover:text-base-content transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Repository</span>
                      </a>
                      {project.demoUrl && (
                        <a 
                          href={project.demoUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-base-content/70 hover:text-base-content transition-colors duration-200"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
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
        >
          <Plus className="w-5 h-5" />
          <span>Share Your Project</span>
        </Button>
      </div>
    </div>
  );
};

export default ShowcaseChannel; 