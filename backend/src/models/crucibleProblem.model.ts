import mongoose, { Schema, Document } from 'mongoose';

interface IPrerequisite {
  name: string;
  link: string;
}

interface IRelatedResource {
  title: string;
  link: string;
}

interface ICommunityTip {
  content: string;
  author: string;
}

interface IRequirement {
  requirement: string;
  context: string;
}

export interface ICrucibleProblem extends Document {
  title: string;
  description: string;
  thumbnailUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'algorithms' | 'system-design' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'frontend' | 'backend';
  tags: string[];
  requirements: {
    functional: IRequirement[];
    nonFunctional: IRequirement[];
  };
  constraints: string[];
  expectedOutcome: string;
  hints: string[];
  createdBy: mongoose.Types.ObjectId;
  metrics: {
    attempts: number;
    solutions: number;
    successRate: number;
    likes: number;
  };
  userLikes: mongoose.Types.ObjectId[];
  estimatedTime?: number;
  learningObjectives?: string[];
  prerequisites?: IPrerequisite[];
  userPersona?: {
    name: string;
    journey: string;
  };
  dataAssumptions?: string[];
  edgeCases?: string[];
  relatedResources?: IRelatedResource[];
  subtasks?: string[];
  communityTips?: ICommunityTip[];
  aiPrompts?: string[];
  technicalParameters?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const CrucibleProblemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
      index: true,
    },
    category: {
      type: String,
      enum: ['algorithms', 'system-design', 'web-development', 'mobile-development', 'data-science', 'devops', 'frontend', 'backend'],
      default: 'algorithms',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    requirements: {
      functional: [
        {
          requirement: {
            type: String,
            required: true,
          },
          context: {
            type: String,
            default: '',
          },
        },
      ],
      nonFunctional: [
        {
          requirement: {
            type: String,
            required: true,
          },
          context: {
            type: String,
            default: '',
          },
        },
      ],
    },
    constraints: {
      type: [String],
      default: [],
    },
    expectedOutcome: {
      type: String,
      required: [true, 'Please provide the expected outcome'],
    },
    hints: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    metrics: {
      attempts: {
        type: Number,
        default: 0,
      },
      solutions: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
    },
    userLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    estimatedTime: {
      type: Number,
      default: 0,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    prerequisites: [
      {
        name: {
          type: String,
          required: true,
        },
        link: {
          type: String,
          default: '',
        },
      },
    ],
    userPersona: {
      name: {
        type: String,
        default: '',
      },
      journey: {
        type: String,
        default: '',
      },
    },
    dataAssumptions: {
      type: [String],
      default: [],
    },
    edgeCases: {
      type: [String],
      default: [],
    },
    relatedResources: [
      {
        title: {
          type: String,
          required: true,
        },
        link: {
          type: String,
          default: '',
        },
      },
    ],
    subtasks: {
      type: [String],
      default: [],
    },
    communityTips: [
      {
        content: {
          type: String,
          required: true,
        },
        author: {
          type: String,
          default: 'Anonymous',
        },
      },
    ],
    aiPrompts: {
      type: [String],
      default: [],
    },
    technicalParameters: {
      type: [String],
      required: false,
      default: []
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
CrucibleProblemSchema.index({ createdAt: -1 });

// Text index for full-text search
CrucibleProblemSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ICrucibleProblem>('CrucibleProblem', CrucibleProblemSchema); 