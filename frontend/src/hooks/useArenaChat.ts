import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useArenaSocket } from './useArenaSocket';
import { ApiService } from '../services/api.service';

export interface Message {
  _id: string;
  userId: string | { _id: string; fullName: string; profilePicture?: string };
  username: string;
  content: string;
  timestamp: Date;
  replyToId?: string;
  mentions: string[];
  type: 'text' | 'system';
}

export interface PaginationInfo {
  limit: number;
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export type ArenaChatError =
  | { type: 'banned'; message: string; reason?: string; banExpiresAt?: string }
  | { type: 'kicked'; message: string }
  | { type: 'generic'; message: string }
  | null;

export const useArenaChat = (channelId: string, userChannelStatuses: Record<string, string>) => {
  const { getToken, isSignedIn } = useAuth();
  const { socket } = useArenaSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typing, setTyping] = useState<string[]>([]);
  const [error, setError] = useState<ArenaChatError>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [lastLoadedCursor, setLastLoadedCursor] = useState<string | null>(null);
  const [nextRequestCursor, setNextRequestCursor] = useState<string | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const [consecutiveDuplicateLoads, setConsecutiveDuplicateLoads] = useState(0);

  // Only allow if user has any status for the channel
  const hasStatus = userChannelStatuses[channelId] !== undefined;

  // Join channel on socket connection
  useEffect(() => {
    if (socket && channelId && isSignedIn && userChannelStatuses[channelId] === 'approved') {
      socket.emit('join_channel', channelId);

      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for typing indicators
      socket.on('user_typing', (data: { username: string; isTyping: boolean }) => {
        setTyping(prev => 
          data.isTyping 
            ? [...prev.filter(u => u !== data.username), data.username]
            : prev.filter(u => u !== data.username)
        );
      });

      return () => {
        socket.off('new_message');
        socket.off('user_typing');
        socket.emit('leave_channel', channelId);
      };
    } else if (!hasStatus) {
      setError({ type: 'generic', message: 'You are not a member of this channel.' });
    }
  }, [socket, channelId, isSignedIn, userChannelStatuses]);

  // Load initial messages
  useEffect(() => {
    if (!channelId || !isSignedIn || !hasStatus) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        setHasReachedEnd(false);
        setLastLoadedCursor(null);
        setNextRequestCursor(null);
        setConsecutiveDuplicateLoads(0); // Reset duplicate counter for new channel
        
        const response = await ApiService.getChannelMessages(channelId, getToken);
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
        setHasInitialized(true);
        setLastLoadTime(0); // Reset load time for initial load
        
        // Check if we've reached the end (no more messages to load)
        if (!response.data.pagination.hasMore) {
          setHasReachedEnd(true);
        }
      } catch (err: any) {
        // Check for 403 ban/kick error
        if (err?.response?.status === 403 && err?.response?.data) {
          const data = err.response.data;
          // Extract details from data.data for ban/kick
          if (data.message?.toLowerCase().includes('banned')) {
            setError({
              type: 'banned',
              message: data.message,
              reason: data.data?.banReason,
              banExpiresAt: data.data?.banExpiresAt
            });
          } else if (data.message?.toLowerCase().includes('kicked')) {
            setError({ type: 'kicked', message: data.message });
          } else {
            setError({ type: 'generic', message: data.message || 'Forbidden' });
          }
        } else {
          setError({ type: 'generic', message: 'Failed to load messages' });
        }
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [channelId, getToken, isSignedIn, hasStatus]);

  // Load more messages (for pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!channelId || !isSignedIn || !hasStatus || loadingMore || !pagination?.hasMore || hasReachedEnd) {
      return;
    }

    // Prevent rapid duplicate requests (within 1 second)
    const now = Date.now();
    if (now - lastLoadTime < 1000) {
      console.log('Skipping rapid request - too soon since last load');
      return;
    }

    // Use the next request cursor if available, otherwise use pagination cursor
    const currentCursor = nextRequestCursor || pagination.nextCursor;
    if (currentCursor === lastLoadedCursor && lastLoadedCursor !== null) {
      console.log('Skipping duplicate request with same cursor:', currentCursor);
      return;
    }

    // Additional check: if we've been getting mostly duplicates, stop loading
    if (lastLoadedCursor && currentCursor) {
      const currentTime = new Date(currentCursor).getTime();
      const lastTime = new Date(lastLoadedCursor).getTime();
      // If the cursor is moving backwards very slowly or not at all, we might be at the end
      if (currentTime >= lastTime) {
        console.log('Cursor is not moving forward - possible end of messages');
        setHasReachedEnd(true);
        return;
      }
    }

