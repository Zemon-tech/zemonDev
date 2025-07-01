import { ForgeResource } from '../models/index.js';
import logger from '../utils/logger.js';

// Get all resources (paginated)
export const getResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, difficulty, tags } = req.validatedQuery;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $all: Array.isArray(tags) ? tags : [tags] };

    const [resources, total] = await Promise.all([
      ForgeResource.find(query)
        .select('-__v')
        .populate('createdBy', 'fullName')
        .sort('-metrics.views')
        .skip(skip)
        .limit(limit),
      ForgeResource.countDocuments(query),
    ]);

    res.json({
      resources,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Error fetching resources' });
  }
};

// Get resource by ID
export const getResourceById = async (req, res) => {
  try {
    const resource = await ForgeResource.findById(req.params.id)
      .select('-__v')
      .populate('createdBy', 'fullName');

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Increment view count
    await resource.incrementViews();
    res.json(resource);
  } catch (error) {
    logger.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Error fetching resource' });
  }
};

// Create new resource
export const createResource = async (req, res) => {
  try {
    const resource = new ForgeResource({
      ...req.validatedBody,
      createdBy: req.auth.userId,
    });

    await resource.save();
    logger.info(`Created new resource: ${resource.title}`);
    res.status(201).json(resource);
  } catch (error) {
    logger.error('Error creating resource:', error);
    res.status(500).json({ error: 'Error creating resource' });
  }
};

// Update resource
export const updateResource = async (req, res) => {
  try {
    const resource = await ForgeResource.findOne({
      _id: req.params.id,
      createdBy: req.auth.userId,
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Update allowed fields
    const {
      title,
      type,
      url,
      description,
      content,
      tags,
      difficulty,
    } = req.validatedBody;

    if (title) resource.title = title;
    if (type) resource.type = type;
    if (url) resource.url = url;
    if (description) resource.description = description;
    if (content) resource.content = content;
    if (tags) resource.tags = tags;
    if (difficulty) resource.difficulty = difficulty;

    await resource.save();
    logger.info(`Updated resource: ${resource.title}`);
    res.json(resource);
  } catch (error) {
    logger.error('Error updating resource:', error);
    res.status(500).json({ error: 'Error updating resource' });
  }
};

// Delete resource
export const deleteResource = async (req, res) => {
  try {
    const resource = await ForgeResource.findOne({
      _id: req.params.id,
      createdBy: req.auth.userId,
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await resource.deleteOne();
    logger.info(`Deleted resource: ${resource.title}`);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    logger.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Error deleting resource' });
  }
};

// Search resources
export const searchResources = async (req, res) => {
  try {
    const { query, type, tags } = req.validatedQuery;
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    if (type) searchQuery.type = type;
    if (tags) searchQuery.tags = { $all: Array.isArray(tags) ? tags : [tags] };

    const resources = await ForgeResource.find(searchQuery)
      .select('title type description tags difficulty metrics')
      .sort('-metrics.views')
      .limit(10);

    res.json(resources);
  } catch (error) {
    logger.error('Error searching resources:', error);
    res.status(500).json({ error: 'Error searching resources' });
  }
};

// Submit review for a resource
export const reviewResource = async (req, res) => {
  try {
    const resource = await ForgeResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (resource.createdBy.toString() === req.auth.userId) {
      return res.status(400).json({
        error: 'Cannot review own resource',
      });
    }

    const { rating, comment } = req.validatedBody;
    await resource.addReview(req.auth.userId, rating, comment);

    logger.info(`New review added for resource: ${resource.title}`);
    res.json({ message: 'Review submitted successfully' });
  } catch (error) {
    if (error.message === 'Already reviewed') {
      return res.status(400).json({
        error: 'Cannot submit multiple reviews',
      });
    }
    logger.error('Error submitting review:', error);
    res.status(500).json({ error: 'Error submitting review' });
  }
};

// Get user's resources
export const getUserResources = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      ForgeResource.find({ createdBy: req.auth.userId })
        .select('-__v')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      ForgeResource.countDocuments({ createdBy: req.auth.userId }),
    ]);

    res.json({
      resources,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching user resources:', error);
    res.status(500).json({ error: 'Error fetching user resources' });
  }
};

// Bookmark/Unbookmark resource
export const toggleBookmark = async (req, res) => {
  try {
    const resource = await ForgeResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const isBookmarked = await resource.toggleBookmark(req.auth.userId);
    res.json({
      message: isBookmarked ? 'Resource bookmarked' : 'Resource unbookmarked',
    });
  } catch (error) {
    logger.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Error toggling bookmark' });
  }
}; 