import mongoose, { Schema, Document } from 'mongoose';

export interface ICrucibleNote extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  content: string;
  tags: string[];
  status: 'active' | 'archived';
  visibility: 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleNoteSchema: Schema = new Schema(
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
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
  },
  { timestamps: true }
);

// Create a compound index for efficient lookups
CrucibleNoteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model<ICrucibleNote>('CrucibleNote', CrucibleNoteSchema); 