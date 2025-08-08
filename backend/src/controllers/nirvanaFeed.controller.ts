import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiResponse';
import { NirvanaHackathon, NirvanaNews, NirvanaTool, INirvanaHackathon, INirvanaNews, INirvanaTool } from '../models';
import { clearCache } from '../middleware/cache.middleware';

/**
 * @desc    Get all Nirvana feed items (hackathons, news, tools)
 * @route   GET /api/nirvana/feed
 * @access  Public
 */
export const getNirvanaFeed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, limit = 20, page = 1 } = req.query;
    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const skip = (numericPage - 1) * numericLimit;

    let feedItems: any[] = [];

    // Get hackathons
    if (!type || type === 'hackathon') {
      const hackathons = await NirvanaHackathon.find()
        .sort({ isPinned: -1, priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate('createdBy', 'username email profilePicture');

      feedItems.push(...hackathons.map((h: INirvanaHackathon) => ({
        id: h._id,
        type: 'hackathon',
        title: h.title,
        content: h.content,
        timestamp: h.createdAt,
        author: h.createdBy,
        metadata: {
          hackathonName: h.metadata.hackathonName,
          prize: h.prize,
          participants: h.participants,
          category: h.category,
          tags: h.tags,
          link: h.metadata.link,
          deadline: h.deadline,
          status: h.status
        },
        reactions: h.reactions,
        isPinned: h.isPinned,
        isVerified: h.isVerified,
        priority: h.priority
      })));
    }

    // Get news
    if (!type || type === 'news') {
      const news = await NirvanaNews.find()
        .sort({ isPinned: -1, priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate('createdBy', 'username email profilePicture');

      feedItems.push(...news.map((n: INirvanaNews) => ({
        id: n._id,
        type: 'news',
        title: n.title,
        content: n.content,
        timestamp: n.createdAt,
        author: n.createdBy,
        metadata: {
          category: n.category,
          tags: n.tags,
          link: n.metadata.link,
          progress: n.metadata.progress
        },
        reactions: n.reactions,
        isPinned: n.isPinned,
        isVerified: n.isVerified,
        priority: n.priority
      })));
    }

    // Get tools
    if (!type || type === 'tool') {
      const tools = await NirvanaTool.find()
        .sort({ isPinned: -1, priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate('createdBy', 'username email profilePicture');

      feedItems.push(...tools.map((t: INirvanaTool) => ({
        id: t._id,
        type: 'tool',
        title: t.title,
        content: t.content,
        timestamp: t.createdAt,
        author: t.createdBy,
        metadata: {
          toolName: t.toolName,
          category: t.category,
          tags: t.tags,
          link: t.metadata.link,
          rating: t.rating,
          views: t.views
        },
        reactions: t.reactions,
        isPinned: t.isPinned,
        isVerified: t.isVerified,
        priority: t.priority
      })));
    }

    // Sort all items by priority and creation date
    feedItems.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      if (a.priority !== b.priority) {
        const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'Nirvana feed retrieved successfully',
        {
          items: feedItems,
          pagination: {
            page: numericPage,
            limit: numericLimit,
            total: feedItems.length
          }
        }
      )
    );
  }
);

/**
 * @desc    Create a new hackathon
 * @route   POST /api/nirvana/hackathons
 * @access  Private
 */
export const createHackathon = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      content,
      description,
      prize,
      participants,
      category,
      tags,
      deadline,
      status,
      hackathonName,
      link,
      image
    } = req.body;

    const hackathon = await NirvanaHackathon.create({
      title,
      content,
      description,
      prize,
      participants: participants || 0,
      category,
      tags: tags || [],
      deadline,
      status: status || 'upcoming',
      createdBy: req.user._id,
      metadata: {
        hackathonName,
        link,
        image
      }
    });

    await hackathon.populate('createdBy', 'username email profilePicture');

    // Clear Nirvana feed cache to reflect changes
    await clearCache('nirvana/feed');

    res.status(201).json(
      new ApiResponse(
        201,
        'Hackathon created successfully',
        hackathon
      )
    );
  }
);

/**
 * @desc    Create a new news item
 * @route   POST /api/nirvana/news
 * @access  Private
 */
export const createNews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      content,
      category,
      tags,
      progress,
      link,
      image
    } = req.body;

    const news = await NirvanaNews.create({
      title,
      content,
      category,
      tags: tags || [],
      createdBy: req.user._id,
      metadata: {
        progress,
        link,
        image
      }
    });

    await news.populate('createdBy', 'username email profilePicture');

    // Clear Nirvana feed cache to reflect changes
    await clearCache('nirvana/feed');

    res.status(201).json(
      new ApiResponse(
        201,
        'News created successfully',
        news
      )
    );
  }
);

/**
 * @desc    Create a new tool
 * @route   POST /api/nirvana/tools
 * @access  Private
 */
export const createTool = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      content,
      toolName,
      category,
      tags,
      rating,
      views,
      link,
      image
    } = req.body;

    const tool = await NirvanaTool.create({
      title,
      content,
      toolName,
      category,
      tags: tags || [],
      rating: rating || 0,
      views: views || 0,
      createdBy: req.user._id,
      metadata: {
        link,
        image
      }
    });

    await tool.populate('createdBy', 'username email profilePicture');

    // Clear Nirvana feed cache to reflect changes
    await clearCache('nirvana/feed');

    res.status(201).json(
      new ApiResponse(
        201,
        'Tool created successfully',
        tool
      )
    );
  }
);

