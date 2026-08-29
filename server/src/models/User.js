import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    loginLockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ createdAt: 1 });

export const User = mongoose.model('User', UserSchema);
export default User;
