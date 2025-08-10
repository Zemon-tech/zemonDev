import { Router } from 'express';
import { getHealth, getChangeStreamsStatus } from '../controllers/health.controller';

const router = Router();

// Basic health check
router.get('/', getHealth);

// Change Streams service status
router.get('/change-streams', getChangeStreamsStatus);

export default router;
