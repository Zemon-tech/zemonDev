import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { User } from '../models';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
}

export const clerkWebhookHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the headers and body
    const headers = req.headers;
    const payload = JSON.stringify(req.body);

    // Get the Svix headers for verification
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
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
    } catch (err: any) {
      console.error('Error verifying webhook:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Handle the user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const newUser = new User({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        fullName: `${first_name || ''} ${last_name || ''}`.trim(),
        avatar: image_url,
      });

      await newUser.save();

      console.log(`User ${newUser.fullName} with email ${newUser.email} has been created.`);
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  }
);