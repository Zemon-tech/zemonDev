import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { User } from '../models';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import logger from '../utils/logger';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
}

export const clerkWebhookHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Received a request to /api/webhooks');
    
    // Get the headers and body
    const headers = req.headers;
    const payload = JSON.stringify(req.body);
    
    logger.info('Request body:', req.body);
    logger.info('Request headers:', headers);

    // Get the Svix headers for verification
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;
    
    logger.info(`Svix Headers: svix-id: ${svix_id}, svix-timestamp: ${svix_timestamp}, svix-signature: ${svix_signature ? 'present' : 'missing'}`);

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error('Missing Svix headers');
      return next(new AppError('Error occured -- no svix headers', 400));
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);
    logger.info('Webhook secret configured:', WEBHOOK_SECRET ? 'present' : 'missing');

    let evt: any;

    // Attempt to verify the incoming webhook
    try {
      logger.info('Attempting to verify webhook signature...');
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
      logger.info(`Webhook successfully verified. Event type: ${evt.type}`);
      logger.info('Event data:', evt.data);
    } catch (err: any) {
      logger.error(`Error verifying webhook: ${err.message}`);
      logger.error('Webhook verification failed. Payload:', payload);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Handle the user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, username } = evt.data;
      logger.info(`Processing user.created event for Clerk ID: ${id}`);
      logger.info('User data from Clerk:', { id, email_addresses, first_name, last_name, username });
      
      try {
        const email = email_addresses[0]?.email_address;
        let finalFullName = `${first_name || ''} ${last_name || ''}`.trim();

        if (!finalFullName && email) {
          finalFullName = email.split('@')[0];
        }

        // Generate a username if Clerk doesn't provide one
        let finalUsername = username;
        if (!finalUsername) {
          if (email) {
            finalUsername = email.split('@')[0];
          } else {
            finalUsername = `user_${id.slice(-8)}`;
          }
        }

        logger.info('Final user data for database:', {
          clerkId: id,
          email: email,
          fullName: finalFullName,
          username: finalUsername
        });

        const newUser = new User({
          clerkId: id,
          email: email,
          fullName: finalFullName,
          username: finalUsername,
        });

        logger.info('Attempting to save user to database...');
        await newUser.save();
        logger.info(`User with Clerk ID ${id} has been successfully created in the database with ID: ${newUser._id}`);

      } catch (error: any) {
        logger.error(`Failed to create user in database for Clerk ID ${id}. Error: ${error.message}`);
        logger.error('Full error details:', error);
        // Still return a 200 to Clerk, otherwise it will keep retrying.
        // The error is logged for internal review.
      }
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  }
);