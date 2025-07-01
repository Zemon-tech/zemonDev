import mongoose from 'mongoose';

const crucibleProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requirements: {
    functional: [{
      type: String,
      trim: true,
    }],
    nonFunctional: [{
      type: String,
      trim: true,
    }],
  },
  constraints: [{
    type: String,
    trim: true,
  }],
  expectedOutcome: {
    type: String,
    required: true,
  },
  hints: [{
    type: String,
    trim: true,
  }],
  solutionCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
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
crucibleProblemSchema.index({ title: 1 });
crucibleProblemSchema.index({ difficulty: 1 });
crucibleProblemSchema.index({ tags: 1 });
crucibleProblemSchema.index({ status: 1 });
crucibleProblemSchema.index({ authorId: 1 });

// Methods
crucibleProblemSchema.methods.updateRating = async function(newRating) {
  const oldTotal = this.averageRating * this.ratingCount;
  this.ratingCount += 1;
  this.averageRating = (oldTotal + newRating) / this.ratingCount;
  await this.save();
};

crucibleProblemSchema.methods.incrementSolutionCount = async function() {
  this.solutionCount += 1;
  await this.save();
};

// Statics
crucibleProblemSchema.statics.findByTags = function(tags) {
  return this.find({ tags: { $in: tags }, status: 'published' });
};

crucibleProblemSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, status: 'published' });
};

// Virtual for solution count
crucibleProblemSchema.virtual('difficultyScore').get(function() {
  const difficultyWeights = {
    easy: 1,
    medium: 2,
    hard: 3,
    expert: 4,
  };
  return difficultyWeights[this.difficulty] || 0;
});

const CrucibleProblem = mongoose.model('CrucibleProblem', crucibleProblemSchema);

export default CrucibleProblem; 