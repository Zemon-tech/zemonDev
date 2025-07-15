import { Router } from 'express';
import userRoutes from './user.routes';
import crucibleRoutes from './crucible.routes';
import forgeRoutes from './forge.routes';
import aiRoutes from './ai.routes';
import webhookRoutes from './webhook.routes';
import arenaChannelsRoutes from './arena-channels.routes';
import arenaShowcaseRoutes from './arena-showcase.routes';
import arenaHackathonsRoutes from './arena-hackathons.routes';
import arenaUsersRoutes from './arena-users.routes';

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

// Arena routes
router.use('/arena/channels', arenaChannelsRoutes);
router.use('/arena/showcase', arenaShowcaseRoutes);
router.use('/arena/hackathons', arenaHackathonsRoutes);
router.use('/arena/users', arenaUsersRoutes);

// Register webhook routes
router.use('/webhooks', webhookRoutes);

export default router; 