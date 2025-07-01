import { CrucibleProblem, CrucibleSolution } from '../models/index.js';
import aiService from '../services/ai.service.js';
import logger from '../utils/logger.js';

// Analyze a solution
export const analyzeSolution = async (req, res) => {
  try {
    const { solutionId } = req.params;
    
    // Find the solution
    const solution = await CrucibleSolution.findById(solutionId)
      .populate('problemId');
    
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    
    // Check if user owns the solution or is admin
    if (solution.userId.toString() !== req.auth.userId && !req.auth.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to analyze this solution' });
    }
    
    // Get the problem
    const problem = solution.problemId;
    
    // Analyze the solution
    const analysis = await aiService.analyzeSolution(solution.content, problem);
    
    // Update the solution with AI analysis
    await solution.updateAIAnalysis(analysis);
    
    res.json(analysis);
  } catch (error) {
    logger.error('Error analyzing solution:', error);
    res.status(500).json({ error: 'Error analyzing solution' });
  }
};

// Generate hints for a problem
export const generateHints = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Find the problem
    const problem = await CrucibleProblem.findById(problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Check if user is admin (only admins can generate hints)
    if (!req.auth.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to generate hints' });
    }
    
    // Generate hints
    const hints = await aiService.generateHints(problem);
    
    // Update the problem with the generated hints
    problem.hints = hints;
    await problem.save();
    
    res.json({ hints });
  } catch (error) {
    logger.error('Error generating hints:', error);
    res.status(500).json({ error: 'Error generating hints' });
  }
};

export default {
  analyzeSolution,
  generateHints
}; 