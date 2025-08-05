import { Router } from 'express';
import { 
  getAllUsers, 
  getShowcaseProjects, 
  approveShowcaseProject, 
  rejectShowcaseProject 
} from '../controllers/admin.controller';
import { protect, checkRole } from '../middleware/auth.middleware';

const router = Router();

// All routes in this file are protected and require admin/moderator access
router.use(protect);
router.use(checkRole(['admin', 'moderator']));

// Define routes
router.get('/users', getAllUsers);

// Showcase approval routes
router.get('/showcase', getShowcaseProjects);
router.post('/showcase/:projectId/approve', approveShowcaseProject);
router.post('/showcase/:projectId/reject', rejectShowcaseProject);

export default router;