/**
 * @desc    Update reaction (like, share, bookmark)
 * @route   PATCH /api/nirvana/:type/:id/reaction
 * @access  Private
 */
export const updateReaction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, id } = req.params;
    const { reactionType, action } = req.body; // action: 'increment' or 'decrement'

    let Model: any;
    switch (type) {
      case 'hackathon':
        Model = NirvanaHackathon;
        break;
      case 'news':
        Model = NirvanaNews;
        break;
      case 'tool':
        Model = NirvanaTool;
        break;
      default:
        return next(new AppError('Invalid type', 400));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('Item not found', 404));
    }

    const updateField = `reactions.${reactionType}`;
    const currentValue = item.reactions[reactionType] || 0;
    const newValue = action === 'increment' ? currentValue + 1 : Math.max(0, currentValue - 1);

    await Model.findByIdAndUpdate(id, {
      [updateField]: newValue
    });

    res.status(200).json(
      new ApiResponse(
        200,
        'Reaction updated successfully',
        { [reactionType]: newValue }
      )
    );
  }
);

/**
 * @desc    Toggle pin status
 * @route   PATCH /api/nirvana/:type/:id/pin
 * @access  Private (Admin/Moderator)
 */
export const togglePin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, id } = req.params;

    let Model: any;
    switch (type) {
      case 'hackathon':
        Model = NirvanaHackathon;
        break;
      case 'news':
        Model = NirvanaNews;
        break;
      case 'tool':
        Model = NirvanaTool;
        break;
      default:
        return next(new AppError('Invalid type', 400));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('Item not found', 404));
    }

    item.isPinned = !item.isPinned;
    await item.save();

    res.status(200).json(
      new ApiResponse(
        200,
        `Item ${item.isPinned ? 'pinned' : 'unpinned'} successfully`,
        { isPinned: item.isPinned }
      )
    );
  }
);

/**
 * @desc    Toggle verification status
 * @route   PATCH /api/nirvana/:type/:id/verify
 * @access  Private (Admin/Moderator)
 */
export const toggleVerification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, id } = req.params;

    let Model: any;
    switch (type) {
      case 'hackathon':
        Model = NirvanaHackathon;
        break;
      case 'news':
        Model = NirvanaNews;
        break;
      case 'tool':
        Model = NirvanaTool;
        break;
      default:
        return next(new AppError('Invalid type', 400));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('Item not found', 404));
    }

    item.isVerified = !item.isVerified;
    await item.save();

    res.status(200).json(
      new ApiResponse(
        200,
        `Item ${item.isVerified ? 'verified' : 'unverified'} successfully`,
        { isVerified: item.isVerified }
      )
    );
  }
);

/**
 * @desc    Update priority
 * @route   PATCH /api/nirvana/:type/:id/priority
 * @access  Private (Admin/Moderator)
 */
export const updatePriority = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, id } = req.params;
    const { priority } = req.body;

    if (!['high', 'medium', 'low'].includes(priority)) {
      return next(new AppError('Invalid priority level', 400));
    }

    let Model: any;
    switch (type) {
      case 'hackathon':
        Model = NirvanaHackathon;
        break;
      case 'news':
        Model = NirvanaNews;
        break;
      case 'tool':
        Model = NirvanaTool;
        break;
      default:
        return next(new AppError('Invalid type', 400));
    }

    const item = await Model.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );

    if (!item) {
      return next(new AppError('Item not found', 404));
    }

    res.status(200).json(
      new ApiResponse(
        200,
        'Priority updated successfully',
        { priority: item.priority }
      )
    );
  }
);

/**
 * @desc    Update item
 * @route   PUT /api/nirvana/:type/:id
 * @access  Private (Admin/Moderator or Owner)
 */
export const updateItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, id } = req.params;
    const updateData = req.body;

    let Model: any;
    switch (type) {
      case 'hackathon':
        Model = NirvanaHackathon;
        break;
      case 'news':
        Model = NirvanaNews;
        break;
      case 'tool':
        Model = NirvanaTool;
        break;
      default:
        return next(new AppError('Invalid type', 400));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('Item not found', 404));
    }

    // Check if user is owner or admin/moderator
    const isOwner = item.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Not authorized to update this item', 403));
    }

    // Update the item
    const updatedItem = await Model.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email profilePicture');

    // Clear Nirvana feed cache to reflect changes
    await clearCache('nirvana/feed');

    res.status(200).json(
      new ApiResponse(
        200,
        'Item updated successfully',
        updatedItem
      )
    );
  }
);

/**
 * @desc    Delete item
 * @route   DELETE /api/nirvana/:type/:id
 * @access  Private (Admin/Moderator or Owner)
 */
export const deleteItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, id } = req.params;

    let Model: any;
    switch (type) {
      case 'hackathon':
        Model = NirvanaHackathon;
        break;
      case 'news':
        Model = NirvanaNews;
        break;
      case 'tool':
        Model = NirvanaTool;
        break;
      default:
        return next(new AppError('Invalid type', 400));
    }

    const item = await Model.findById(id);
    if (!item) {
      return next(new AppError('Item not found', 404));
    }

    // Check if user is owner or admin/moderator
    const isOwner = item.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Not authorized to delete this item', 403));
    }

    await Model.findByIdAndDelete(id);

    // Clear Nirvana feed cache to reflect changes
    await clearCache('nirvana/feed');

    res.status(200).json(
      new ApiResponse(
        200,
        'Item deleted successfully',
        null
      )
    );
  }
);
