import { Router } from 'express';
import {
  getSolutions,
  getSolutionById,
  submitSolution,
  updateSolution,
  deleteSolution,
  reviewSolution,
  getUserSolutions,
} from '../controllers/solution.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../utils/validation.js';
import { solutionSchema, reviewSchema, paginationSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.get('/problem/:problemId', validateQuery(paginationSchema), getSolutions);
router.get('/:id', getSolutionById);

// Protected routes
router.post('/problem/:problemId', requireAuth, validateBody(solutionSchema), submitSolution);
router.patch('/:id', requireAuth, validateBody(solutionSchema), updateSolution);
router.delete('/:id', requireAuth, deleteSolution);
router.post('/:id/review', requireAuth, validateBody(reviewSchema), reviewSolution);
router.get('/user/me', requireAuth, validateQuery(paginationSchema), getUserSolutions);

export default router; 