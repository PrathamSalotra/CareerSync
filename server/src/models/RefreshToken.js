import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByTokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RefreshToken',
      default: null,
    },
    deviceMetadata: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
RefreshTokenSchema.index({ expiresAt: 1 });

export const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
