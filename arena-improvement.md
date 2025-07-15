## Context
You need to fix **critical security vulnerabilities** in the Arena page socket service implementation. The current authentication middleware is unsafe and the rate limiting has bypass vulnerabilities.

## Current Issues to Fix

### 🔴 Critical Security Flaw in Authentication
The current `socketAuth.middleware.ts` is **parsing JWT tokens without signature verification** - this is a major security vulnerability that allows token forgery.

### 🔴 Rate Limiting Bypass Issue
The `socketRateLimit.middleware.ts` has TTL refresh logic problems that could allow rate limit bypass.

## What You Need to Implement

### 1. Fix JWT Authentication in `socketAuth.middleware.ts`

**Replace the current insecure token parsing with proper Clerk SDK verification:**

```typescript
// REPLACE the current simplified token parsing with proper Clerk verification
import { verifyToken } from '@clerk/clerk-sdk-node';

export const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    // Extract Bearer token
    if (!token.startsWith('Bearer ')) {
      return next(new Error('Authentication error: Invalid token format'));
    }

    const tokenValue = token.split(' ')[1];
    
    // Use Clerk's proper token verification
    const payload = await verifyToken(tokenValue, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    socket.data.user = {
      userId: payload.sub,
      sessionId: payload.sid || ''
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
```

### 2. Fix Rate Limiting in `socketRateLimit.middleware.ts`

**Fix the TTL refresh logic and add proper error handling:**

```typescript
export const socketRateLimit = async (socket: Socket, event: string, next: Function) => {
  try {
    const userId = socket.data.user?.userId;
    
    if (!userId) {
      return next();
    }

    const key = `ratelimit:socket:${userId}:${event}`;
    
    // Use Redis pipeline for atomic operations
    const multi = redisClient.multi();
    const currentCount = await redisClient.get(key);
    const count = currentCount ? parseInt(currentCount.toString(), 10) : 0;

    if (count >= MAX_MESSAGES_PER_WINDOW) {
      socket.emit('error', {
        message: 'Rate limit exceeded. Please try again later.',
        event,
        retryAfter: RATE_LIMIT_WINDOW
      });
      return;
    }

    // Proper TTL handling - use INCR and EXPIRE for atomic operations
    if (count === 0) {
      await multi.incr(key).expire(key, RATE_LIMIT_WINDOW).exec();
    } else {
      await multi.incr(key).exec();
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Log the error but don't block the request in case of Redis failure
    next();
  }
};
```

### 3. Add Comprehensive Error Handling

**Enhance error handling in `socket.service.ts`:**

- Add try-catch blocks around all async operations
- Implement proper error logging with context
- Add graceful degradation for Redis failures
- Include detailed error messages for debugging

**Example pattern to follow:**

```typescript
socket.on('send_message', async (messageData: any, callback: Function) => {
  try {
    // Validate input first
    if (!messageData.channelId || !messageData.content) {
      const error = 'Channel ID and content are required';
      socket.emit('error', { message: error });
      return callback({ success: false, message: error });
    }

    // Apply rate limiting with proper error handling
    await socketRateLimit(socket, 'send_message', async () => {
      // ... rest of the logic
    });

  } catch (error) {
    console.error('Error in send_message handler:', {
      error: error.message,
      userId: socket.data.user?.userId,
      channelId: messageData.channelId,
      timestamp: new Date().toISOString()
    });
    
    const errorMessage = 'Failed to send message';
    socket.emit('error', { message: errorMessage });
    callback({ success: false, message: errorMessage });
  }
});
```

## Requirements

### Security Requirements
- **Use only Clerk's official SDK methods** for token verification
- **Never parse JWT tokens manually** - always use proper verification
- **Implement atomic Redis operations** to prevent race conditions
- **Add rate limiting for all socket events** that can be abused

### Error Handling Requirements
- **Comprehensive logging** with user context and timestamps
- **Detailed error messages** for development/debugging
- **Generic error messages** sent to clients (don't expose internal details)

## Environment Variables

```env
# These env variable are already added, you don't need to add it manually
REDIS_MAX_RETRIES=3
SOCKET_ERROR_LOGGING=true
```

## Testing Requirements

After implementation, test the following:
- [ ] Valid Clerk tokens are accepted
- [ ] Invalid/expired tokens are rejected
- [ ] Rate limiting works correctly and can't be bypassed
- [ ] Redis failures don't crash the application
- [ ] All error cases are properly logged
- [ ] Socket connections work seamlessly with existing functionality

## Critical Notes

- **DO NOT break existing functionality** - only fix the security issues
- **Test thoroughly** - authentication failures will break the entire Arena feature
- **Use proper TypeScript types** for all Clerk SDK responses
- **Add proper JSDoc documentation** for all modified functions