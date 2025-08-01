import mongoose, { Schema, Document } from 'mongoose';

export interface IUserChannelStatus extends Document {
  userId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  lastReadMessageId?: mongoose.Types.ObjectId;
  lastReadTimestamp: Date;
  isBanned: boolean;
  banExpiresAt?: Date;
  banReason?: string;
  bannedBy?: mongoose.Types.ObjectId;
  isKicked: boolean;
  kickedAt?: Date;
  kickedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'denied' | 'banned' | 'kicked';
}

const UserChannelStatusSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArenaChannel',
      required: true,
    },
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArenaMessage',
    },
    lastReadTimestamp: {
      type: Date,
      default: Date.now,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banExpiresAt: {
      type: Date,
    },
    banReason: {
      type: String,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isKicked: {
      type: Boolean,
      default: false,
    },
    kickedAt: {
      type: Date,
    },
    kickedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'banned', 'kicked'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
UserChannelStatusSchema.index({ userId: 1, channelId: 1 }, { unique: true }); // One status per user per channel
UserChannelStatusSchema.index({ channelId: 1, isBanned: 1 }); // For checking banned users in a channel
UserChannelStatusSchema.index({ userId: 1, lastReadTimestamp: 1 }); // For unread messages

export default mongoose.model<IUserChannelStatus>('UserChannelStatus', UserChannelStatusSchema); 