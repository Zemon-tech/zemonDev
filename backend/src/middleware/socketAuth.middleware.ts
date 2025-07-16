import { Socket } from 'socket.io';
import { verifyToken } from '@clerk/clerk-sdk-node';
import User, { IUser } from '../models/user.model'; // Import IUser

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

      // Look up the user in MongoDB by clerkId
      const user = await User.findOne({ clerkId: session.sub }) as IUser;
      if (!user) {
        return next(new Error('Authentication error: User not found in DB'));
      }

      // Attach MongoDB user _id as userId
      socket.data.user = {
        userId: String(user._id), // Explicitly cast to string
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