import { CrucibleProblem } from '../models/index.js';
import logger from '../utils/logger.js';

// Get all problems (paginated)
export const getProblems = async (req, res) => {
  try {
    const { page = 1, limit = 10, difficulty, tags } = req.validatedQuery;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $all: Array.isArray(tags) ? tags : [tags] };

    const [problems, total] = await Promise.all([
      CrucibleProblem.find(query)
        .select('-__v')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      CrucibleProblem.countDocuments(query),
    ]);

    res.json({
      problems,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Error fetching problems' });
  }
};

// Get problem by ID
export const getProblemById = async (req, res) => {
  try {
    const problem = await CrucibleProblem.findById(req.params.id)
      .select('-__v')
      .populate('createdBy', 'fullName');

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    logger.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Error fetching problem' });
  }
};

// Create new problem (admin only)
export const createProblem = async (req, res) => {
  try {
    const problem = new CrucibleProblem({
      ...req.validatedBody,
      createdBy: req.auth.userId,
    });

    await problem.save();
    logger.info(`Created new problem: ${problem.title}`);
    res.status(201).json(problem);
  } catch (error) {
    logger.error('Error creating problem:', error);
    res.status(500).json({ error: 'Error creating problem' });
  }
};

// Update problem (admin only)
export const updateProblem = async (req, res) => {
  try {
    const problem = await CrucibleProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Update allowed fields
    const {
      title,
      description,
      difficulty,
      tags,
      requirements,
      constraints,
      expectedOutcome,
      hints,
    } = req.validatedBody;

    if (title) problem.title = title;
    if (description) problem.description = description;
    if (difficulty) problem.difficulty = difficulty;
    if (tags) problem.tags = tags;
    if (requirements) problem.requirements = requirements;
    if (constraints) problem.constraints = constraints;
    if (expectedOutcome) problem.expectedOutcome = expectedOutcome;
    if (hints) problem.hints = hints;

    await problem.save();
    logger.info(`Updated problem: ${problem.title}`);
    res.json(problem);
  } catch (error) {
    logger.error('Error updating problem:', error);
    res.status(500).json({ error: 'Error updating problem' });
  }
};

// Delete problem (admin only)
export const deleteProblem = async (req, res) => {
  try {
    const problem = await CrucibleProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check if problem has any solutions
    const solutionCount = await problem.getSolutionCount();
    if (solutionCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete problem',
        details: 'Problem has existing solutions',
      });
    }

    await problem.deleteOne();
    logger.info(`Deleted problem: ${problem.title}`);
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    logger.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Error deleting problem' });
  }
};

// Search problems
export const searchProblems = async (req, res) => {
  try {
    const { query, tags } = req.validatedQuery;
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    if (tags) {
      searchQuery.tags = { $all: Array.isArray(tags) ? tags : [tags] };
    }

    const problems = await CrucibleProblem.find(searchQuery)
      .select('title difficulty tags metrics')
      .sort('-metrics.attempts')
      .limit(10);

    res.json(problems);
  } catch (error) {
    logger.error('Error searching problems:', error);
    res.status(500).json({ error: 'Error searching problems' });
  }
};

// Get problem statistics
export const getProblemStats = async (req, res) => {
  try {
    const problem = await CrucibleProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const stats = await problem.getStatistics();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching problem stats:', error);
    res.status(500).json({ error: 'Error fetching problem statistics' });
  }
}; 