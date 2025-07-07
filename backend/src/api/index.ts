import { Router } from 'express';
import userRoutes from './user.routes';
import crucibleRoutes from './crucible.routes';
import forgeRoutes from './forge.routes';
import aiRoutes from './ai.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
router.use('/users', userRoutes);
router.use('/crucible', crucibleRoutes);
router.use('/forge', forgeRoutes);
router.use('/ai', aiRoutes);

// Register webhook routes
router.use('/webhooks', webhookRoutes);

export default router; 