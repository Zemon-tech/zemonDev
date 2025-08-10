import mongoose from 'mongoose';
import { ChangeStream, ChangeStreamDocument } from 'mongodb';
import { emitToUser } from './socket.service';
import logger from '../utils/logger';
import NotificationModel from '../models/notification.model';

interface ChangeStreamConfig {
  enabled: boolean;
  resumeTokenCollection: string;
  resumeTokenDocumentId: string;
}

interface ResumeTokenDocument {
  _id: string;
  token: any; // Change Streams resume token can be an object (e.g., {_data: ...})
  lastProcessedAt: Date;
  updatedAt: Date;
}

class ChangeStreamsService {
  private changeStream: ChangeStream | null = null;
  private isWatching = false;
  private config: ChangeStreamConfig;
  private resumeTokenModel: mongoose.Model<any>;

  constructor() {
    this.config = {
      enabled: process.env.ENABLE_CHANGE_STREAMS === 'true',
      resumeTokenCollection: 'changeStreamResumeTokens',
      resumeTokenDocumentId: 'notifications'
    };

    // Create a model for storing resume tokens
    this.resumeTokenModel = mongoose.model(
      this.config.resumeTokenCollection,
      new mongoose.Schema({
        _id: String,
        token: mongoose.Schema.Types.Mixed, // allow storing the raw resume token object
        lastProcessedAt: Date,
        updatedAt: { type: Date, default: Date.now }
      })
    );
  }

  /**
   * Initialize the Change Streams watcher
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      logger.info('Change Streams disabled via environment variable');
      return;
    }

    try {
      // Check if MongoDB is running as a replica set (required for Change Streams)
      if (!mongoose.connection.db) {
        logger.warn('MongoDB connection not established. Skipping Change Streams initialization.');
        return;
      }
      
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      if (!serverStatus.repl) {
        logger.warn('MongoDB is not running as a replica set. Change Streams require replica set configuration.');
        return;
      }

      await this.startWatching();
      logger.info('Change Streams service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Change Streams service:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Start watching for changes in the notifications collection
   */
  private async startWatching(): Promise<void> {
    if (this.isWatching) {
      logger.warn('Change Streams watcher is already running');
      return;
    }

    try {
      // Get the resume token if it exists
      const resumeToken = await this.getResumeToken();
      
      // Create the change stream
      const pipeline = [
        {
          $match: {
            operationType: 'insert',
            'fullDocument.type': { $exists: true }
          }
        }
      ];

      const options: any = {};
      if (resumeToken) {
        options.resumeAfter = resumeToken;
        logger.info('Resuming Change Streams from saved token');
      }

      this.changeStream = NotificationModel.watch(pipeline, options);
      this.isWatching = true;

      // Handle change stream events
      this.changeStream.on('change', this.handleChange.bind(this));
      this.changeStream.on('error', this.handleError.bind(this));
      this.changeStream.on('close', this.handleClose.bind(this));

      logger.info('Change Streams watcher started successfully');
    } catch (error) {
      logger.error('Failed to start Change Streams watcher:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      this.isWatching = false;
    }
  }

  /**
   * Handle changes from the change stream
   */
  private async handleChange(change: ChangeStreamDocument): Promise<void> {
    try {
      if (change.operationType === 'insert' && change.fullDocument) {
        const notification = change.fullDocument;
        
        // Emit the notification to the user via Socket.IO
        await this.emitNotificationToUser(notification);
        
        // Update the resume token
        await this.updateResumeToken(change._id);
        
        logger.info('Processed notification change:', {
          notificationId: notification._id,
          userId: notification.userId,
          type: notification.type
        });
      }
    } catch (error) {
      logger.error('Error handling change stream event:', {
        error: error instanceof Error ? error.message : String(error),
        change: change,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  /**
   * Emit notification to user via Socket.IO
   */
  private async emitNotificationToUser(notification: any): Promise<void> {
    try {
      const userId = notification.userId.toString();
      
      // Emit the same event structure as the existing notification service
      emitToUser(userId, 'notification_received', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        createdAt: notification.createdAt,
      });

      logger.debug('Emitted notification to user via Socket.IO:', {
        userId,
        notificationId: notification._id
      });
    } catch (error) {
      logger.error('Failed to emit notification to user:', {
        error: error instanceof Error ? error.message : String(error),
        notification: notification._id,
        userId: notification.userId
      });
      // Don't throw - continue processing other changes
    }
  }

  /**
   * Handle change stream errors
   */
  private async handleError(error: Error): Promise<void> {
    logger.error('Change Streams error:', {
      error: error.message,
      stack: error.stack
    });

    // Attempt to restart the watcher after a delay
    setTimeout(async () => {
      await this.restart();
    }, 5000);
  }

  /**
   * Handle change stream close
   */
  private async handleClose(): Promise<void> {
    logger.warn('Change Streams connection closed');
    this.isWatching = false;
    
    // Attempt to restart the watcher
    setTimeout(async () => {
      await this.restart();
    }, 1000);
  }

  /**
   * Restart the change stream watcher
   */
  private async restart(): Promise<void> {
    if (this.changeStream) {
      try {
        await this.changeStream.close();
      } catch (error) {
        logger.error('Error closing change stream:', error);
      }
      this.changeStream = null;
    }

    this.isWatching = false;
    await this.startWatching();
  }

  /**
   * Get the stored resume token
   */
  private async getResumeToken(): Promise<any | null> {
    try {
      const doc = await this.resumeTokenModel.findById(this.config.resumeTokenDocumentId);
      return doc?.token || null;
    } catch (error) {
      logger.warn('Failed to retrieve resume token:', error);
      return null;
    }
  }

  /**
   * Update the stored resume token
   */
  private async updateResumeToken(token: any): Promise<void> {
    try {
      await this.resumeTokenModel.findByIdAndUpdate(
        this.config.resumeTokenDocumentId,
        {
          token: token,
          lastProcessedAt: new Date(),
          updatedAt: new Date()
        },
        { upsert: true }
      );
    } catch (error) {
      logger.error('Failed to update resume token:', error);
    }
  }

  /**
   * Stop the change stream watcher
   */
  async stop(): Promise<void> {
    if (this.changeStream) {
      try {
        await this.changeStream.close();
        this.changeStream = null;
        this.isWatching = false;
        logger.info('Change Streams watcher stopped');
      } catch (error) {
        logger.error('Error stopping change stream:', error);
      }
    }
  }

  /**
   * Get the current status of the service
   */
  getStatus(): { enabled: boolean; isWatching: boolean } {
    return {
      enabled: this.config.enabled,
      isWatching: this.isWatching
    };
  }
}

// Export a singleton instance
export const changeStreamsService = new ChangeStreamsService();
export default changeStreamsService;
