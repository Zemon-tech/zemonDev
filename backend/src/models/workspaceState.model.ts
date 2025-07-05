import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceState extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  activeMode: 'solution' | 'notes' | 'diagram' | 'research';
  layout: {
    showProblemSidebar: boolean;
    showChatSidebar: boolean;
    sidebarWidths: {
      problem: number;
      chat: number;
    };
  };
  editorSettings: {
    fontSize: number;
    theme: string;
    wordWrap: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceStateSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
      required: true,
    },
    activeMode: {
      type: String,
      enum: ['solution', 'notes', 'diagram', 'research'],
      default: 'solution',
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
  },
  { timestamps: true }
);

// Create a compound index for efficient lookups
WorkspaceStateSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model<IWorkspaceState>('WorkspaceState', WorkspaceStateSchema); 