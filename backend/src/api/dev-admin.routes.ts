import { Router, Request, Response, NextFunction } from 'express';
import { ArenaChannel } from '../models';
import { ArenaMessage } from '../models';
import { ProjectShowcase } from '../models';
import User from '../models/user.model';
import UserRole from '../models/userRole.model';
import UserChannelStatus from '../models/userChannelStatus.model';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import AppError from '../utils/AppError';
import mongoose from 'mongoose';
import { clearCache } from '../middleware/cache.middleware';

const router = Router();

/**
 * @desc    Create a new channel (DEVELOPMENT ONLY)
 * @route   POST /api/dev-admin/channels
 * @access  Development only
 */
router.post('/channels', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure parentChannelId is null or a valid ObjectId
    if (req.body.parentChannelId === '' || req.body.parentChannelId === undefined) {
      req.body.parentChannelId = null;
    } else if (req.body.parentChannelId && !mongoose.Types.ObjectId.isValid(req.body.parentChannelId)) {
      return next(new AppError('Invalid parentChannelId', 400));
    }
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
  // Ensure parentChannelId is null or a valid ObjectId
  if (req.body.parentChannelId === '' || req.body.parentChannelId === undefined) {
    req.body.parentChannelId = null;
  } else if (req.body.parentChannelId && !mongoose.Types.ObjectId.isValid(req.body.parentChannelId)) {
    return next(new AppError('Invalid parentChannelId', 400));
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
 * @desc    Get all channels (DEVELOPMENT ONLY)
 * @route   GET /api/dev-admin/channels
 * @access  Development only
 */
router.get('/channels', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const channels = await ArenaChannel.find({}).sort({ group: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, 'Channels fetched successfully', channels));
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
 * @desc    Bulk delete messages (DEVELOPMENT ONLY)
 * @route   DELETE /api/dev-admin/messages/bulk
 * @access  Development only
 */
router.delete('/messages/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Request body must have a non-empty array of ids', 400));
  }
  const result = await ArenaMessage.deleteMany({ _id: { $in: ids } });
  res.status(200).json(new ApiResponse(200, 'Messages deleted successfully', { deletedCount: result.deletedCount }));
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

/**
 * @desc    Get all showcased projects (DEVELOPMENT ONLY)
 * @route   GET /api/dev-admin/showcase
 * @access  Development only
 */
router.get('/showcase', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const total = await ProjectShowcase.countDocuments();
  const projects = await ProjectShowcase.find()
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json(new ApiResponse(200, 'Showcase projects fetched successfully', {
    projects,
    page,
    limit,
    total
  }));
}));

/**
 * @desc    Create a showcase project (DEVELOPMENT ONLY)
 * @route   POST /api/dev-admin/showcase
 * @access  Development only
 */
router.post('/showcase', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const required = ['title', 'gitRepositoryUrl', 'demoUrl', 'userId', 'username', 'upvotes', 'upvotedBy', 'submittedAt', 'isApproved'];
  for (const field of required) {
    if (req.body[field] === undefined) {
      return next(new AppError(`Missing required field: ${field}`, 400));
    }
  }
  const project = await ProjectShowcase.create(req.body);
  res.status(201).json(new ApiResponse(201, 'Showcase project created successfully', project));
}));

/**
 * @desc    Edit a showcase project (DEVELOPMENT ONLY)
 * @route   PUT /api/dev-admin/showcase/:id
 * @access  Development only
 */
router.put('/showcase/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid project ID', 400));
  }
  const project = await ProjectShowcase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!project) {
    return next(new AppError('Showcase project not found', 404));
  }
  // If project is approved, clear the cache for instant update
  if (req.body.isApproved === true) {
    // Clear all cache keys for /api/arena/showcase (with any query params)
    await clearCache('anonymous:/api/arena/showcase');
    console.log('[DEBUG] Cleared cache for pattern: anonymous:/api/arena/showcase*');
  }
  res.status(200).json(new ApiResponse(200, 'Showcase project updated successfully', project));
}));

/**
 * @desc    Delete a showcase project (DEVELOPMENT ONLY)
 * @route   DELETE /api/dev-admin/showcase/:id
 * @access  Development only
 */
router.delete('/showcase/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid project ID', 400));
  }
  const project = await ProjectShowcase.findByIdAndDelete(id);
  if (!project) {
    return next(new AppError('Showcase project not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'Showcase project deleted successfully', { id }));
}));