    try {
      setLoadingMore(true);
      setLastLoadTime(now);
      
      console.log('Loading more messages with cursor:', currentCursor);
      
      const response = await ApiService.getChannelMessages(
        channelId, 
        getToken, 
        25, 
        currentCursor
      );
      
      // Deduplicate messages to prevent repeats
      setMessages(prev => {
        const newMessages = response.data.messages;
        const existingIds = new Set(prev.map((msg: Message) => msg._id));
        const uniqueNewMessages = newMessages.filter((msg: Message) => !existingIds.has(msg._id));
        
        // Enhanced debug logging
        console.log('Loading more messages:', {
          newMessagesCount: newMessages.length,
          uniqueNewMessagesCount: uniqueNewMessages.length,
          existingMessagesCount: prev.length,
          duplicateCount: newMessages.length - uniqueNewMessages.length,
          cursor: currentCursor,
          lastLoadedCursor: lastLoadedCursor,
          hasMore: response.data.pagination.hasMore,
          nextCursor: response.data.pagination.nextCursor,
          consecutiveDuplicateLoads
        });
        
        // If we got some unique messages, prepend them and reset duplicate counter
        if (uniqueNewMessages.length > 0) {
          setConsecutiveDuplicateLoads(0); // Reset counter when we get unique messages
          return [...uniqueNewMessages, ...prev];
        }
        
        // If we got mostly duplicates, increment the counter
        if (uniqueNewMessages.length < newMessages.length / 2) {
          setConsecutiveDuplicateLoads(prev => prev + 1);
          console.log(`Consecutive duplicate loads: ${consecutiveDuplicateLoads + 1}`);
          
          // If we've had too many consecutive duplicate loads, stop loading
          if (consecutiveDuplicateLoads >= 2) {
            console.warn('Too many consecutive duplicate loads - stopping infinite scroll');
            setHasReachedEnd(true);
          }
        }
        
        // If no unique messages and no new messages, we've reached the end
        if (newMessages.length === 0) {
          console.warn('No new messages returned - reached end');
          setHasReachedEnd(true);
        }
        
        return prev; // Don't change the messages array
      });
      
      setPagination(response.data.pagination);
      
      // Update the next request cursor to the next cursor from the response
      if (response.data.pagination.nextCursor && response.data.pagination.nextCursor !== currentCursor) {
        setNextRequestCursor(response.data.pagination.nextCursor);
        setLastLoadedCursor(currentCursor || null); // Track what we just used
        console.log('Updated nextRequestCursor to:', response.data.pagination.nextCursor);
        console.log('Updated lastLoadedCursor to:', currentCursor);
      } else if (response.data.pagination.nextCursor === currentCursor) {
        console.log('Next cursor is same as current cursor - reached end');
        setHasReachedEnd(true);
      }
      
      // Check if we've reached the end
      if (!response.data.pagination.hasMore) {
        setHasReachedEnd(true);
      }
      
      // Additional check: if the next cursor is the same as current cursor, we've reached the end
      if (response.data.pagination.nextCursor === currentCursor) {
        console.warn('Next cursor is same as current cursor - reached end');
        setHasReachedEnd(true);
      }
    } catch (err: any) {
      console.error('Error loading more messages:', err);
      setError({ type: 'generic', message: 'Failed to load more messages' });
      // Reset cursor on error to allow retry
      setLastLoadedCursor(null);
    } finally {
      setLoadingMore(false);
    }
  }, [channelId, getToken, isSignedIn, hasStatus, loadingMore, pagination, hasReachedEnd, lastLoadedCursor, lastLoadTime, consecutiveDuplicateLoads]);

  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!socket) {
      console.error('Cannot send message: Socket not connected');
      return;
    }
    if (userChannelStatuses[channelId] !== 'approved') {
      setError({ type: 'generic', message: 'You are not a member of this channel.' });
      return;
    }
    if (!content.trim()) {
      console.warn('Cannot send empty message');
      return;
    }
    
    // Note: Role-based permissions are checked in the component before calling sendMessage
    // Backend validation is the source of truth for security
    
    socket.emit('send_message', {
      channelId,
      content: content.trim(),
      ...(replyToId ? { replyToId } : {})
    }, (response: any) => {
      if (response?.success) {
        console.log('Message sent successfully:', response);
      } else {
        // Handle role-based errors from backend
        if (response?.message?.includes('Only admins and moderators')) {
          setError({ type: 'generic', message: 'Only admins and moderators can send messages in this channel.' });
        } else {
          setError({ type: 'generic', message: response?.message || 'Failed to send message.' });
        }
        console.error('Failed to send message:', response);
      }
    });
  }, [socket, channelId, userChannelStatuses]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socket && userChannelStatuses[channelId] === 'approved') {
      socket.emit('typing', { channelId, isTyping });
    }
  }, [socket, channelId, userChannelStatuses]);

  return {
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
  };
}; 