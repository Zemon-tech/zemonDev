import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom';
  title: string;
  message: string;
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['hackathon', 'news', 'channel', 'problem', 'resource', 'project_approval', 'custom'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      entityId: {
        type: String,
        trim: true,
      },
      entityType: {
        type: String,
        trim: true,
      },
      action: {
        type: String,
        trim: true,
      },
      metadata: {
        type: Schema.Types.Mixed,
      },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  { 
    timestamps: true
  }
);

// Indexes for better query performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

export default mongoose.model<INotification>('Notification', NotificationSchema);
