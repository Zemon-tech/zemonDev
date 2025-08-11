import mongoose, { Schema, Document } from 'mongoose';

export interface IForgeProgress extends Document {
  userId: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  timeSpent: number; // seconds
  lastActive: Date;
  updatedAt: Date;
}

const ForgeProgressSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForgeResource',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
      default: 'not-started',
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique per user per resource
ForgeProgressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export default mongoose.model<IForgeProgress>('ForgeProgress', ForgeProgressSchema);


