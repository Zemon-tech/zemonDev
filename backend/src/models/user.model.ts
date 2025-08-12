import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  fullName: string;
  username: string; // Clerk username/handle
  collegeDetails?: {
    name?: string;
    branch?: string;
    year?: number;
  };
  profile?: {
    headline?: string;
    bio?: string;
    aboutMe?: string;
    location?: string;
    skills?: string[];
    toolsAndTech?: string[];
    skillProgress?: Array<{
      skill: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      progress: number; // 0-100
      lastUpdated: Date;
    }>;
  };
  interests: string[];
  achievements?: {
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: 'crucible' | 'forge' | 'arena' | 'streak' | 'special';
      earnedAt: Date;
      metadata?: Record<string, any>;
    }>;
    certificates: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: Date;
      expiryDate?: Date;
      credentialUrl?: string;
      category: 'technical' | 'academic' | 'professional' | 'platform';
    }>;
    milestones: Array<{
      id: string;
      name: string;
      description: string;
      achievedAt: Date;
      category: 'problems' | 'resources' | 'collaboration' | 'streak';
      value: number;
    }>;
  };
  stats: {
    problemsSolved: number;
    resourcesCreated: number;
    reputation: number;
    totalBadges: number;
    totalCertificates: number;
    skillMastery: number; // Average skill progress
  };
  bookmarkedResources: mongoose.Types.ObjectId[];
  completedSolutions: mongoose.Types.ObjectId[];
  activeDrafts: mongoose.Types.ObjectId[];
  archivedDrafts: mongoose.Types.ObjectId[];
  workspacePreferences: {
    editorSettings: {
      fontSize: number;
      theme: string;
      wordWrap: boolean;
    };
    layout: {
      showProblemSidebar: boolean;
      showChatSidebar: boolean;
      sidebarWidths: {
        problem: number;
        chat: number;
      };
    };
    notifications: {
      channelUpdates: boolean;
      projectApprovals: boolean;
      mentions: boolean;
    };
  };
  college?: {
    collegeName?: string;
    course?: string;
    branch?: string;
    year?: number;
    city?: string;
    state?: string;
  };
  socialLinks?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  profileBackground?: {
    type: 'gradient' | 'image';
    value: string;
    name: string;
  };
  // Zemon streak fields
  zemonStreak: number;
  longestZemonStreak: number;
  lastZemonVisit?: Date;
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
    username: {
      type: String,
      required: true,
      unique: true,
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
      aboutMe: {
        type: String,
        trim: true,
        default: '',
      },
      location: {
        type: String,
        trim: true,
        default: '',
      },
      skills: {
        type: [String],
        default: [],
      },
      toolsAndTech: {
        type: [String],
        default: [],
      },
      skillProgress: [{
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'beginner',
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    interests: {
      type: [String],
      default: [],
    },
    achievements: {
      badges: [{
        id: {
          type: String,
          required: true,
          trim: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        icon: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          enum: ['crucible', 'forge', 'arena', 'streak', 'special'],
          default: 'special',
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          type: Schema.Types.Mixed,
          default: {},
        },
      }],
      certificates: [{
        id: {
          type: String,
          required: true,
          trim: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        issuer: {
          type: String,
          required: true,
          trim: true,
        },
        issueDate: {
          type: Date,
          required: true,
        },
        expiryDate: {
          type: Date,
        },
        credentialUrl: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          enum: ['technical', 'academic', 'professional', 'platform'],
          default: 'technical',
        },
      }],
      milestones: [{
        id: {
          type: String,
          required: true,
          trim: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        achievedAt: {
          type: Date,
          default: Date.now,
        },
        category: {
          type: String,
          enum: ['problems', 'resources', 'collaboration', 'streak'],
          default: 'problems',
        },
        value: {
          type: Number,
          default: 0,
        },
      }],
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
      totalBadges: {
        type: Number,
        default: 0,
      },
      totalCertificates: {
        type: Number,
        default: 0,
      },
      skillMastery: {
        type: Number,
        min: 0,
        max: 100,
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
    activeDrafts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionDraft',
      },
    ],
    archivedDrafts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionDraft',
      },
    ],
    workspacePreferences: {
      editorSettings: {
        fontSize: {
          type: Number,
          default: 14,
        },
        theme: {
          type: String,
          default: 'system',
        },
        wordWrap: {
          type: Boolean,
          default: true,
        },
      },
      layout: {
        showProblemSidebar: {
          type: Boolean,
          default: true,
        },
        showChatSidebar: {
          type: Boolean,
          default: true,
        },
        sidebarWidths: {
          problem: {
            type: Number,
            default: 320,
          },
          chat: {
            type: Number,
            default: 320,
          },
        },
      },
      notifications: {
        channelUpdates: {
          type: Boolean,
          default: true,
        },
        projectApprovals: {
          type: Boolean,
          default: true,
        },
        mentions: {
          type: Boolean,
          default: true,
        },
      },
    },
    college: {
      collegeName: {
        type: String,
        trim: true,
        default: '',
      },
      course: {
        type: String,
        trim: true,
        default: '',
      },
      branch: {
        type: String,
        trim: true,
        default: '',
      },
      year: {
        type: Number,
        min: 1,
        max: 5,
      },
      city: {
        type: String,
        trim: true,
        default: '',
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
    },
    socialLinks: {
      portfolio: {
        type: String,
        trim: true,
        default: '',
      },
      github: {
        type: String,
        trim: true,
        default: '',
      },
      linkedin: {
        type: String,
        trim: true,
        default: '',
      },
      twitter: {
        type: String,
        trim: true,
        default: '',
      },
    },
    profileBackground: {
      type: {
        type: String,
        enum: ['gradient', 'image'],
        default: 'gradient',
      },
      value: {
        type: String,
        trim: true,
        default: 'linear-gradient(to right, #0073b1, #f4a261)',
      },
      name: {
        type: String,
        trim: true,
        default: 'LinkedIn Blue',
      },
    },
    // Zemon streak fields
    zemonStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestZemonStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastZemonVisit: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema); 