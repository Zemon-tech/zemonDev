import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Image, Gift, Smile, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { useArenaChat } from '@/hooks/useArenaChat';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// Utility function to extract profile picture from message
const getMessageProfilePicture = (message: any): string | undefined => {
  if (typeof message.userId === 'object' && message.userId.profilePicture) {
    return message.userId.profilePicture;
  }
  return undefined;
};

// Utility function to get display name from message
const getMessageDisplayName = (message: any): string => {
  if (typeof message.userId === 'object' && message.userId.fullName) {
    return message.userId.fullName;
  }
  return message.username;
};

interface DirectMessageChannelProps {
  recipientName: string;
  recipientAvatar?: string;
  recipientStatus?: 'online' | 'offline' | 'away' | 'busy';
  recipientRole?: string;
}

const DirectMessageChannel: React.FC<DirectMessageChannelProps> = ({
  recipientName,
  recipientAvatar,
  recipientStatus = 'offline',
  recipientRole = 'Member'
}) => {
  // Use the DM channel ID based on recipient name
  const channelId = `dm-${recipientName.toLowerCase().replace(/\s+/g, '-')}`;
  
  const { 
    messages, 
    loading, 
    loadingMore, 
    typing, 
    error, 
    pagination, 
    hasInitialized,
    hasReachedEnd,
    consecutiveDuplicateLoads,
    sendMessage, 
    sendTyping, 
    loadMoreMessages 
  } = useArenaChat(channelId, {});
  
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [wasLoadingMore, setWasLoadingMore] = useState(false);
  const [scrollPositionBeforeLoad, setScrollPositionBeforeLoad] = useState<number | null>(null);

  // Infinite scroll setup with improved scroll position tracking
  const { containerRef, restoreScrollPosition } = useInfiniteScroll({
    onLoadMore: loadMoreMessages,
    hasMore: pagination?.hasMore || false,
    loading: loadingMore,
    threshold: 150,
    enabled: hasInitialized && !loading && !hasReachedEnd && consecutiveDuplicateLoads < 3
  });

  // Track loading more state to prevent auto-scroll during pagination
  useEffect(() => {
    if (loadingMore) {
      setWasLoadingMore(true);
      // Store the scroll position before loading more messages
      if (containerRef.current) {
        setScrollPositionBeforeLoad(containerRef.current.scrollTop);
      }
    } else if (wasLoadingMore) {
      // Reset the flag after a longer delay to prevent auto-scroll after pagination
      const timer = setTimeout(() => {
        setWasLoadingMore(false);
        // Don't clear scrollPositionBeforeLoad immediately - keep it for a bit longer
      }, 1000); // Increased delay to prevent auto-scroll after pagination
      return () => clearTimeout(timer);
    }
  }, [loadingMore, wasLoadingMore]);

  // Clear scroll position tracking after a longer delay to allow normal auto-scroll
  useEffect(() => {
    if (scrollPositionBeforeLoad !== null && !wasLoadingMore) {
      const timer = setTimeout(() => {
        setScrollPositionBeforeLoad(null);
      }, 3000); // Keep protection for 3 seconds total
      return () => clearTimeout(timer);
    }
  }, [scrollPositionBeforeLoad, wasLoadingMore]);

  // Auto-scroll to bottom when new messages arrive (but not when loading more)
  useEffect(() => {
    // Only auto-scroll if we're not loading more messages and we have messages
    // Also check if we're near the bottom to avoid jumping
    if (!loadingMore && !wasLoadingMore && messages.length > 0) {
      const container = containerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        // Check if this is a legitimate auto-scroll (not after pagination)
        const isAfterPagination = scrollPositionBeforeLoad !== null;
        const shouldAutoScroll = isNearBottom && container.scrollTop > 0 && !isAfterPagination;
        
        if (shouldAutoScroll) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, loadingMore, wasLoadingMore, scrollPositionBeforeLoad]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (hasInitialized && !loading && messages.length > 0) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasInitialized, loading, messages.length]);

  // Restore scroll position after loading more messages with improved timing
  useEffect(() => {
    if (!loadingMore) {
      // Use a longer delay to ensure DOM has fully updated
      const timer = setTimeout(() => {
        restoreScrollPosition();
      }, 100); // Increased delay for better DOM synchronization

      return () => clearTimeout(timer);
    }
  }, [loadingMore, restoreScrollPosition]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
      handleStopTyping();
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'away': return 'bg-warning';
      case 'busy': return 'bg-destructive';
      default: return 'bg-base-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading messages...</p>
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

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              {recipientAvatar ? (
                <AvatarImage src={recipientAvatar} alt={recipientName} />
              ) : (
                <AvatarFallback>
                  {recipientName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-200",
              getStatusColor(recipientStatus)
            )} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-base-content">{recipientName}</h2>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                getStatusColor(recipientStatus)
              )} />
              <span className="text-sm text-base-content/70">{recipientStatus}</span>
              <span className="text-base-content/70">•</span>
              <span className="text-sm text-base-content/70">{recipientRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
            <span className="text-sm text-base-content/70">Loading more messages...</span>
          </div>
        )}

        {/* End of messages indicator */}
        {hasReachedEnd && messages.length > 0 && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/80 border border-base-300">
              <MessageSquare className="w-4 h-4 text-base-content/60" />
              <span className="text-sm text-base-content/60 font-medium">Beginning of conversation</span>
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className="px-6 py-4 space-y-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-base-content/70">
              <p>No messages yet.</p>
              <p className="mt-2">Send a message to start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group px-4 py-2 -mx-4 hover:bg-base-200 rounded-lg",
                  "transition-colors duration-200"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {/* White background for transparent avatars */}
                    <div className="absolute inset-0 w-10 h-10 rounded-full bg-white"></div>
                    <Avatar className="w-10 h-10 relative z-10">
                      <AvatarImage 
                        src={getMessageProfilePicture(message)} 
                        alt={getMessageDisplayName(message)}
                      />
                      <AvatarFallback>
                        {getMessageDisplayName(message).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-base-content">{getMessageDisplayName(message)}</span>
                      <span className="text-xs text-base-content/70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-base-content/80 mt-1 whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Typing indicator */}
          {typing.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 py-2"
            >
              <div className="flex items-center gap-2 text-base-content/60">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
                <span className="text-sm">
                  {typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-base-300 bg-base-200">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Image className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${recipientName}`}
            className={cn(
              "w-full bg-base-300 rounded-lg pl-24 pr-24 py-3",
              "text-base-content placeholder:text-base-content/60",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Gift className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessageChannel; 