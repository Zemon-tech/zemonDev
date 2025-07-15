import mongoose, { Schema, Document } from 'mongoose';

interface IWinner {
  userId: mongoose.Types.ObjectId;
  username: string;
  position: number;
  score: number;
}

interface ILeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number;
  submissionTime: Date;
}

export interface IWeeklyHackathon extends Document {
  title: string;
  description: string;
  problem: string;
  constraints: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  winners: IWinner[];
  leaderboard: ILeaderboardEntry[];
}

const WinnerSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
    min: 1,
  },
  score: {
    type: Number,
    required: true,
  },
});

const LeaderboardEntrySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  submissionTime: {
    type: Date,
    default: Date.now,
  },
});

const WeeklyHackathonSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    winners: [WinnerSchema],
    leaderboard: [LeaderboardEntrySchema],
  },
  { timestamps: true }
);

// Add indexes for better query performance
WeeklyHackathonSchema.index({ startDate: -1 }); // For sorting by start date
WeeklyHackathonSchema.index({ endDate: 1 }); // For querying active hackathons
WeeklyHackathonSchema.index({ isActive: 1 }); // For filtering active hackathons

export default mongoose.model<IWeeklyHackathon>('WeeklyHackathon', WeeklyHackathonSchema); 