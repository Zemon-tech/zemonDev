import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, Pin, MessageSquare, Heart, Share2, User, Loader2, AlertCircle } from 'lucide-react';
import { useArenaChat, Message } from '@/hooks/useArenaChat';

interface AnnouncementsChannelProps {
  isAdmin?: boolean;
}

const AnnouncementsChannel: React.FC<AnnouncementsChannelProps> = ({ isAdmin = false }) => {
  const { messages, loading, error, sendMessage } = useArenaChat('announcements');

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

  // Helper to determine if a message is pinned (based on content)
  const isPinned = (message: Message): boolean => {
    return message.content.includes('[PINNED]') || 
           message.type === 'system' || 
           message.content.toLowerCase().includes('important');
  };

  // Helper to extract title from message content
  const getMessageTitle = (message: Message): string => {
    const lines = message.content.split('\n');
    if (lines.length > 1) {
      return lines[0].replace('[PINNED]', '').trim();
    }
    
    // If no line breaks, try to extract a title from the first sentence
    const firstSentence = message.content.split('.')[0];
    if (firstSentence.length < 50) {
      return firstSentence.replace('[PINNED]', '').trim();
    }
    
    // Fallback to a generic title
    return 'Announcement';
  };

  // Helper to extract content from message
  const getMessageContent = (message: Message): string => {
    const lines = message.content.split('\n');
    if (lines.length > 1) {
      return lines.slice(1).join('\n').trim();
    }
    return message.content.replace('[PINNED]', '').trim();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading announcements...</p>
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

  const pinnedMessages = messages.filter(isPinned);
  const regularMessages = messages.filter(msg => !isPinned(msg));

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
          {pinnedMessages.length > 0 && (
            <div className="space-y-4">
              {pinnedMessages.map(message => (
                <motion.div
                  key={message._id}
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
                        <AvatarFallback>
                          {message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-base-content">{getMessageTitle(message)}</h3>
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-none">Pinned</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-base-content/70">
                          <span className="font-medium">{message.username}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {message.type === 'system' ? 'System' : 'Admin'}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-base-content/80 leading-relaxed whitespace-pre-line">{getMessageContent(message)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Regular Announcements */}
          {regularMessages.length > 0 ? (
            <div className="space-y-4">
              {regularMessages.map(message => (
                <motion.div
                  key={message._id}
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
                        <AvatarFallback>
                          {message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-base-content">{getMessageTitle(message)}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-base-content/70">
                          <span className="font-medium">{message.username}</span>
                          <span>•</span>
                          <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-base-content/80 leading-relaxed whitespace-pre-line">{getMessageContent(message)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-base-content/70">
              <p>No announcements yet.</p>
              {isAdmin && <p className="mt-2">Use the New button to create one!</p>}
            </div>
          )}
        </motion.div>
      </div>

      {/* Admin Post Form */}
      {isAdmin && (
        <div className="p-4 border-t border-base-300 bg-base-200">
          <Button className="w-full" onClick={() => {
            const announcement = prompt("Enter your announcement (prefix with [PINNED] to pin):");
            if (announcement) {
              sendMessage(announcement);
            }
          }}>
            <PlusCircle className="w-5 h-5 mr-2" />
            Post New Announcement
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsChannel; 