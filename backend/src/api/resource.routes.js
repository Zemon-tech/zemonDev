import { Router } from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  searchResources,
  reviewResource,
  getUserResources,
  toggleBookmark,
} from '../controllers/resource.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../utils/validation.js';
import { resourceSchema, resourceReviewSchema, paginationSchema, searchSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.get('/', validateQuery(paginationSchema), getResources);
router.get('/search', validateQuery(searchSchema), searchResources);
router.get('/:id', getResourceById);

// Protected routes
router.post('/', requireAuth, validateBody(resourceSchema), createResource);
router.patch('/:id', requireAuth, validateBody(resourceSchema), updateResource);
router.delete('/:id', requireAuth, deleteResource);
router.post('/:id/review', requireAuth, validateBody(resourceReviewSchema), reviewResource);
router.post('/:id/bookmark', requireAuth, toggleBookmark);
router.get('/user/me', requireAuth, validateQuery(paginationSchema), getUserResources);

export default router; 