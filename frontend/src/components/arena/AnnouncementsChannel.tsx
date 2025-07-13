import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, Pin, MessageSquare, Heart, Share2, User } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

interface AnnouncementsChannelProps {
  isAdmin?: boolean;
}

const AnnouncementsChannel: React.FC<AnnouncementsChannelProps> = ({ isAdmin = false }) => {
  // Mock announcements data
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Welcome to the Arena!',
      content: 'This is your space to connect, learn, and grow with fellow developers. Check out our weekly challenges and showcase your projects!',
      isPinned: true,
      createdAt: new Date('2024-03-15'),
      author: {
        name: 'Alex Developer',
        avatar: 'https://github.com/shadcn.png',
        role: 'Admin'
      },
      stats: {
        likes: 42,
        comments: 12,
        shares: 5
      }
    },
    {
      id: '2',
      title: 'New Feature: Project Showcase',
      content: 'You can now showcase your projects in the community tab. Share your work and get feedback from other developers!',
      isPinned: false,
      createdAt: new Date('2024-03-14'),
      author: {
        name: 'Sarah Tech',
        avatar: 'https://github.com/shadcn.png',
        role: 'Moderator'
      },
      stats: {
        likes: 28,
        comments: 8,
        shares: 3
      }
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between h-9 px-4 py-1 border-b border-base-300 bg-base-200 sticky top-0 z-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-medium text-base-content">Announcements</h2>
          <p className="text-[10px] text-base-content/70">Important updates and news</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" className="h-6 text-xs px-2 py-0 gap-1">
            <PlusCircle className="w-3 h-3" />
            New
          </Button>
        )}
      </div>

      {/* Announcements Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 space-y-6"
        >
          {/* Pinned Announcements */}
          {announcements.filter(a => a.isPinned).map(announcement => (
            <motion.div
              key={announcement.id}
              variants={itemVariants}
              className={cn(
                "relative p-6 rounded-xl border",
                "bg-primary/5 border-primary/10",
                "hover:bg-primary/10 transition-colors duration-200"
              )}
            >
              <div className="absolute top-4 right-4">
                <Pin className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    {announcement.author.avatar ? (
                      <AvatarImage src={announcement.author.avatar} alt={announcement.author.name} />
                    ) : (
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-base-content">{announcement.title}</h3>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-none">Pinned</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-base-content/70">
                      <span className="font-medium">{announcement.author.name}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {announcement.author.role}
                      </Badge>
                      <span>•</span>
                      <span>{announcement.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-base-content/80 leading-relaxed">{announcement.content}</p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{announcement.stats.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{announcement.stats.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">{announcement.stats.shares}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Regular Announcements */}
          <div className="space-y-4">
            {announcements.filter(a => !a.isPinned).map(announcement => (
              <motion.div
                key={announcement.id}
                variants={itemVariants}
                className={cn(
                  "p-6 rounded-xl border",
                  "bg-card/50 border-border/50",
                  "hover:bg-card/80 transition-colors duration-200"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      {announcement.author.avatar ? (
                        <AvatarImage src={announcement.author.avatar} alt={announcement.author.name} />
                      ) : (
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-base-content">{announcement.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-base-content/70">
                        <span className="font-medium">{announcement.author.name}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {announcement.author.role}
                        </Badge>
                        <span>•</span>
                        <span>{announcement.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-base-content/80 leading-relaxed">{announcement.content}</p>
                  <div className="flex items-center gap-6 pt-2">
                    <button className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{announcement.stats.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{announcement.stats.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{announcement.stats.shares}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnnouncementsChannel; 