/**
 * @desc    Get all users (DEVELOPMENT ONLY)
 * @route   GET /api/dev-admin/users
 * @access  Development only
 */
router.get('/users', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const total = await User.countDocuments();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).json(new ApiResponse(200, 'Users fetched successfully', {
    users,
    page,
    limit,
    total
  }));
}));

/**
 * @desc    Create a user (DEVELOPMENT ONLY)
 * @route   POST /api/dev-admin/users
 * @access  Development only
 */
router.post('/users', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const required = ['fullName', 'email', 'username'];
  for (const field of required) {
    if (req.body[field] === undefined) {
      return next(new AppError(`Missing required field: ${field}`, 400));
    }
  }
  const user = await User.create(req.body);
  res.status(201).json(new ApiResponse(201, 'User created successfully', user));
}));

/**
 * @desc    Bulk create users (DEVELOPMENT ONLY)
 * @route   POST /api/dev-admin/users/bulk
 * @access  Development only
 */
router.post('/users/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const users = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return next(new AppError('Request body must be a non-empty array of users', 400));
  }
  const created = await User.insertMany(users);
  res.status(201).json(new ApiResponse(201, 'Users created successfully', created));
}));

/**
 * @desc    Bulk delete users (DEVELOPMENT ONLY)
 * @route   DELETE /api/dev-admin/users/bulk
 * @access  Development only
 */
router.delete('/users/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Request body must have a non-empty array of ids', 400));
  }
  const result = await User.deleteMany({ _id: { $in: ids } });
  res.status(200).json(new ApiResponse(200, 'Users deleted successfully', { deletedCount: result.deletedCount }));
}));

/**
 * @desc    Edit a user (DEVELOPMENT ONLY)
 * @route   PUT /api/dev-admin/users/:id
 * @access  Development only
 */
router.put('/users/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user ID', 400));
  }
  const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'User updated successfully', user));
}));

/**
 * @desc    Delete a user (DEVELOPMENT ONLY)
 * @route   DELETE /api/dev-admin/users/:id
 * @access  Development only
 */
router.delete('/users/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user ID', 400));
  }
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'User deleted successfully', { id }));
}));

// USER ROLES CRUD & BULK
/**
 * @desc    Get all user roles (DEVELOPMENT ONLY)
 * @route   GET /api/dev-admin/user-roles
 * @access  Development only
 */
router.get('/user-roles', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const total = await UserRole.countDocuments();
  const roles = await UserRole.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.status(200).json(new ApiResponse(200, 'User roles fetched successfully', { roles, page, limit, total }));
}));

router.post('/user-roles', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const required = ['userId', 'role'];
  for (const field of required) {
    if (req.body[field] === undefined) {
      return next(new AppError(`Missing required field: ${field}`, 400));
    }
  }
  const role = await UserRole.create(req.body);
  res.status(201).json(new ApiResponse(201, 'User role created successfully', role));
}));

router.put('/user-roles/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user role ID', 400));
  }
  const role = await UserRole.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!role) {
    return next(new AppError('User role not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'User role updated successfully', role));
}));

router.delete('/user-roles/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user role ID', 400));
  }
  const role = await UserRole.findByIdAndDelete(id);
  if (!role) {
    return next(new AppError('User role not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'User role deleted successfully', { id }));
}));

router.post('/user-roles/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const roles = req.body;
  if (!Array.isArray(roles) || roles.length === 0) {
    return next(new AppError('Request body must be a non-empty array of user roles', 400));
  }
  const created = await UserRole.insertMany(roles);
  res.status(201).json(new ApiResponse(201, 'User roles created successfully', created));
}));

router.delete('/user-roles/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Request body must have a non-empty array of ids', 400));
  }
  const result = await UserRole.deleteMany({ _id: { $in: ids } });
  res.status(200).json(new ApiResponse(200, 'User roles deleted successfully', { deletedCount: result.deletedCount }));
}));

// USER STATUS CRUD & BULK
/**
 * @desc    Get all user channel status (DEVELOPMENT ONLY)
 * @route   GET /api/dev-admin/user-status
 * @access  Development only
 */
router.get('/user-status', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const total = await UserChannelStatus.countDocuments();
  const status = await UserChannelStatus.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.status(200).json(new ApiResponse(200, 'User channel status fetched successfully', { status, page, limit, total }));
}));

