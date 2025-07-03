import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  fullName: string;
  collegeDetails?: {
    name?: string;
    branch?: string;
    year?: number;
  };
  profile?: {
    headline?: string;
    bio?: string;
  };
  interests: string[];
  stats: {
    problemsSolved: number;
    resourcesCreated: number;
    reputation: number;
  };
  bookmarkedResources: mongoose.Types.ObjectId[];
  completedSolutions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    collegeDetails: {
      name: {
        type: String,
        trim: true,
      },
      branch: {
        type: String,
        trim: true,
      },
      year: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    profile: {
      headline: {
        type: String,
        trim: true,
      },
      bio: {
        type: String,
        trim: true,
      },
    },
    interests: {
      type: [String],
      default: [],
    },
    stats: {
      problemsSolved: {
        type: Number,
        default: 0,
      },
      resourcesCreated: {
        type: Number,
        default: 0,
      },
      reputation: {
        type: Number,
        default: 0,
      },
    },
    bookmarkedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForgeResource',
      },
    ],
    completedSolutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrucibleSolution',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema); 