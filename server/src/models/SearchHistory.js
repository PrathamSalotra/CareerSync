import mongoose from 'mongoose';

const EvidenceSchema = new mongoose.Schema(
  {
    resumeSection: { type: String, default: null },
    detail: { type: String, default: null },
  },
  { _id: false }
);

const SkillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, default: null },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: null },
    suggestion: { type: String, default: null },
    resourceUrl: { type: String, default: null },
  },
  { _id: false }
);

const ExperienceGapSchema = new mongoose.Schema(
  {
    description: { type: String, default: null },
    suggestion: { type: String, default: null },
    resumeSection: { type: String, default: 'Experience' },
  },
  { _id: false }
);

const GapsSchema = new mongoose.Schema(
  {
    skillGaps: { type: [SkillGapSchema], default: [] },
    experienceGaps: { type: [ExperienceGapSchema], default: [] },
  },
  { _id: false }
);

const JobResultSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: null },
    workArrangement: { type: String, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    employmentType: { type: String, default: null },
    postedAt: { type: Date, default: null },
    description: { type: String, default: null },
    redirectUrl: { type: String, required: true },
    source: { type: String, default: 'Adzuna' },
    matchScore: { type: Number, default: null },
    fitExplanation: { type: String, default: null },
    evidence: { type: [EvidenceSchema], default: [] },
    gaps: { type: GapsSchema, default: () => ({}) },
  },
  { _id: false }
);

const SearchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    searchMode: {
      type: String,
      enum: ['resume', 'job-only'],
      required: true,
    },
    query: {
      type: String,
      default: null,
    },
    derivedQuery: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      required: true,
    },
    cityOrState: {
      type: String,
      default: null,
    },
    workArrangement: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: null,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    results: {
      type: [JobResultSchema],
      default: [],
    },
  },
  {
    timestamps: false,
  }
);

// Indexes (§4.5): Compound index on userId and searchedAt descending. Strictly NO TTL index.
SearchHistorySchema.index({ userId: 1, searchedAt: -1 });
SearchHistorySchema.index({ expiresAt: 1 });

export const SearchHistory = mongoose.model('SearchHistory', SearchHistorySchema);
export default SearchHistory;
