import { Router } from 'express';
import { getAllUsers } from '../controllers/admin.controller';
import { protect, checkRole } from '../middleware/auth.middleware';

const router = Router();

// All routes in this file are protected and require admin/moderator access
router.use(protect);
router.use(checkRole(['admin', 'moderator']));

// Define routes
router.get('/users', getAllUsers);

export default router;
