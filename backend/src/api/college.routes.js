import { Router } from 'express';
import {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  searchColleges,
  verifyCollege,
} from '../controllers/college.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../utils/validation.js';
import { collegeSchema, paginationSchema, searchSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.get('/', validateQuery(paginationSchema), getColleges);
router.get('/search', validateQuery(searchSchema), searchColleges);
router.get('/:id', getCollegeById);

// Admin routes
router.post('/', requireAuth, requireAdmin, validateBody(collegeSchema), createCollege);
router.patch('/:id', requireAuth, requireAdmin, validateBody(collegeSchema), updateCollege);
router.delete('/:id', requireAuth, requireAdmin, deleteCollege);
router.post('/:id/verify', requireAuth, requireAdmin, verifyCollege);

export default router; 