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

export const useArenaChat = (channelId: string) => {
  const { getToken, isSignedIn } = useAuth();
  const { socket } = useArenaSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Join channel on socket connection
  useEffect(() => {
    if (socket && channelId && isSignedIn) {
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
    }
  }, [socket, channelId, isSignedIn]);

  // Load initial messages
  useEffect(() => {
    if (!channelId || !isSignedIn) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getChannelMessages(channelId, getToken);
        setMessages(response.data.messages); // FIX: use .messages
        setError(null);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [channelId, getToken, isSignedIn]);

  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!socket) {
      console.error('Cannot send message: Socket not connected');
      return;
    }
    
    if (!content.trim()) {
      console.warn('Cannot send empty message');
      return;
    }
    
    console.log('Sending message to channel:', { channelId, contentLength: content.trim().length });
    
    socket.emit('send_message', {
      channelId,
      content: content.trim(),
      ...(replyToId ? { replyToId } : {})
    }, (response: any) => {
      if (response?.success) {
        console.log('Message sent successfully:', response);
      } else {
        console.error('Failed to send message:', response);
      }
    });
  }, [socket, channelId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { channelId, isTyping });
    }
  }, [socket, channelId]);

  return {
    messages,
    loading,
    typing,
    error,
    sendMessage,
    sendTyping
  };
}; 