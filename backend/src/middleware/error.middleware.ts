import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import env from '../config/env';

interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    stack?: string;
    statusCode: number;
  };
}

/**
 * Global error handling middleware
 */
const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error: ', err);
  }

  // Default error
  let statusCode = 500;
  let message = 'Server Error';

  // AppError instance
  if ('statusCode' in err) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      statusCode
    }
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorMiddleware; 