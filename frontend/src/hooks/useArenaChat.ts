import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useArenaSocket } from './useArenaSocket';
import { ApiService } from '../services/api.service';

export interface Message {
  _id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  replyToId?: string;
  mentions: string[];
  type: 'text' | 'system';
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
  const [typing, setTyping] = useState<string[]>([]);
  const [error, setError] = useState<ArenaChatError>(null);

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
        const response = await ApiService.getChannelMessages(channelId, getToken);
        setMessages(response.data.messages); // FIX: use .messages
        setError(null);
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
    typing,
    error,
    sendMessage,
    sendTyping
  };
}; 