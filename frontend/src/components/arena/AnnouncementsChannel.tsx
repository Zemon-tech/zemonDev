import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PlusCircle, Pin, Loader2, AlertCircle, Plus, Image, Gift, Smile } from 'lucide-react';
import { useArenaChat, Message } from '@/hooks/useArenaChat';
import { useUserRole } from '@/context/UserRoleContext';
import RestrictedMessageView from './RestrictedMessageView';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid as GiphyGrid } from '@giphy/react-components';

interface AnnouncementsChannelProps {
  channelId?: string;
  userChannelStatuses?: Record<string, string>;
}

const AnnouncementsChannelComponent: React.FC<AnnouncementsChannelProps> = ({ 
  channelId = 'announcements',
  userChannelStatuses = {}
}) => {
  const { 
    messages, 
    loading, 
    error,
    sendMessage 
  } = useArenaChat(channelId, userChannelStatuses);
  
  const { globalRole, channelRoles, isLoading: roleLoading } = useUserRole();
  const [announcementInput, setAnnouncementInput] = React.useState('');
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showGifPicker, setShowGifPicker] = React.useState(false);
  const gf = React.useMemo(() => new GiphyFetch('YOUR_GIPHY_API_KEY'), []);
  
  // Infinite scroll setup - disabled for announcements
  // const scrollContainerRef = useInfiniteScroll({
  //   onLoadMore: () => {}, // Announcements typically don't need pagination, but keeping for consistency
  //   hasMore: false,
  //   loading: false,
  //   threshold: 150,
  //   enabled: false // Disable infinite scroll for announcements
  // });
  
  // Check if user has admin/moderator access for this channel - MEMOIZED to prevent infinite re-renders
  const canPost = useMemo(() => {
    if (roleLoading) return false;
    
    // Check global role first
    if (globalRole === 'admin' || globalRole === 'moderator') {
      return true;
    }
    
    // Check channel-specific role
    const channelRole = channelRoles[channelId];
    const result = channelRole?.role === 'admin' || channelRole?.role === 'moderator';
    
    console.log('AnnouncementsChannel role check:', { 
      channelId, 
      roleLoading, 
      globalRole, 
      channelRole: channelRole?.role,
      canPost: result 
    });
    return result;
  }, [channelId, roleLoading, globalRole, channelRoles]);

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
  // const getMessageTitle = (message: Message): string => {
  //   const lines = message.content.split('\n');
  //   if (lines.length > 1) {
  //     return lines[0].replace('[PINNED]', '').trim();
  //   }
  //   
  //   // If no line breaks, try to extract a title from the first sentence
  //   const firstSentence = message.content.split('.')[0];
  //   if (firstSentence.length < 50) {
  //     return firstSentence.replace('[PINNED]', '').trim();
  //   }
  //   
  //   // Fallback to a generic title
  //   return 'Announcement';
  // };

  // Helper to extract content from message
  // const getMessageContent = (message: Message): string => {
  //   const lines = message.content.split('\n');
  //   if (lines.length > 1) {
  //     return lines.slice(1).join('\n').trim();
  //   }
  //   return message.content.replace('[PINNED]', '').trim();
  // };

  // Show loading state while roles are being fetched
  if (roleLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading permissions...</p>
      </div>
    );
  }

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
        <p className="mt-2 text-error">{error.message}</p>
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
        {canPost && (
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
          className="px-0 py-4"
        >
          {/* Date grouping logic */}
          {(() => {
            // Group messages by date
            const merged: Array<{ group: Message[]; showDate: boolean; date: string }> = [];
            let group: Message[] = [];
            let currentDate: string | null = null;
            let previousDate: string | null = null;
            
            // Combine pinned and regular messages, keeping pinned first
            const allMessages = [...pinnedMessages, ...regularMessages];
            
            // Handle empty state
            if (allMessages.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-base-content/70">
                  <p>No announcements yet.</p>
                  {canPost && <p className="mt-2">Use the New button to create one!</p>}
                </div>
              );
            }
            
            allMessages.forEach((msg, idx) => {
              const msgDate = new Date(msg.timestamp).toDateString();
              const prev = allMessages[idx - 1];
              const prevDate = prev ? new Date(prev.timestamp).toDateString() : null;
              
              // Check if we need to start a new group
              const isNewDate = prevDate !== msgDate;
              const isNewUser = prev && prev.username !== msg.username;
              const timeGap = prev ? (new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000 / 60 : 0;
              const isTimeGap = timeGap >= 5; // 5 minutes gap
              
              // Start new group if: new date, new user, or time gap
              if (!prev || isNewDate || isNewUser || isTimeGap) {
                // Save previous group if it exists
                if (group.length > 0) {
                  merged.push({ 
                    group, 
                    showDate: previousDate !== currentDate,
                    date: currentDate!
                  });
                  previousDate = currentDate;
                }
                
                // Start new group
                group = [msg];
                currentDate = msgDate;
              } else {
                // Add to existing group
                group.push(msg);
              }
            });
            
            // Add the last group
            if (group.length > 0) {
              merged.push({ 
                group, 
                showDate: previousDate !== currentDate,
                date: currentDate!
              });
            }
            
            // Render merged groups
            return merged.map(({ group, showDate }, i) => {
              const first = group[0];
              return (
                <React.Fragment key={first._id + '-' + i}>
                  {showDate && (
                    <div className="flex items-center justify-center my-6">
                      <span className="px-4 py-1 rounded-full bg-base-300 text-xs text-base-content/60 font-medium shadow-sm">
                        {new Date(first.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {group.map(message => (
                    <motion.div
                      key={message._id}
                      variants={itemVariants}
                      className={cn(
                        "group flex items-start w-full px-6 py-1.5 hover:bg-base-200/80 transition-colors relative"
                      )}
                    >
                      <Avatar className="w-11 h-11 mt-0.5 mr-3 flex-shrink-0 border-2 border-base-300 shadow-sm bg-base-100">
                        <AvatarFallback className="font-bold text-lg bg-primary/80 text-primary-foreground">
                          {message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-base-content text-[15px] leading-tight">{message.username}</span>
                          {isPinned(message) && (
                            <>
                              <Badge variant="secondary" className="bg-primary/20 text-primary border-none px-1 py-0.5 text-xs">Pinned</Badge>
                              <Pin className="w-3 h-3 text-primary" />
                            </>
                          )}
                          <span className="text-xs text-base-content/50 leading-tight mt-0.5">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {isPinned(message) && (
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-base-content/60">
                            <span>•</span>
                            <Badge variant="outline" className="text-xs font-normal px-1 py-0.5">
                              {message.type === 'system' ? 'System' : 'Admin'}
                            </Badge>
                          </div>
                        )}
                        <div className="relative group/message mt-0.5">
                          <span className="whitespace-pre-line text-[15px] text-base-content/90 leading-relaxed px-0 py-0.5">{message.content.replace('[PINNED]', '').trim()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </React.Fragment>
              );
            });
          })()}
        </motion.div>
      </div>

      {/* Message Input Section */}
      {canPost ? (
        <div className="px-6 py-4 border-t border-base-300 bg-base-200">
          <div className="flex items-center bg-base-300 rounded-lg px-2 py-2 w-full relative">
            {/* Left icons */}
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors" onClick={() => setShowEmojiPicker(v => !v)} type="button">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors" onClick={() => setShowGifPicker(v => !v)} type="button">
              <Gift className="w-5 h-5" />
            </button>
            {/* Input */}
            <input
              type="text"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (announcementInput.trim()) {
                    sendMessage(announcementInput);
                    setAnnouncementInput('');
                    setShowEmojiPicker(false);
                    setShowGifPicker(false);
                  }
                }
              }}
              placeholder="Post a new announcement (prefix with [PINNED] to pin)"
              className="flex-1 bg-transparent border-none outline-none px-3 text-base-content placeholder:text-base-content/60"
            />
            {/* Right icons */}
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Image className="w-5 h-5" />
            </button>
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-0 z-50">
                <Picker data={data} onEmojiSelect={(emoji: any) => {
                  setAnnouncementInput(input => input + (emoji.native || emoji.colons || ''));
                  setShowEmojiPicker(false);
                }} />
              </div>
            )}
            {/* GIF Picker Popover */}
            {showGifPicker && (
              <div className="absolute bottom-16 left-24 z-50 bg-base-100 rounded shadow-lg">
                <GiphyGrid
                  width={300}
                  columns={3}
                  fetchGifs={offset => gf.trending({ offset, limit: 9 })}
                  onGifClick={gif => {
                    sendMessage(gif.images.original.url);
                    setShowGifPicker(false);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <RestrictedMessageView channelName="announcement" />
      )}
    </div>
  );
};

const AnnouncementsChannel = React.memo(AnnouncementsChannelComponent);

export default AnnouncementsChannel; 