import { Router } from 'express';
import { clerkWebhookHandler } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  clerkWebhookHandler
);

export default router;