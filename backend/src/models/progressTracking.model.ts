import mongoose, { Schema, Document } from 'mongoose';

interface IMilestone {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IProgressTracking extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  timeSpent: number;
  milestones: IMilestone[];
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressTrackingSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
      default: 'not-started',
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    milestones: [
      {
        id: String,
        description: String,
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a compound index for efficient lookups
ProgressTrackingSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model<IProgressTracking>('ProgressTracking', ProgressTrackingSchema); 