/**
 * Arena Channel Interface
 */
export interface ArenaChannel {
  _id?: string;
  name: string;
  type: 'text' | 'announcement' | 'readonly';
  group: 'getting-started' | 'community' | 'hackathons';
  description?: string;
  isActive: boolean;
  createdBy: string; // ObjectId as string
  moderators: string[]; // ObjectId array
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Arena Message Interface
 */
export interface ArenaMessage {
  _id?: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  type: 'text' | 'system';
  replyToId?: string;
  mentions: string[];
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

/**
 * Project Showcase Interface
 */
export interface ProjectShowcase {
  _id?: string;
  title: string;
  description?: string;
  images: string[]; // Max 3 URLs
  gitRepositoryUrl: string;
  demoUrl: string;
  userId: string;
  username: string;
  upvotes: number;
  upvotedBy: string[];
  submittedAt: Date;
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: string;
}

/**
 * Weekly Hackathon Interface
 */
export interface WeeklyHackathon {
  _id?: string;
  title: string;
  description: string;
  problem: string;
  constraints: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
  winners: Array<{
    userId: string;
    username: string;
    position: number;
    score: number;
  }>;
  leaderboard: Array<{
    userId: string;
    username: string;
    score: number;
    submissionTime: Date;
  }>;
}

/**
 * Hackathon Submission Interface
 */
export interface HackathonSubmission {
  _id?: string;
  hackathonId: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  repoUrl: string;
  demoUrl?: string;
  submissionDate: Date;
  score?: number;
  feedback?: string;
  isWinner: boolean;
}

/**
 * User Channel Status Interface
 */
export interface UserChannelStatus {
  _id?: string;
  userId: string;
  channelId: string;
  lastRead: Date;
  isMuted: boolean;
  isPinned: boolean;
}

/**
 * User Role Interface
 */
export interface UserRole {
  _id?: string;
  userId: string;
  role: 'user' | 'moderator' | 'admin';
  permissions: string[];
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
} 