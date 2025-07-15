
## Context and Current State

You need to implement a fully functional Arena page frontend for the ZemonDev application. The Arena is a Discord-like community platform with real-time chat, project showcase, and hackathon features.

**Current Setup:**

- **Frontend**: React with TypeScript and Vite
- **Backend**: Node.js Express API running on `http://localhost:3001`
- **Authentication**: Clerk integration with `useAuth()` and `useUser()` hooks
- **Database**: Complete Arena backend with MongoDB models and Socket.IO
- **Environment**: `VITE_BACKEND_URL=http://localhost:3001`
- **Existing UI**: Static ArenaPage component with dummy data that needs real functionality

**Important**: This is an addition to an existing project. Do NOT modify existing functionality or break current UI patterns. Follow the existing code structure and authentication patterns.

## What You Need to Build

Transform the existing static ArenaPage component into a fully functional real-time chat application with:

1. **Real-time messaging** using Socket.IO
2. **Channel-based communication** with proper grouping
3. **Project showcase** with upvoting system
4. **Hackathon integration** with leaderboards
5. **User authentication** via existing Clerk setup
6. **Responsive design** matching existing UI patterns

## Phase 1: Core Infrastructure Setup

### 1.1 Install Required Dependencies

```bash
npm install socket.io-client @types/socket.io-client
```


### 1.2 Create API Service Layer

Create `src/services/api.service.ts`:

```typescript
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export class ApiService {
  private static async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    getToken: () => Promise<string | null>
  ) {
    const authHeader = await this.getAuthHeader(getToken);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  private static async getAuthHeader(getToken: () => Promise<string | null>) {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Arena Channels API
  static async getChannels(getToken: () => Promise<string | null>) {
    return this.makeRequest('/api/arena/channels', {}, getToken);
  }

  static async getChannelMessages(
    channelId: string, 
    getToken: () => Promise<string | null>,
    limit = 50, 
    before?: string
  ) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    return this.makeRequest(
      `/api/arena/channels/${channelId}/messages?${params}`, 
      {}, 
      getToken
    );
  }

  // Add more API methods as needed
}
```


### 1.3 Create Socket.IO Service

Create `src/services/socket.service.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to Arena socket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from Arena socket');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
```


## Phase 2: React Hooks for State Management

### 2.1 Create Arena Socket Hook

Create `src/hooks/useArenaSocket.ts`:

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { socketService } from '@/services/socket.service';
import { Socket } from 'socket.io-client';

export const useArenaSocket = () => {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    const initSocket = async () => {
      try {
        const token = await getToken();
        if (token) {
          const newSocket = socketService.connect(token);
          setSocket(newSocket);

          newSocket.on('connect', () => setIsConnected(true));
          newSocket.on('disconnect', () => setIsConnected(false));
        }
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    };

    initSocket();

    return () => {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [getToken, isSignedIn]);

  return { socket, isConnected };
};
```


### 2.2 Create Arena Channels Hook

Create `src/hooks/useArenaChannels.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';

export interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'announcement' | 'readonly';
  group: 'getting-started' | 'community' | 'hackathons';
  unreadCount?: number;
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
}

