import { Socket } from 'socket.io';
import { verifyToken } from '@clerk/clerk-sdk-node';

/**
 * Socket.IO authentication middleware
 * Verifies the JWT token from the socket handshake using Clerk SDK
 * 
 * @param socket - Socket.IO socket instance
 * @param next - Next function to call when authentication is complete
 */
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
    
    try {
      // Use Clerk's proper token verification
      const session = await verifyToken(tokenValue, {
        secretKey: process.env.CLERK_SECRET_KEY,
        issuer: process.env.CLERK_ISSUER || 'https://clerk.yourdomain.com'
      });
      
      if (!session) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Attach user info to socket
      socket.data.user = {
        userId: session.sub,
        sessionId: session.sid || ''
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
}; 