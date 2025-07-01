import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
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
  profile: {
    avatarUrl: String,
    headline: {
      type: String,
      maxLength: 100,
    },
    bio: {
      type: String,
      maxLength: 500,
    },
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
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
  interests: [{
    type: String,
    trim: true,
  }],
  role: {
    type: String,
    enum: ['student', 'moderator', 'admin'],
    default: 'student',
  },
  stats: {
    crucibleSolutions: {
      type: Number,
      default: 0,
    },
    forgeContributions: {
      type: Number,
      default: 0,
    },
  },
  completedSolutions: [{
    solutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleSolution',
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrucibleProblem',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  bookmarkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForgeResource',
  }],
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'completedSolutions.problemId': 1 });
userSchema.index({ 'completedSolutions.solutionId': 1 });

// Methods
userSchema.methods.addCompletedSolution = async function(solutionId, problemId) {
  if (!this.completedSolutions.some(s => s.solutionId.equals(solutionId))) {
    this.completedSolutions.push({ solutionId, problemId });
    this.stats.crucibleSolutions += 1;
    await this.save();
  }
};

userSchema.methods.toggleBookmark = async function(resourceId) {
  const index = this.bookmarkedResources.indexOf(resourceId);
  if (index === -1) {
    this.bookmarkedResources.push(resourceId);
  } else {
    this.bookmarkedResources.splice(index, 1);
  }
  await this.save();
  return index === -1; // returns true if bookmarked, false if unbookmarked
};

// Statics
userSchema.statics.findByClerkId = function(clerkId) {
  return this.findOne({ clerkId });
};

const User = mongoose.model('User', userSchema);

export default User; 