import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectShowcase extends Document {
  title: string;
  description?: string;
  images: string[]; // Max 3 URLs
  gitRepositoryUrl: string;
  demoUrl: string;
  userId: mongoose.Types.ObjectId;
  username: string;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  downvotes: number;
  downvotedBy: mongoose.Types.ObjectId[];
  submittedAt: Date;
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
}

const ProjectShowcaseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 3; // Maximum 3 images
        },
        message: 'Maximum 3 images allowed'
      }
    },
    gitRepositoryUrl: {
      type: String,
      required: true,
      trim: true,
    },
    demoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
ProjectShowcaseSchema.index({ upvotes: -1 }); // For sorting by popularity
ProjectShowcaseSchema.index({ downvotes: -1 }); // For sorting by most downvoted
ProjectShowcaseSchema.index({ submittedAt: -1 }); // For sorting by newest
ProjectShowcaseSchema.index({ userId: 1 }); // For fetching user's projects
ProjectShowcaseSchema.index({ isApproved: 1 }); // For filtering approved projects

// Pre-save middleware to ensure vote counts are valid
ProjectShowcaseSchema.pre('save', function(next) {
  // Ensure vote counts are never negative and match the arrays
  const upvotedCount = Array.isArray(this.upvotedBy) ? this.upvotedBy.length : 0;
  const downvotedCount = Array.isArray(this.downvotedBy) ? this.downvotedBy.length : 0;
  
  this.upvotes = Math.max(0, upvotedCount);
  this.downvotes = Math.max(0, downvotedCount);
  
  next();
});

export default mongoose.model<IProjectShowcase>('ProjectShowcase', ProjectShowcaseSchema); 