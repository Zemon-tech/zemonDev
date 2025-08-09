import mongoose, { Schema, Document } from 'mongoose';

export interface INirvanaTool extends Document {
  title: string;
  content: string;
  toolName: string;
  category: string;
  tags: string[];
  rating: number;
  views: number;
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
    link?: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NirvanaToolSchema: Schema = new Schema(
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
    toolName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
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
NirvanaToolSchema.index({ priority: 1, createdAt: -1 });
NirvanaToolSchema.index({ isPinned: 1, createdAt: -1 });
NirvanaToolSchema.index({ category: 1 });
NirvanaToolSchema.index({ tags: 1 });
NirvanaToolSchema.index({ rating: -1 });
NirvanaToolSchema.index({ views: -1 });
NirvanaToolSchema.index({ isVerified: 1 });

export default mongoose.model<INirvanaTool>('NirvanaTool', NirvanaToolSchema);
