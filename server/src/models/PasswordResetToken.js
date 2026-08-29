import mongoose from 'mongoose';

const PasswordResetTokenSchema = new mongoose.Schema(
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
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
PasswordResetTokenSchema.index({ expiresAt: 1 });

export const PasswordResetToken = mongoose.model(
  'PasswordResetToken',
  PasswordResetTokenSchema
);
export default PasswordResetToken;
