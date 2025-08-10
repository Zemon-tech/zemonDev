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
import nirvanaRoutes from './nirvana.routes';
import adminRoutes from './admin.routes';
import profileRoutes from './profile.routes';
import notificationRoutes from './notification.routes';
import healthRoutes from './health.routes';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// API Routes
router.use('/users', userRoutes);
router.use('/crucible', crucibleRoutes);
router.use('/forge', forgeRoutes);
router.use('/ai', aiRoutes);
router.use('/profile', profileRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Arena routes
router.use('/arena/channels', arenaChannelsRoutes);
router.use('/arena/showcase', arenaShowcaseRoutes);
router.use('/arena/hackathons', arenaHackathonsRoutes);
router.use('/arena/users', arenaUsersRoutes);

// Nirvana routes
router.use('/nirvana', nirvanaRoutes);

// Notification routes
router.use('/notifications', notificationRoutes);

// Register webhook routes
router.use('/webhooks', webhookRoutes);



export default router; 