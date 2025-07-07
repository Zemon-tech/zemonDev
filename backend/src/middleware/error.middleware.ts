import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import env from '../config/env';

/**
 * Handles different error types and sends a standardized response.
 * @param err The error object
 * @param res The Express response object
 */
const handleKnownErrors = (err: any, res: Response) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier. Malformed ${err.path}: ${err.value}.`;
    error = new AppError(message, 400);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for '${value}'. Please use another value.`;
    error = new AppError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }

  // Clerk/JWT Authentication Errors - Enhanced handling
  if (
    err.name === 'JsonWebTokenError' || 
    err.message?.includes('Unauthenticated') || 
    err.message?.includes('unauthorized') ||
    err.message?.includes('Not authorized') ||
    err.name === 'ClerkError' ||
    err.name === 'AuthenticationError'
  ) {
    error = new AppError('Authentication failed. Please sign in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please sign in again.', 401);
  }

  // Send the refined error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    // Only include stack in development
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Global Error Handling Middleware
 * Catches all errors and sends an appropriate HTTP response.
 */
const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;

  // Log all errors for debugging purposes
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Special handling for Clerk authentication errors to ensure 401 status
  if (err.message === 'Unauthenticated' || err.message?.includes('Authentication')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please sign in again.',
    });
  }
  
  // For operational errors we trust, and other known errors (DB, JWT)
  if (err.isOperational || err.name === 'CastError' || err.code === 11000 || err.name === 'ValidationError' || err.name.includes('Token')) {
    handleKnownErrors(err, res);
  } else {
    // For unknown/programming errors, send a generic message in production
    res.status(500).json({
      success: false,
      message: 'An unexpected internal server error occurred.',
    });
  }
};

export default errorMiddleware; 