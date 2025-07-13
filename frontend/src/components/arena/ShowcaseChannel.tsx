import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Share2, ExternalLink, Plus, Hash } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  timestamp: Date;
  likes: number;
  comments: number;
  hasLiked: boolean;
  image?: string;
  tags: string[];
  link: string;
}

const ShowcaseChannel: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'React Component Library',
      description: 'A modern, accessible component library built with React and Tailwind CSS. Features dark mode, animations, and full TypeScript support.',
      author: {
        name: 'CodeMaster',
        avatar: 'https://github.com/shadcn.png',
      },
      timestamp: new Date(),
      likes: 42,
      comments: 12,
      hasLiked: false,
      tags: ['react', 'typescript', 'ui'],
      link: 'https://github.com/example/project',
    },
    // Add more sample projects
  ]);

  const handleLike = (projectId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          likes: project.hasLiked ? project.likes - 1 : project.likes + 1,
          hasLiked: !project.hasLiked,
        };
      }
      return project;
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#313338]">
      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "group bg-[#2B2D31] rounded-lg overflow-hidden",
              "border border-[#1E1F22] hover:border-[#404249]",
              "transition-all duration-200"
            )}
          >
            {project.image && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              {/* Project Header */}
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 rounded-full">
                  <img src={project.author.avatar} alt={project.author.name} />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{project.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{project.author.name}</span>
                        <span>•</span>
                        <span>{project.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-white transition-colors duration-200"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  
                  {/* Project Description */}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-[#404249] text-white"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleLike(project.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-sm",
                        "transition-colors duration-200",
                        project.hasLiked
                          ? "text-primary"
                          : "text-muted-foreground hover:text-white"
                      )}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{project.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors duration-200">
                      <MessageSquare className="w-4 h-4" />
                      <span>{project.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors duration-200">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Project Button */}
      <div className="px-4 pb-6">
        <Button
          className={cn(
            "w-full bg-[#383A40] hover:bg-[#404249]",
            "text-white border-none",
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