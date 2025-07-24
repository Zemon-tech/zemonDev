import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Image, Gift, Smile, User, Heart, MessageSquare, Share2, MoreHorizontal, Loader2 } from 'lucide-react';
import { useArenaChat } from '@/hooks/useArenaChat';
import type { Message } from '@/hooks/useArenaChat';

interface ChatChannelProps {
  channelId?: string;
  channelName: string;
  description?: string;
  canMessage?: boolean;
  userChannelStatuses: Record<string, string>;
}

const ChatChannel: React.FC<ChatChannelProps> = ({ 
  channelId = 'general-chat', 
  channelName, 
  description, 
  canMessage = true, 
  userChannelStatuses
}) => {
  if (!userChannelStatuses) {
    throw new Error('ChatChannel: userChannelStatuses prop is required');
  }
  const status = userChannelStatuses[String(channelId)];
  console.log('ChatChannel: channelId', channelId, 'userChannelStatuses', userChannelStatuses);
  if (status === 'pending') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <p className="text-warning">Your join request is pending moderator approval.<br/>You will be able to view and send messages once approved.</p>
      </div>
    );
  }
  if (status === 'denied') {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <p className="text-error">Your join request was denied.<br/>You cannot access this channel.</p>
      </div>
    );
  }
  if (status === undefined && Object.keys(userChannelStatuses).length > 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <p className="text-base-content/70">You are not a member of this channel.<br/>Join the channel to view and send messages.</p>
      </div>
    );
  }
  if (status === undefined) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading membership status...</p>
      </div>
    );
  }
  const { messages, loading, typing, error, sendMessage, sendTyping } = useArenaChat(channelId, userChannelStatuses);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<{_id: string, username: string, content: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput, replyTo?._id);
      setReplyTo(null);
      setMessageInput('');
      handleStopTyping();
    }
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!isTyping && canMessage) {
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

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-2 text-base-content/70">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    if (error.type === 'banned') {
      return (
        <div className="flex flex-col h-full items-center justify-center text-center">
          <p className="text-error font-semibold">You are banned from this channel.</p>
          {error.reason && <p className="text-base-content/70 mt-1">Reason: {error.reason}</p>}
          {error.banExpiresAt && <p className="text-base-content/70 mt-1">Ban expires: {new Date(error.banExpiresAt).toLocaleString()}</p>}
        </div>
      );
    }
    if (error.type === 'kicked') {
      return (
        <div className="flex flex-col h-full items-center justify-center text-center">
          <p className="text-error font-semibold">You are kicked from this channel.</p>
          <p className="text-base-content/70 mt-1">Ask moderators to rejoin.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-error">Error: {error.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Add ReplyPreviewBox component
  const ReplyPreviewBox: React.FC<{ parent: Message; onClick?: () => void }> = ({ parent, onClick }) => (
    <div
      className="inline-block mb-1 px-3 py-1 rounded-lg bg-base-200/80 border border-base-300 text-xs text-base-content/70 max-w-full cursor-pointer shadow-sm transition hover:bg-primary/10"
      style={{ fontSize: '12px', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis' }}
      onClick={onClick}
      tabIndex={0}
      title={parent.content}
    >
      <span className="font-semibold text-primary mr-1">{parent.username}</span>
      <span className="truncate align-middle">{parent.content.length > 80 ? parent.content.slice(0, 80) + '…' : parent.content}</span>
    </div>
  );

  // Add ChatMessage component for per-message hooks
  const ChatMessage: React.FC<{
    msg: Message;
    isLastInGroup: boolean;
    repliedMessage?: Message | null;
    onReply: (msg: Message) => void;
  }> = ({ msg, isLastInGroup, repliedMessage, onReply }) => {
    const [highlighted, setHighlighted] = useState(false);
    const msgRef = useRef<HTMLDivElement>(null);
    // Highlight and scroll logic
    const handlePreviewClick = () => {
      if (msgRef.current) {
        msgRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlighted(true);
        setTimeout(() => setHighlighted(false), 1500);
      }
    };
    return (
      <div
        ref={msgRef}
        className={cn('flex flex-col w-full transition', highlighted && 'ring-2 ring-primary bg-primary/10')}
      >
        {/* Inline reply preview box above the message bubble */}
        {msg.replyToId && repliedMessage && (
          <ReplyPreviewBox parent={repliedMessage} onClick={handlePreviewClick} />
        )}
        <span className="whitespace-pre-line text-[15px] text-base-content/90 leading-relaxed px-0 py-0.5">{msg.content}</span>
        {/* Reaction panel, only visible on hover, floating popover with animation, fixed to viewport if near right edge */}
        {isLastInGroup && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden group-hover/message:flex gap-1 bg-base-100 border border-base-300 rounded-xl shadow-lg px-2 py-1"
              style={{ minWidth: 120, maxWidth: 220 }}
            >
              <button onClick={() => alert('👍 reaction!')} className="hover:bg-base-200 rounded-full p-1 text-base-content/70 text-xs font-medium transition-colors">👍</button>
              <button onClick={() => alert('❤️ reaction!')} className="hover:bg-base-200 rounded-full p-1 text-base-content/70 text-xs font-medium transition-colors">❤️</button>
              <button onClick={() => alert('😂 reaction!')} className="hover:bg-base-200 rounded-full p-1 text-base-content/70 text-xs font-medium transition-colors">😂</button>
              <button onClick={() => onReply(msg)} className="hover:bg-base-200 rounded-full p-1 text-primary text-xs font-medium transition-colors">Reply</button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-200">
        <div>
          <h2 className="text-lg font-semibold text-base-content">#{channelName}</h2>
          {description && (
            <p className="text-sm text-base-content/70">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="text-base-content/70 hover:text-base-content">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-0 py-4">
          {/* Date divider logic */}
          {(() => {
            // Group consecutive messages from the same user (within 5min)
            const merged: Array<{ group: Message[]; showDate: boolean }> = [];
            let group: Message[] = [];
            let lastDate: string | null = null;
            messages.forEach((msg, idx) => {
              const prev = messages[idx - 1];
              const msgDate = new Date(msg.timestamp).toDateString();
              const prevDate = prev ? new Date(prev.timestamp).toDateString() : null;
              const timeGap = prev ? (new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000 / 60 : 0;
              const isSameUser = prev && prev.username === msg.username;
              const isSameDay = prevDate === msgDate;
              const isClose = isSameUser && isSameDay && timeGap < 5;
              if (!prev || !isSameUser || !isSameDay || !isClose) {
                if (group.length) merged.push({ group, showDate: lastDate !== msgDate });
                group = [msg];
                lastDate = msgDate;
              } else {
                group.push(msg);
              }
            });
            if (group.length) merged.push({ group, showDate: false });
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
                  <div className={cn(
                    "group flex items-start w-full px-6 py-1.5 hover:bg-base-200/80 transition-colors relative"
                  )}>
                    {/* Avatar only for first in group, aligned top, premium style */}
                    <Avatar className="w-11 h-11 mt-0.5 mr-3 flex-shrink-0 border-2 border-base-300 shadow-sm bg-base-100">
                      <AvatarFallback className="font-bold text-lg bg-primary/80 text-primary-foreground">
                        {first.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-base-content text-[15px] leading-tight">{first.username}</span>
                        <span className="text-xs text-base-content/50 leading-tight mt-0.5">{new Date(first.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="relative group/message mt-0.5">
                        {/* Render all messages in the group */}
                        {group.map((msg, j) => {
                          // Only show inline reply preview for actual replies
                          const repliedMessage = msg.replyToId ? messages.find(m => m._id === msg.replyToId) : null;
                          return (
                            <ChatMessage
                              key={msg._id + '-' + j}
                              msg={msg}
                              isLastInGroup={j === group.length - 1}
                              repliedMessage={repliedMessage}
                              onReply={(m) => setReplyTo({ _id: m._id, username: m.username, content: m.content })}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            });
          })()}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Typing indicator - moved outside scrollable area */}
      {typing.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-2"
          style={{
            background: '#ffeeba',
            color: '#222',
            borderRadius: '6px',
            margin: '8px 24px',
            fontWeight: 600,
            marginBottom: '8px'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
            <span className="text-sm" style={{ color: '#222' }}>
              {typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        </motion.div>
      )}
      {/* Message Input with reply bar */}
      {canMessage && (
        <div className="px-6 py-4 border-t border-base-300 bg-base-200">
          {/* Reply bar (show if replying) */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-4 py-2 bg-primary/10 border-l-4 border-primary rounded-md">
              <span className="text-xs font-semibold text-primary">Replying to {replyTo.username}</span>
              <span className="text-xs text-base-content/60 truncate max-w-[180px]">{replyTo.content.slice(0, 40)}{replyTo.content.length > 40 ? '…' : ''}</span>
              <button className="ml-auto text-xs text-base-content/60 hover:text-error" onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
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
              placeholder={`Message #${channelName}`}
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
      )}
    </div>
  );
};

export default ChatChannel; 