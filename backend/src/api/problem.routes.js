import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  searchProblems,
  getProblemStats,
} from '../controllers/problem.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../utils/validation.js';
import { problemSchema, paginationSchema, searchSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.get('/', validateQuery(paginationSchema), getProblems);
router.get('/search', validateQuery(searchSchema), searchProblems);
router.get('/:id', getProblemById);
router.get('/:id/stats', getProblemStats);

// Admin routes
router.post('/', requireAuth, requireAdmin, validateBody(problemSchema), createProblem);
router.patch('/:id', requireAuth, requireAdmin, validateBody(problemSchema), updateProblem);
router.delete('/:id', requireAuth, requireAdmin, deleteProblem);

export default router; 