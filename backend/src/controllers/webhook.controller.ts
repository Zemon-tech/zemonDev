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

    // Get the Svix headers for verification
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;
    
    logger.info(`Svix Headers: svix-id: ${svix_id}, svix-timestamp: ${svix_timestamp}`);

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error('Missing Svix headers');
      return next(new AppError('Error occured -- no svix headers', 400));
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Attempt to verify the incoming webhook
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
      logger.info(`Webhook successfully verified. Event type: ${evt.type}`);
    } catch (err: any) {
      logger.error(`Error verifying webhook: ${err.message}`);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Handle the user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, username } = evt.data;
      logger.info(`Processing user.created event for Clerk ID: ${id}`);
      
      try {
        const email = email_addresses[0]?.email_address;
        let finalFullName = `${first_name || ''} ${last_name || ''}`.trim();

        if (!finalFullName && email) {
          finalFullName = email.split('@')[0];
        }

        const newUser = new User({
          clerkId: id,
          email: email,
          fullName: finalFullName,
          username: username, // Save Clerk username
        });

        await newUser.save();

        logger.info(`User with Clerk ID ${id} has been successfully created in the database.`);

      } catch (error: any) {
        logger.error(`Failed to create user in database for Clerk ID ${id}. Error: ${error.message}`);
        // Still return a 200 to Clerk, otherwise it will keep retrying.
        // The error is logged for internal review.
      }
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  }
);