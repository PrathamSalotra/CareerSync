import mongoose from 'mongoose';

const LearningResourceSchema = new mongoose.Schema(
  {
    skillTags: {
      type: [String],
      required: true,
      default: [],
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    type: {
      type: String,
      enum: ['course', 'certification'],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LearningResourceSchema.index({ skillTags: 1, active: 1 });

export const LearningResource = mongoose.model('LearningResource', LearningResourceSchema);
export default LearningResource;
