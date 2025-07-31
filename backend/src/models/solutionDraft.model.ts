import mongoose, { Schema, Document } from 'mongoose';

interface IVersion {
  content: string;
  timestamp: Date;
  description: string;
}

export interface ISolutionDraft extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  currentContent: string;
  versions: IVersion[];
  status: 'active' | 'archived';
  lastEdited: Date;
  autoSaveEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionDraftSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
      index: true,
    },
    currentContent: {
      type: String,
      default: '',
    },
    versions: [
      {
        content: {
          type: String,
          required: true,
          default: '',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          default: '',
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
    lastEdited: {
      type: Date,
      default: Date.now,
    },
    autoSaveEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create compound indexes for efficient lookups (non-unique to allow multiple drafts)
SolutionDraftSchema.index({ userId: 1, problemId: 1, status: 1 });
SolutionDraftSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model<ISolutionDraft>('SolutionDraft', SolutionDraftSchema); 