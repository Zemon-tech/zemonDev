import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import User from '../models/user.model';
import { UserRole } from '../models';

// Extend the Express Request interface to include user and auth
declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: () => Promise<string>;
      };
      userRole?: any; // Add userRole property
    }
  }
}

/**
 * Middleware to protect routes using Clerk authentication.
 * 
 * This middleware chain first uses Clerk's `ClerkExpressRequireAuth` to validate
 * the session. If the user is authenticated, it populates `req.auth`.
 * 
 * The second middleware then uses the `req.auth.userId` to find the corresponding
 * user in the application's local database and attaches it to `req.user`.
 * 
 * If authentication fails at any step, an error is thrown and handled by the
 * global error handler, which returns a 401 Unauthorized response.
 */
export const protect = [
  (req: Request, res: Response, next: NextFunction) => {
    // Removed noisy debug log for Authorization header
    next();
  },
  // 1. Authenticate the request using Clerk. 
  // This will throw an error if the user is not authenticated, which is
  // caught by our global error handler. If successful, it attaches the
  // `auth` object to the request.
  ClerkExpressRequireAuth({
    onError: (err) => {
      console.error('[DEBUG] Clerk authentication error:', err);
      // The error is automatically passed to the next middleware (the error handler)
      // so we don't need to call next() here.
    }
  }),
  
  // 2. If Clerk authentication is successful, fetch the user from our database.
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Defensive check, although Clerk's middleware should ensure this exists.
    if (!req.auth || !req.auth.userId) {
      // This indicates a configuration issue if it ever happens.
      return next(new AppError('User authentication data not found after validation.', 500));
    }

    try {
      // Find the user in our local database using the Clerk user ID.
      const user = await User.findOne({ clerkId: req.auth.userId });

      // If the user doesn't exist in our database, it's an error.
      // This could happen if a user was deleted from our DB but not from Clerk.
      if (!user) {
        return next(new AppError('User not found in application database.', 404));
      }

      // Attach the full user object to the request for use in subsequent controllers.
      req.user = user;
      next();
    } catch (error) {
      console.error('Error fetching user data from database:', error);
      next(new AppError('An error occurred while authenticating the user.', 500));
    }
  })
];

/**
 * Middleware to check if user has required role
 * @param roles Array of roles that are allowed to access the route
 * @param checkChannel Whether to check for channel-specific role (requires channelId in request body or params)
 */
/**
 * Middleware to require authentication
 */
export const requireAuth = [
  ClerkExpressRequireAuth({
    onError: (err) => {
      console.error('[DEBUG] Clerk authentication error:', err);
    }
  })
];

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // User must be authenticated first
  if (!req.auth || !req.auth.userId) {
    return next(new AppError('Unauthorized', 401));
  }

  try {
    // Find the user in our local database using the Clerk user ID
    const user = await User.findOne({ clerkId: req.auth.userId });
    
    // If the user doesn't exist in our database, it's an error
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if user has admin role
    const userRole = await UserRole.findOne({
      userId: user._id,
      role: 'admin'
    });

    if (!userRole) {
      return next(new AppError('Access denied. Admin role required', 403));
    }

    // Attach the user object to the request for use in subsequent controllers
    req.user = user;
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    next(new AppError('An error occurred while checking permissions', 500));
  }
});

export const checkRole = (roles: ('admin' | 'moderator')[], checkChannel = false) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // User must be authenticated first
    if (!req.user || !req.user._id) {
      return next(new AppError('Unauthorized', 401));
    }

    const userId = req.user._id;
    
    // If checking channel-specific roles, get channelId from request
    let channelId;
    if (checkChannel) {
      channelId = req.params.channelId || req.body.channelId;
      if (!channelId) {
        return next(new AppError('Channel ID is required', 400));
      }
    }

    // Build query to check if user has any of the required roles
    const query: any = {
      userId,
      role: { $in: roles }
    };

    // If checking channel role, add channelId to query or check for global role (null channelId)
    if (checkChannel && channelId) {
      query.$or = [
        { channelId }, // Channel-specific role
        { channelId: { $exists: false } } // Global role
      ];
    }

    // Check if user has required role
    const userRole = await UserRole.findOne(query);

    if (!userRole) {
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }

    // Add role info to request for use in controllers
    req.userRole = userRole;
    next();
  });
};