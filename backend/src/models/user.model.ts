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
    // NEW: Comprehensive scoring fields
    totalPoints: number; // Total points earned from all solved problems
    averageScore: number; // Average score across all solved problems
    highestScore: number; // Highest score achieved on any problem
    problemsByDifficulty: {
      easy: { solved: number; averageScore: number; totalPoints: number };
      medium: { solved: number; averageScore: number; totalPoints: number };
      hard: { solved: number; averageScore: number; totalPoints: number };
      expert: { solved: number; averageScore: number; totalPoints: number };
    };
    problemsByCategory: {
      algorithms: { solved: number; averageScore: number; totalPoints: number };
      'system-design': { solved: number; averageScore: number; totalPoints: number };
      'web-development': { solved: number; averageScore: number; totalPoints: number };
      'mobile-development': { solved: number; averageScore: number; totalPoints: number };
      'data-science': { solved: number; averageScore: number; totalPoints: number };
      devops: { solved: number; averageScore: number; totalPoints: number };
      frontend: { solved: number; averageScore: number; totalPoints: number };
      backend: { solved: number; averageScore: number; totalPoints: number };
    };
  };
  // NEW: Skill tracking based on problem solving
  skillTracking: {
    skills: Array<{
      skill: string; // e.g., "JavaScript", "Algorithms", "System Design"
      category: string; // e.g., "programming", "algorithms", "architecture"
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      progress: number; // 0-100
      problemsSolved: number;
      totalPoints: number;
      averageScore: number;
      lastSolvedAt?: Date;
      lastUpdated: Date;
    }>;
    techStack: Array<{
      technology: string; // e.g., "React", "Node.js", "Python"
      category: string; // e.g., "frontend", "backend", "language"
      proficiency: number; // 0-100
      problemsSolved: number;
      totalPoints: number;
      averageScore: number;
      lastUsedAt?: Date;
      lastUpdated: Date;
    }>;
    learningProgress: Array<{
      topic: string; // e.g., "Data Structures", "API Design"
      category: string; // e.g., "algorithms", "web-development"
      mastery: number; // 0-100
      problemsSolved: number;
      totalPoints: number;
      averageScore: number;
      lastStudiedAt?: Date;
      lastUpdated: Date;
    }>;
  };
  // NEW: Problem solving history for detailed tracking
  problemHistory: Array<{
    problemId: mongoose.Types.ObjectId;
    analysisId: mongoose.Types.ObjectId;
    score: number; // 0-100
    points: number; // Calculated points based on score and difficulty
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    category: string;
    tags: string[];
    solvedAt: Date;
    reattempts: number; // Number of times this problem was reattempted
  }>;
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
  // App-managed avatar image URL
  profilePicture?: string;
  profileVisibility?: {
    isPublic: boolean;
    showEmail: boolean;
    showStats: boolean;
    showAchievements: boolean;
    showSkills: boolean;
    showSocialLinks: boolean;
    showCollegeDetails: boolean;
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
      // NEW: Comprehensive scoring fields
      totalPoints: {
        type: Number,
        default: 0,
        min: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      highestScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      problemsByDifficulty: {
        easy: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        medium: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        hard: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        expert: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        }
      },
      problemsByCategory: {
        algorithms: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        'system-design': {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        'web-development': {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        'mobile-development': {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        'data-science': {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        devops: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        frontend: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        },
        backend: {
          solved: { type: Number, default: 0 },
          averageScore: { type: Number, default: 0, min: 0, max: 100 },
          totalPoints: { type: Number, default: 0, min: 0 }
        }
      }
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
    // NEW: Skill tracking based on problem solving
    skillTracking: {
      skills: [{
        skill: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
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
        problemsSolved: {
          type: Number,
          default: 0,
        },
        totalPoints: {
          type: Number,
          default: 0,
        },
        averageScore: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastSolvedAt: {
          type: Date,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      }],
      techStack: [{
        technology: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          required: true,
          trim: true,
        },
        proficiency: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        problemsSolved: {
          type: Number,
          default: 0,
        },
        totalPoints: {
          type: Number,
          default: 0,
        },
        averageScore: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastUsedAt: {
          type: Date,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      }],
      learningProgress: [{
        topic: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          required: true,
          trim: true,
        },
        mastery: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        problemsSolved: {
          type: Number,
          default: 0,
        },
        totalPoints: {
          type: Number,
          default: 0,
        },
        averageScore: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastStudiedAt: {
          type: Date,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    // NEW: Problem solving history for detailed tracking
    problemHistory: [{
      problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CrucibleProblem',
        required: true,
      },
      analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionAnalysis',
        required: true,
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      points: {
        type: Number,
        required: true,
        min: 0,
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
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
      solvedAt: {
        type: Date,
        default: Date.now,
      },
      reattempts: {
        type: Number,
        default: 0,
      },
    }],
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
    // App-managed avatar image URL
    profilePicture: {
      type: String,
      trim: true,
      default: '',
    },
    profileVisibility: {
      isPublic: {
        type: Boolean,
        default: true,
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showStats: {
        type: Boolean,
        default: true,
      },
      showAchievements: {
        type: Boolean,
        default: true,
      },
      showSkills: {
        type: Boolean,
        default: true,
      },
      showSocialLinks: {
        type: Boolean,
        default: true,
      },
      showCollegeDetails: {
        type: Boolean,
        default: true,
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