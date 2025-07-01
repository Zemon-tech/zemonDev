import mongoose from 'mongoose';

const forgeResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['article', 'video', 'book', 'course', 'tool', 'repository', 'documentation'],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String, // For articles that are hosted directly on the platform
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
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  metrics: {
    viewCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  lastCheckedAt: Date, // For URL validation
  isUrlValid: {
    type: Boolean,
    default: true,
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
forgeResourceSchema.index({ title: 'text', description: 'text' });
forgeResourceSchema.index({ tags: 1 });
forgeResourceSchema.index({ type: 1 });
forgeResourceSchema.index({ difficulty: 1 });
forgeResourceSchema.index({ status: 1 });
forgeResourceSchema.index({ 'metrics.viewCount': -1 });
forgeResourceSchema.index({ 'metrics.bookmarkCount': -1 });
forgeResourceSchema.index({ 'metrics.rating.average': -1 });

// Methods
forgeResourceSchema.methods.incrementViewCount = async function() {
  this.metrics.viewCount += 1;
  await this.save();
};

forgeResourceSchema.methods.updateBookmarkCount = async function(increment) {
  this.metrics.bookmarkCount += increment ? 1 : -1;
  await this.save();
};

forgeResourceSchema.methods.addReview = async function(userId, rating, comment) {
  // Remove existing review if present
  const existingReviewIndex = this.reviews.findIndex(r => r.userId.equals(userId));
  if (existingReviewIndex !== -1) {
    this.reviews.splice(existingReviewIndex, 1);
  }

  // Add new review
  this.reviews.push({ userId, rating, comment });

  // Update metrics
  const totalRatings = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.metrics.rating.count = this.reviews.length;
  this.metrics.rating.average = totalRatings / this.reviews.length;

  await this.save();
};

// Statics
forgeResourceSchema.statics.findByTags = function(tags) {
  return this.find({
    tags: { $in: tags },
    status: 'published',
    isUrlValid: true,
  }).sort({ 'metrics.viewCount': -1 });
};

forgeResourceSchema.statics.findTrending = function(limit = 10) {
  return this.find({
    status: 'published',
    isUrlValid: true,
  })
    .sort({
      'metrics.viewCount': -1,
      'metrics.bookmarkCount': -1,
      'metrics.rating.average': -1,
    })
    .limit(limit);
};

forgeResourceSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({
    difficulty,
    status: 'published',
    isUrlValid: true,
  }).sort({ 'metrics.rating.average': -1 });
};

const ForgeResource = mongoose.model('ForgeResource', forgeResourceSchema);

export default ForgeResource; 