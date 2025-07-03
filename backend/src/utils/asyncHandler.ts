import { Request, Response, NextFunction } from 'express';

/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to catch rejections and pass them to the error middleware.
 * Eliminates the need for try-catch blocks in each controller.
 */
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler; 