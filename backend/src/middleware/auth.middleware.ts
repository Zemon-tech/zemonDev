import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import User from '../models/user.model';

// Extend the Express Request interface to include user and auth
declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: {
        userId: string;
        sessionId: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to protect routes using Clerk authentication
 */
const protect = [
  // First use Clerk's middleware to verify the token
  ClerkExpressRequireAuth({}),
  
  // Then fetch the user from our database
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !req.auth.userId) {
      return next(new AppError('Not authorized', 401));
    }

    // Find user by clerkId
    const user = await User.findOne({ clerkId: req.auth.userId });

    // If user doesn't exist in our database
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Attach user to request object
    req.user = user;
    next();
  })
];

export { protect }; 