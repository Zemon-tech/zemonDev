import mongoose, { Schema, Document } from 'mongoose';

export interface INirvanaHackathon extends Document {
  title: string;
  content: string;
  description: string;
  prize: string;
  participants: number;
  category: string;
  tags: string[];
  deadline: Date;
  status: 'active' | 'upcoming' | 'completed';
  isPinned: boolean;
  isVerified: boolean;
  priority: 'high' | 'medium' | 'low';
  createdBy: mongoose.Types.ObjectId;
  reactions: {
    likes: number;
    shares: number;
    bookmarks: number;
  };
  metadata: {
    hackathonName: string;
    link?: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NirvanaHackathonSchema: Schema = new Schema(
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
    description: {
      type: String,
      required: true,
    },
    prize: {
      type: String,
      required: true,
    },
    participants: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'upcoming', 'completed'],
      default: 'upcoming',
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
    metadata: {
      hackathonName: {
        type: String,
        required: true,
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
NirvanaHackathonSchema.index({ status: 1, priority: 1 });
NirvanaHackathonSchema.index({ isPinned: 1, createdAt: -1 });
NirvanaHackathonSchema.index({ deadline: 1 });
NirvanaHackathonSchema.index({ category: 1 });
NirvanaHackathonSchema.index({ tags: 1 });

export default mongoose.model<INirvanaHackathon>('NirvanaHackathon', NirvanaHackathonSchema);
