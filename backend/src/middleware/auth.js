import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import logger from '../utils/logger.js';

// Middleware to require authentication
export const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res) => {
    logger.error('Authentication error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  },
});

// Middleware to check if user is an admin
export const requireAdmin = (req, res, next) => {
  const { role } = req.auth.user;
  if (role !== 'admin') {
    logger.warn(`Unauthorized admin access attempt by user: ${req.auth.userId}`);
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

// Middleware to check if user is a moderator or admin
export const requireModeratorOrAdmin = (req, res, next) => {
  const { role } = req.auth.user;
  if (!['moderator', 'admin'].includes(role)) {
    logger.warn(`Unauthorized moderator access attempt by user: ${req.auth.userId}`);
    return res.status(403).json({ error: 'Forbidden: Moderator access required' });
  }
  next();
};

// Middleware to verify Clerk webhook signatures
export const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['svix-signature'];
  const timestamp = req.headers['svix-timestamp'];
  const id = req.headers['svix-id'];

  if (!signature || !timestamp || !id) {
    logger.error('Missing webhook signature headers');
    return res.status(400).json({ error: 'Missing webhook signature headers' });
  }

  try {
    // Clerk webhook verification logic here
    // This will be implemented when we set up the webhook handler
    next();
  } catch (err) {
    logger.error('Invalid webhook signature:', err);
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }
}; 