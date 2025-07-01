import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  shortName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  university: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'India',
    },
  },
  website: {
    type: String,
    trim: true,
  },
  domains: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  studentCount: {
    type: Number,
    default: 0,
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
collegeSchema.index({ name: 1 });
collegeSchema.index({ shortName: 1 });
collegeSchema.index({ 'location.city': 1, 'location.state': 1 });
collegeSchema.index({ domains: 1 });

// Methods
collegeSchema.methods.incrementStudentCount = async function() {
  this.studentCount += 1;
  await this.save();
};

collegeSchema.methods.decrementStudentCount = async function() {
  if (this.studentCount > 0) {
    this.studentCount -= 1;
    await this.save();
  }
};

// Statics
collegeSchema.statics.findByDomain = function(email) {
  const domain = email.split('@')[1];
  return this.findOne({ domains: domain });
};

const College = mongoose.model('College', collegeSchema);

export default College;