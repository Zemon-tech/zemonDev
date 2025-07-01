import { Router } from 'express';
import userRoutes from './user.routes.js';
import collegeRoutes from './college.routes.js';
import problemRoutes from './problem.routes.js';
import solutionRoutes from './solution.routes.js';
import resourceRoutes from './resource.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/colleges', collegeRoutes);
router.use('/problems', problemRoutes);
router.use('/solutions', solutionRoutes);
router.use('/resources', resourceRoutes);

export default router; 