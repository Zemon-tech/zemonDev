import mongoose from 'mongoose';

const crucibleSolutionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrucibleProblem',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'analyzing', 'reviewed', 'approved', 'rejected', 'needs_revision'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
  },
  aiAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: String,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    analyzedAt: Date,
  },
  reviews: [{
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  version: {
    type: Number,
    default: 1,
  },
  revisionHistory: [{
    version: Number,
    content: String,
    status: String,
    updatedAt: Date,
  }],
  metrics: {
    viewCount: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
  },
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
crucibleSolutionSchema.index({ problemId: 1, userId: 1 }, { unique: true });
crucibleSolutionSchema.index({ status: 1 });
crucibleSolutionSchema.index({ 'reviews.reviewerId': 1 });
crucibleSolutionSchema.index({ 'metrics.viewCount': -1 });

// Methods
crucibleSolutionSchema.methods.updateStatus = async function(newStatus) {
  // Store current version in revision history
  this.revisionHistory.push({
    version: this.version,
    content: this.content,
    status: this.status,
    updatedAt: new Date(),
  });

  // Update status and version
  this.status = newStatus;
  this.version += 1;

  if (newStatus === 'submitted') {
    this.submittedAt = new Date();
  }

  await this.save();
};

crucibleSolutionSchema.methods.addReview = async function(reviewerId, rating, comment) {
  this.reviews.push({
    reviewerId,
    rating,
    comment,
  });

  // Update status based on review
  if (rating >= 4) {
    this.status = 'approved';
  } else if (rating <= 2) {
    this.status = 'needs_revision';
  }

  await this.save();
};

crucibleSolutionSchema.methods.updateAIAnalysis = async function(analysis) {
  this.aiAnalysis = {
    ...analysis,
    analyzedAt: new Date(),
  };
  this.status = 'reviewed';
  await this.save();
};

// Statics
crucibleSolutionSchema.statics.findByProblem = function(problemId) {
  return this.find({ problemId, status: { $in: ['approved', 'reviewed'] } })
    .populate('userId', 'fullName profile')
    .sort({ 'metrics.upvotes': -1 });
};

crucibleSolutionSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('problemId', 'title difficulty')
    .sort({ updatedAt: -1 });
};

const CrucibleSolution = mongoose.model('CrucibleSolution', crucibleSolutionSchema);

export default CrucibleSolution; 