import { CrucibleSolution, CrucibleProblem } from '../models/index.js';
import logger from '../utils/logger.js';

// Get solutions for a problem (paginated)
export const getSolutions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const [solutions, total] = await Promise.all([
      CrucibleSolution.find({ problemId: req.params.problemId })
        .select('-__v')
        .populate('userId', 'fullName')
        .sort('-metrics.upvotes')
        .skip(skip)
        .limit(limit),
      CrucibleSolution.countDocuments({ problemId: req.params.problemId }),
    ]);

    res.json({
      solutions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching solutions:', error);
    res.status(500).json({ error: 'Error fetching solutions' });
  }
};

// Get solution by ID
export const getSolutionById = async (req, res) => {
  try {
    const solution = await CrucibleSolution.findById(req.params.id)
      .select('-__v')
      .populate('userId', 'fullName')
      .populate('problemId', 'title difficulty');

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    res.json(solution);
  } catch (error) {
    logger.error('Error fetching solution:', error);
    res.status(500).json({ error: 'Error fetching solution' });
  }
};

// Submit new solution
export const submitSolution = async (req, res) => {
  try {
    const problem = await CrucibleProblem.findById(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const solution = new CrucibleSolution({
      ...req.validatedBody,
      userId: req.auth.userId,
      problemId: problem._id,
    });

    await solution.save();
    await problem.incrementAttempts();

    // Trigger AI analysis in background
    solution.triggerAIAnalysis().catch(error => {
      logger.error('Error triggering AI analysis:', error);
    });

    logger.info(`New solution submitted for problem: ${problem.title}`);
    res.status(201).json(solution);
  } catch (error) {
    logger.error('Error submitting solution:', error);
    res.status(500).json({ error: 'Error submitting solution' });
  }
};

// Update solution
export const updateSolution = async (req, res) => {
  try {
    const solution = await CrucibleSolution.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    if (solution.status !== 'draft') {
      return res.status(400).json({
        error: 'Cannot update solution',
        details: 'Only draft solutions can be updated',
      });
    }

    const { content } = req.validatedBody;
    solution.content = content;

    await solution.save();
    logger.info(`Updated solution: ${solution._id}`);
    res.json(solution);
  } catch (error) {
    logger.error('Error updating solution:', error);
    res.status(500).json({ error: 'Error updating solution' });
  }
};

// Delete solution
export const deleteSolution = async (req, res) => {
  try {
    const solution = await CrucibleSolution.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });

    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    await solution.deleteOne();
    logger.info(`Deleted solution: ${solution._id}`);
    res.json({ message: 'Solution deleted successfully' });
  } catch (error) {
    logger.error('Error deleting solution:', error);
    res.status(500).json({ error: 'Error deleting solution' });
  }
};

// Submit review for a solution
export const reviewSolution = async (req, res) => {
  try {
    const solution = await CrucibleSolution.findById(req.params.id);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    if (solution.userId.toString() === req.auth.userId) {
      return res.status(400).json({
        error: 'Cannot review own solution',
      });
    }

    const { rating, comment } = req.validatedBody;
    await solution.addReview(req.auth.userId, rating, comment);

    logger.info(`New review added for solution: ${solution._id}`);
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

// Get user's solutions
export const getUserSolutions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.validatedQuery;
    const skip = (page - 1) * limit;

    const [solutions, total] = await Promise.all([
      CrucibleSolution.find({ userId: req.auth.userId })
        .select('-__v')
        .populate('problemId', 'title difficulty')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      CrucibleSolution.countDocuments({ userId: req.auth.userId }),
    ]);

    res.json({
      solutions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching user solutions:', error);
    res.status(500).json({ error: 'Error fetching user solutions' });
  }
}; 