export const useArenaChannels = () => {
  const { getToken, isSignedIn } = useAuth();
  const [channels, setChannels] = useState<Record<string, Channel[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchChannels = async () => {
      try {
        const response = await ApiService.getChannels(getToken);
        setChannels(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch channels');
        console.error('Error fetching channels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [getToken, isSignedIn]);

  return { channels, loading, error };
};
```


### 2.3 Create Real-time Chat Hook

Create `src/hooks/useArenaChat.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useArenaSocket } from './useArenaSocket';
import { ApiService } from '@/services/api.service';

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
        setMessages(response.data);
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

  const sendMessage = useCallback((content: string) => {
    if (socket && content.trim()) {
      socket.emit('send_message', {
        channelId,
        content: content.trim()
      });
    }
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
```


## Phase 3: Transform Existing Components

### 3.1 Update ChatChannel Component

Replace the existing `ChatChannel` component with real functionality:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useArenaChat } from '@/hooks/useArenaChat';
import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';

interface ChatChannelProps {
  channelId: string;
  channelName: string;
  canMessage: boolean;
}

const ChatChannel: React.FC<ChatChannelProps> = ({ channelId, channelName, canMessage }) => {
  const { user } = useUser();
  const { messages, loading, typing, sendMessage, sendTyping } = useArenaChat(channelId);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
      handleStopTyping();
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-base-content/60">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Hash className="h-5 w-5" />
          {channelName}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message._id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content text-sm font-medium">
              {message.username[^0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-base-content">
                  {message.username}
                </span>
                <span className="text-xs text-base-content/60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-base-content break-words">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing.length > 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <p className="text-base-content/60 text-sm">
                {typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {canMessage && (
        <div className="p-4 border-t border-base-300">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message #${channelName}`}
              className="flex-1 input input-bordered"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatChannel;
```


### 3.2 Update ArenaPage Component

Modify the existing `ArenaPage.tsx` to integrate with real backend data:

**Key Changes Needed:**

1. **Replace dummy data with real API calls**:
    - Use `useArenaChannels()` hook instead of static `channelGroups`
    - Replace hardcoded channel IDs with real database IDs
2. **Add Socket.IO connection status**:
    - Use `useArenaSocket()` hook to show connection status
    - Add visual indicator for online/offline status
3. **Update channel rendering**:
    - Map real channel data to existing UI structure
    - Handle loading and error states appropriately
4. **Connect channel content rendering**:
    - Update `renderChannelContent()` to pass real channel data
    - Handle different channel types (text, announcement, readonly)
```typescript
// Key modifications to existing ArenaPage component:

// 1. Replace imports and add new hooks
import { useArenaChannels } from '@/hooks/useArenaChannels';
import { useArenaSocket } from '@/hooks/useArenaSocket';

// 2. Replace state initialization
const ArenaPage: React.FC = () => {
  const { channels, loading, error } = useArenaChannels();
  const { socket, isConnected } = useArenaSocket();
  // ... keep existing state variables

  // 3. Add default channel selection
  useEffect(() => {
    if (channels && Object.keys(channels).length > 0 && !activeChannel) {
      const firstGroup = Object.values(channels)[^0];
      if (firstGroup && firstGroup.length > 0) {
        setActiveChannel(firstGroup[^0]._id);
      }
    }
  }, [channels, activeChannel]);

  // 4. Add loading/error handling
  if (loading) {
    return (
      <div className="flex h-screen bg-base-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-2 text-base-content/60">Loading Arena...</p>
          </div>
        </div>
      </div>
    );
  }

  // 5. Replace channel group mapping
  {Object.entries(channels).map(([group, channelList]) => (
    // ... existing UI structure with real data
  ))}
};
```


## Phase 4: Additional Features Implementation

### 4.1 Create Project Showcase Hook

Create `src/hooks/useArenaShowcase.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';

export interface Project {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  gitRepositoryUrl: string;
  demoUrl: string;
  username: string;
  upvotes: number;
  hasUpvoted: boolean;
  submittedAt: Date;
}

export const useArenaShowcase = () => {
  const { getToken, isSignedIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchProjects = async () => {
      try {
        const response = await ApiService.getShowcaseProjects(getToken);
        setProjects(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getToken, isSignedIn]);

  const upvoteProject = async (projectId: string) => {
    try {
      await ApiService.upvoteProject(projectId, getToken);
      setProjects(prev => prev.map(project => 
        project._id === projectId 
          ? { ...project, upvotes: project.upvotes + 1, hasUpvoted: true }
          : project
      ));
    } catch (error) {
      console.error('Failed to upvote project:', error);
    }
  };

  return { projects, loading, error, upvoteProject };
};
```


### 4.2 Create Hackathon Hook

Create `src/hooks/useArenaHackathon.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiService } from '@/services/api.service';

export interface Hackathon {
  _id: string;
  title: string;
  description: string;
  problem: string;
  constraints: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  leaderboard: Array<{
    userId: string;
    username: string;
    score: number;
    submissionTime: Date;
  }>;
}

export const useArenaHackathon = () => {
  const { getToken, isSignedIn } = useAuth();
  const [currentHackathon, setCurrentHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchHackathon = async () => {
      try {
        const response = await ApiService.getCurrentHackathon(getToken);
        setCurrentHackathon(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch hackathon');
        console.error('Error fetching hackathon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [getToken, isSignedIn]);

  return { currentHackathon, loading, error };
};
```


### 4.3 Update Placeholder Components

Replace the following placeholder components with functional implementations:

1. **ShowcaseChannel**: Use `useArenaShowcase` hook to display real projects
2. **HackathonChannel**: Use `useArenaHackathon` hook to show current hackathon
3. **AnnouncementsChannel**: Use `useArenaChat` with readonly mode for announcements
4. **RulesChannel**: Static content component for community rules

## Phase 5: Error Handling and Polish

### 5.1 Add Error Boundaries

Create `src/components/arena/ArenaErrorBoundary.tsx`:

```typescript
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ArenaErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Arena Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-base-content/60 mb-4">
              There was an error in the Arena. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ArenaErrorBoundary;
```


### 5.2 Add Loading States

Implement consistent loading states across all components:

- **Skeleton loaders** for message lists
- **Loading spinners** for API calls
- **Progressive loading** for images and content
- **Optimistic updates** for user interactions


### 5.3 Add Offline Handling

Implement offline functionality:

- **Connection status indicators**
- **Offline message queuing**
- **Retry mechanisms** for failed requests
- **Graceful degradation** when backend is unavailable


## Implementation Requirements

### Best Practices to Follow

1. **Preserve Existing UI**: Keep all existing styling, animations, and layout patterns
2. **Use Current Auth Pattern**: Follow existing Clerk authentication integration
3. **Maintain Type Safety**: Use TypeScript interfaces for all data structures
4. **Error Handling**: Implement comprehensive error boundaries and fallbacks
5. **Performance**: Use React.memo and useMemo for expensive operations
6. **Accessibility**: Maintain existing accessibility patterns

### Testing Requirements

After each phase, test:

- [ ] **Socket.IO connection** establishes correctly
- [ ] **Real-time messaging** works across multiple browser tabs
- [ ] **Channel switching** loads correct data
- [ ] **Authentication** integrates properly with existing system
- [ ] **Error handling** shows appropriate messages
- [ ] **No regressions** in existing functionality


### Environment Setup

Ensure your `.env` file includes:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_BACKEND_URL=http://localhost:3001
```


## Success Criteria

The implementation is complete when:

- [ ] All existing UI patterns are preserved
- [ ] Real-time messaging works seamlessly
- [ ] Channel navigation is functional
- [ ] Project showcase displays real data
- [ ] Hackathon integration works
- [ ] Error handling is comprehensive
- [ ] Performance is optimized
- [ ] No existing functionality is broken


## Final Notes

- **Incremental Implementation**: Complete each phase before moving to the next
- **Test Thoroughly**: Verify each feature works with your running backend
- **Maintain Consistency**: Follow existing code patterns and naming conventions
- **Document Issues**: Note any backend API inconsistencies or missing features
- **Performance Focus**: Optimize for smooth real-time interactions

This implementation will transform your static Arena page into a fully functional real-time community platform while maintaining all existing UI patterns and user experience design.