router.post('/user-status', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const required = ['userId', 'channelId'];
  for (const field of required) {
    if (req.body[field] === undefined) {
      return next(new AppError(`Missing required field: ${field}`, 400));
    }
  }
  // Validate status
  let status = req.body.status;
  if (!status) status = 'pending';
  if (!['pending', 'approved', 'denied'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }
  const statusDoc = await UserChannelStatus.create({ ...req.body, status });
  res.status(201).json(new ApiResponse(201, 'User channel status created successfully', statusDoc));
}));

const ensureSubchannelsAndAddUser = async (userId: string, parentChannelId: string) => {
  const subchannelNames = ['chat', 'announcement', 'showcase'];
  // Get a valid user ID for createdBy (use the first user or create a system user)
  let systemUserId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
  try {
    const firstUser = await User.findOne().select('_id');
    if (firstUser && firstUser._id) {
      systemUserId = firstUser._id as mongoose.Types.ObjectId;
    }
  } catch (error) {
    // If no users exist, use a generated ObjectId
    console.warn('No users found for system channel creation, using generated ID');
  }
  
  for (const name of subchannelNames) {
    let sub = await ArenaChannel.findOne({ name, parentChannelId });
    if (!sub) {
      sub = await ArenaChannel.create({
        name,
        type: name === 'announcement' ? 'announcement' : 'text',
        group: 'community', // or inherit from parent if needed
        isActive: true,
        createdBy: systemUserId, // Use valid ObjectId instead of string
        moderators: [],
        permissions: { canMessage: true, canRead: true },
        parentChannelId,
      });
    }
    // Add user to subchannel if not already present
    const exists = await UserChannelStatus.findOne({ userId, channelId: sub._id });
    if (!exists) {
      await UserChannelStatus.create({ userId, channelId: sub._id, status: 'approved' });
    }
  }
};

router.put('/user-status/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user status ID', 400));
  }
  // Validate status if provided
  if (req.body.status && !['pending', 'approved', 'denied'].includes(req.body.status)) {
    return next(new AppError('Invalid status value', 400));
  }
  const prev = await UserChannelStatus.findById(id);
  const statusDoc = await UserChannelStatus.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!statusDoc) {
    return next(new AppError('User channel status not found', 404));
  }
  // If status transitioned to 'approved', add to subchannels
  if (prev && req.body.status === 'approved' && prev.status !== 'approved') {
    await ensureSubchannelsAndAddUser(prev.userId.toString(), prev.channelId.toString());
  }
  res.status(200).json(new ApiResponse(200, 'User channel status updated successfully', statusDoc));
}));

router.delete('/user-status/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid user status ID', 400));
  }
  const status = await UserChannelStatus.findByIdAndDelete(id);
  if (!status) {
    return next(new AppError('User channel status not found', 404));
  }
  res.status(200).json(new ApiResponse(200, 'User channel status deleted successfully', { id }));
}));

router.post('/user-status/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const status = req.body;
  if (!Array.isArray(status) || status.length === 0) {
    return next(new AppError('Request body must be a non-empty array of user status', 400));
  }
  const created = await UserChannelStatus.insertMany(status);
  res.status(201).json(new ApiResponse(201, 'User channel status created successfully', created));
}));

router.delete('/user-status/bulk', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new AppError('Request body must have a non-empty array of ids', 400));
  }
  const result = await UserChannelStatus.deleteMany({ _id: { $in: ids } });
  res.status(200).json(new ApiResponse(200, 'User channel status deleted successfully', { deletedCount: result.deletedCount }));
}));

/**
 * @desc    Get all users with 'approved' status for a given channel
 * @route   GET /api/dev-admin/channels/:channelId/approved-users
 * @access  Development only
 */
router.get('/channels/:channelId/approved-users', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { channelId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    return next(new AppError('Invalid channel ID', 400));
  }
  // Find all user-channel statuses for this channel with status 'approved'
  const statuses = await UserChannelStatus.find({ channelId, status: 'approved' });
  const userIds = statuses.map(s => s.userId);
  // Fetch user details
  const users = await User.find({ _id: { $in: userIds } }).select('_id username fullName email');
  res.status(200).json(new ApiResponse(200, 'Approved users fetched successfully', users));
}));

export default router; 