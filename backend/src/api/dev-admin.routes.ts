import { Router, Request, Response, NextFunction } from 'express';
import { ArenaChannel } from '../models';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import AppError from '../utils/AppError';
import mongoose from 'mongoose';

const router = Router();

/**
 * @desc    Create a new channel (DEVELOPMENT ONLY)
 * @route   POST /api/dev-admin/channels
 * @access  Development only
 */
router.post('/channels', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channel = await ArenaChannel.create(req.body);
    res.status(201).json(
      new ApiResponse(
        201,
        'Channel created successfully',
        channel
      )
    );
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return next(new AppError(`Validation Error: ${error.message}`, 400));
    }
    next(error);
  }
}));

/**
 * @desc    Update a channel (DEVELOPMENT ONLY)
 * @route   PUT /api/dev-admin/channels/:id
 * @access  Development only
 */
router.put('/channels/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid channel ID', 400));
  }
  
  const channel = await ArenaChannel.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!channel) {
    return next(new AppError('Channel not found', 404));
  }
  
  res.status(200).json(
    new ApiResponse(
      200,
      'Channel updated successfully',
      channel
    )
  );
}));

/**
 * @desc    Delete a channel (DEVELOPMENT ONLY)
 * @route   DELETE /api/dev-admin/channels/:id
 * @access  Development only
 */
router.delete('/channels/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid channel ID', 400));
  }
  
  const channel = await ArenaChannel.findByIdAndDelete(id);
  
  if (!channel) {
    return next(new AppError('Channel not found', 404));
  }
  
  res.status(200).json(
    new ApiResponse(
      200,
      'Channel deleted successfully',
      { id }
    )
  );
}));

export default router; 