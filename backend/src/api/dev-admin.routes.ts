import { Router, Request, Response, NextFunction } from 'express';
import { ArenaChannel } from '../models';
import { ArenaMessage } from '../models';
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

/**
 * @desc    Get all messages (DEVELOPMENT ONLY)
 * @route   GET /api/dev-admin/messages
 * @access  Development only
 */
router.get('/messages', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const total = await ArenaMessage.countDocuments();
  const messages = await ArenaMessage.find()
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json(new ApiResponse(200, 'Messages fetched successfully', {
    messages,
    page,
    limit,
    total
  }));
}));

/**
 * @desc    Create a message (DEVELOPMENT ONLY)
 * @route   POST /api/dev-admin/messages
 * @access  Development only
 */
router.post('/messages', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { channelId, userId, username, content, type, mentions, timestamp } = req.body;
  if (!channelId || !userId || !username || !content || !type || !timestamp) {
    return next(new AppError('Missing required fields', 400));
  }
  const message = await ArenaMessage.create({
    channelId,
    userId,
    username,
    content,
    type,
    mentions: mentions || [],
    timestamp,
    isEdited: false,
    isDeleted: false
  });
  res.status(201).json(new ApiResponse(201, 'Message created successfully', message));
}));

/**
 * @desc    Edit a message (DEVELOPMENT ONLY)
 * @route   PUT /api/dev-admin/messages/:id
 * @access  Development only
 */
router.put('/messages/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid message ID', 400));
  }
  const update = req.body;
  update.isEdited = true;
  update.editedAt = new Date();
  const message = await ArenaMessage.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!message) {
    return next(new AppError('Message not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'Message updated successfully', message));
}));

/**
 * @desc    Delete a message (DEVELOPMENT ONLY)
 * @route   DELETE /api/dev-admin/messages/:id
 * @access  Development only
 */
router.delete('/messages/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid message ID', 400));
  }
  const message = await ArenaMessage.findByIdAndDelete(id);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'Message deleted successfully', { id }));
}));

export default router; 