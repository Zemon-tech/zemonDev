
## Context and Overview

You need to implement the backend for an Arena page in a ZemonDev application. This is a Discord-like community platform with real-time chat, project showcase, and hackathon features. The Arena page will serve as a collaborative hub with three main sections: **Getting Started**, **Community**, and **Hackathons**.

**Current Tech Stack:**

- **Backend**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk (existing system)
- **Real-time**: Need to implement Socket.IO
- **Caching**: Upstash Redis (existing)

**Important**: This is an addition to an existing project. Do NOT modify existing functionality or break current UI. Follow the existing code patterns and architecture.

## What You Need to Build

### 1. Database Schema Implementation

Create the following Mongoose models in the `src/models/` directory:

#### ArenaChannel Model

```typescript
interface ArenaChannel {
  _id: ObjectId;
  name: string;
  type: 'text' | 'announcement' | 'readonly';
  group: 'getting-started' | 'community' | 'hackathons';
  description?: string;
  isActive: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  moderators: ObjectId[];
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
}
```


#### ArenaMessage Model

```typescript
interface ArenaMessage {
  _id: ObjectId;
  channelId: ObjectId;
  userId: ObjectId;
  username: string;
  content: string;
  type: 'text' | 'system';
  replyToId?: ObjectId;
  mentions: ObjectId[];
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: ObjectId;
}
```


#### ProjectShowcase Model

```typescript
interface ProjectShowcase {
  _id: ObjectId;
  title: string;
  description?: string;
  images: string[]; // Max 3 URLs
  gitRepositoryUrl: string;
  demoUrl: string;
  userId: ObjectId;
  username: string;
  upvotes: number;
  upvotedBy: ObjectId[];
  submittedAt: Date;
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: ObjectId;
}
```


#### WeeklyHackathon Model

```typescript
interface WeeklyHackathon {
  _id: ObjectId;
  title: string;
  description: string;
  problem: string;
  constraints: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: ObjectId;
  winners: Array<{
    userId: ObjectId;
    username: string;
    position: number;
    score: number;
  }>;
  leaderboard: Array<{
    userId: ObjectId;
    username: string;
    score: number;
    submissionTime: Date;
  }>;
}
```


#### HackathonSubmission Model

```typescript
interface HackathonSubmission {
  _id: ObjectId;
  hackathonId: ObjectId;
  userId: ObjectId;
  username: string;
  solution: string;
  codeFiles?: string[];
  demoUrl?: string;
  explanation: string;
  submittedAt: Date;
  score?: number;
  feedback?: string;
  isWinner: boolean;
  position?: number;
}
```


#### UserChannelStatus Model

```typescript
interface UserChannelStatus {
  _id: ObjectId;
  userId: ObjectId;
  channelId: ObjectId;
  lastReadMessageId?: ObjectId;
  lastReadTimestamp: Date;
  isBanned: boolean;
  banExpiresAt?: Date;
  banReason?: string;
  bannedBy?: ObjectId;
  isKicked: boolean;
  kickedAt?: Date;
  kickedBy?: ObjectId;
}
```


#### UserRole Model

```typescript
interface UserRole {
  _id: ObjectId;
  userId: ObjectId;
  role: 'user' | 'moderator' | 'admin';
  channelId?: ObjectId;
  grantedBy: ObjectId;
  grantedAt: Date;
}
```


### 2. API Routes Implementation

Create the following route files in `src/api/` directory:

#### Arena Channel Routes (`arena-channels.routes.ts`)

```typescript
// GET /api/arena/channels - Get all channels grouped by category
// GET /api/arena/channels/:channelId/messages - Get messages for a channel
// POST /api/arena/channels/:channelId/messages - Send message to channel
// DELETE /api/arena/channels/:channelId/messages/:messageId - Delete message
// GET /api/arena/channels/:channelId/unread-count - Get unread message count
```


#### Project Showcase Routes (`arena-showcase.routes.ts`)

```typescript
// GET /api/arena/showcase - Get all showcased projects
// POST /api/arena/showcase - Submit new project
// POST /api/arena/showcase/:projectId/upvote - Upvote project
// DELETE /api/arena/showcase/:projectId/upvote - Remove upvote
```


#### Hackathon Routes (`arena-hackathons.routes.ts`)

```typescript
// GET /api/arena/hackathons/current - Get current/active hackathon
// GET /api/arena/hackathons/:hackathonId/leaderboard - Get leaderboard
// POST /api/arena/hackathons/:hackathonId/submit - Submit solution
// GET /api/arena/hackathons/history - Get hackathon history
```


#### User Management Routes (`arena-users.routes.ts`)

```typescript
// POST /api/arena/users/:userId/ban - Ban user from channel
// POST /api/arena/users/:userId/kick - Kick user from channel
// POST /api/arena/users/:userId/make-moderator - Make user moderator
```


### 3. Controllers Implementation

Create controllers in `src/controllers/` directory following the existing pattern:

#### Example Controller Structure

