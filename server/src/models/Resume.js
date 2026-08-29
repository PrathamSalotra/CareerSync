import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    company: { type: String, default: null },
    employmentType: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    description: { type: String, default: null },
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: null },
    degree: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    location: { type: String, default: null },
  },
  { _id: false }
);

const ParsedResumeSchema = new mongoose.Schema(
  {
    contact: { type: ContactSchema, default: () => ({}) },
    derivedTargetTitle: { type: String, default: null },
    skills: { type: [String], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [String], default: [] },
  },
  { _id: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rawFileObjectKey: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    parsed: {
      type: ParsedResumeSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: false,
  }
);

// Indexes (§4.2)
ResumeSchema.index({ userId: 1, uploadedAt: -1 });
// Standard index on expiresAt (CRITICAL: Do NOT add expireAfterSeconds / TTL index here)
ResumeSchema.index({ expiresAt: 1 });

export const Resume = mongoose.model('Resume', ResumeSchema);
export default Resume;
