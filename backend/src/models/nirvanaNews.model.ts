import mongoose, { Schema, Document } from 'mongoose';

export interface INirvanaNews extends Document {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isVerified: boolean;
  priority: 'high' | 'medium' | 'low';
  createdBy: mongoose.Types.ObjectId;
  reactions: {
    likes: number;
    shares: number;
    bookmarks: number;
  };
  userReactions: {
    likes: mongoose.Types.ObjectId[];
    shares: mongoose.Types.ObjectId[];
    bookmarks: mongoose.Types.ObjectId[];
  };
  metadata: {
    progress?: number;
    link?: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NirvanaNewsSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reactions: {
      likes: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      bookmarks: {
        type: Number,
        default: 0,
      },
    },
    userReactions: {
      likes: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }],
        default: [],
      },
      shares: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }],
        default: [],
      },
      bookmarks: {
        type: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }],
        default: [],
      },
    },
    metadata: {
      progress: {
        type: Number,
        min: 0,
        max: 100,
      },
      link: {
        type: String,
      },
      image: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
NirvanaNewsSchema.index({ priority: 1, createdAt: -1 });
NirvanaNewsSchema.index({ isPinned: 1, createdAt: -1 });
NirvanaNewsSchema.index({ category: 1 });
NirvanaNewsSchema.index({ tags: 1 });
NirvanaNewsSchema.index({ isVerified: 1 });

export default mongoose.model<INirvanaNews>('NirvanaNews', NirvanaNewsSchema);