```typescript
// src/controllers/arenaChannels.controller.ts
import { Request, Response } from 'express';
import { ArenaChannel, ArenaMessage } from '../models';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

export const getChannels = asyncHandler(async (req: Request, res: Response) => {
  const channels = await ArenaChannel.find({ isActive: true })
    .sort({ group: 1, name: 1 });
  
  // Group by category and add unread counts
  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.group]) acc[channel.group] = [];
    acc[channel.group].push(channel);
    return acc;
  }, {} as Record<string, any[]>);

  return res.json(new ApiResponse(200, groupedChannels, 'Channels retrieved successfully'));
});
```


### 4. Socket.IO Implementation

#### Socket.IO Server Setup

Add Socket.IO to your Express server:

```typescript
// src/index.ts (modify existing file)
import { Server } from 'socket.io';
import { createServer } from 'http';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_channel', (channelId: string) => {
    socket.join(channelId);
  });

  socket.on('send_message', async (messageData) => {
    // Validate user, check permissions, save message
    // Broadcast to channel room
    io.to(messageData.channelId).emit('new_message', savedMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```


### 5. Services Implementation

Create service files in `src/services/` directory:

#### Arena Channel Service

```typescript
// src/services/arenaChannel.service.ts
export class ArenaChannelService {
  static async getChannelsForUser(userId: string) {
    // Get channels with unread counts
  }

  static async createMessage(messageData: any) {
    // Create and save message
  }

  static async getUnreadMessageCount(userId: string, channelId: string) {
    // Calculate unread messages
  }
}
```


### 6. Middleware Implementation

#### Authentication Middleware for Socket.IO

```typescript
// src/middleware/socketAuth.middleware.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;
    // Verify token and attach user info to socket
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};
```


## Step-by-Step Implementation Instructions

### Phase 1: Database Models

1. Create all 7 Mongoose models in `src/models/` directory
2. Add proper indexes for performance (channelId, userId, timestamp)
3. Add validation rules and required fields
4. Export all models from a central index file

### Phase 2: Basic API Routes

1. Create route files for each feature area
2. Implement CRUD operations for each model
3. Add proper authentication middleware using existing Clerk integration
4. Add input validation and error handling
5. Use existing `ApiResponse` utility for consistent responses

### Phase 3: Socket.IO Integration

1. Add Socket.IO dependencies to package.json
2. Modify existing Express server to support Socket.IO
3. Implement real-time message handling
4. Add room-based channel subscriptions
5. Handle user authentication for socket connections

### Phase 4: Advanced Features

1. Implement user ban/kick functionality
2. Add role-based permissions (user, moderator, admin)
3. Create project showcase upvoting system
4. Implement hackathon submission and scoring
5. Add unread message tracking

### Phase 5: Testing and Integration

1. Test all API endpoints
2. Verify Socket.IO real-time functionality
3. Test authentication and authorization
4. Ensure no existing functionality is broken
5. Add proper error handling and logging

## Key Requirements

### Best Practices to Follow

- **Follow existing code patterns** in the project
- **Use existing middleware** for authentication and error handling
- **Implement proper validation** for all inputs
- **Add comprehensive error handling**
- **Use TypeScript interfaces** for type safety
- **Follow RESTful API conventions**
- **Add proper logging** for debugging
- **Use async/await** with proper error handling
- **Implement rate limiting** for API endpoints


### Security Considerations

- **Validate all user inputs** to prevent injection attacks
- **Check user permissions** before allowing operations
- **Rate limit Socket.IO connections** to prevent abuse
- **Sanitize message content** to prevent XSS
- **Use existing Clerk authentication** - don't create new auth system


### Performance Optimizations

- **Add database indexes** for frequently queried fields
- **Implement message pagination** for chat history
- **Use Redis caching** for frequently accessed data
- **Optimize Socket.IO rooms** for channel management
- **Add connection pooling** for database operations


### Environment Variables to Add

```env
# Add these to your .env file
SOCKET_IO_PORT=3001
ARENA_UPLOAD_PATH=/uploads/arena
MAX_FILE_SIZE=10MB
MAX_IMAGES_PER_PROJECT=3
ARENA_ENABLED=true
```


### Package Dependencies to Install

```bash
npm install socket.io @types/socket.io
npm install multer @types/multer  # For file uploads
npm install express-rate-limit    # If not already installed
```


## Final Checklist

Before considering the implementation complete:

- [ ] All database models created and properly indexed
- [ ] All API routes implemented and tested
- [ ] Socket.IO server integrated with existing Express app
- [ ] Real-time messaging working correctly
- [ ] User authentication integrated with Clerk
- [ ] Role-based permissions implemented
- [ ] File upload functionality for project images
- [ ] Ban/kick user functionality working
- [ ] Hackathon submission system operational
- [ ] Project showcase upvoting functional
- [ ] Unread message tracking implemented
- [ ] All existing functionality still working
- [ ] Proper error handling and logging added
- [ ] API documentation updated

**Remember**: This is an addition to an existing codebase. Do not modify existing files unless absolutely necessary. Follow the existing architecture and patterns. Test thoroughly to ensure no regressions.
