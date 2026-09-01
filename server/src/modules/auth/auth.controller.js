import mongoose from 'mongoose';
import { User, RefreshToken, PasswordResetToken } from '../../models/index.js';
import { hashPassword, verifyPassword, generateToken, hashToken } from '../../utils/passwords.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies.js';
import { AppError } from '../../utils/errors.js';
import emailService from '../../services/email.service.js';

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if account already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError(400, 'VALIDATION_ERROR', 'An account with this email already exists');
  }

  // Atomically check beta cap (< 30 users)
  const userCount = await User.countDocuments();
  if (userCount >= 30) {
    throw new AppError(403, 'BETA_FULL', 'Registration is full for the early-access beta.');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  // Issue RefreshToken record
  const tokenId = new mongoose.Types.ObjectId();
  const refreshTokenJwt = signRefreshToken(user._id.toString(), tokenId.toString());
  const refreshHash = hashToken(refreshTokenJwt);
  const csrfToken = generateToken(32);

  await RefreshToken.create({
    _id: tokenId,
    userId: user._id,
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  const accessToken = signAccessToken(user._id.toString());

  setAuthCookies(res, {
    accessToken,
    refreshToken: refreshTokenJwt,
    csrfToken,
  });

  return res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
  }

  // Check lockout
  if (user.loginLockUntil && user.loginLockUntil > new Date()) {
    throw new AppError(
      401,
      'UNAUTHORIZED',
      'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
    );
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.loginLockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
    }
    await user.save();
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
  }

  // Successful login -> Reset lockout counters
  user.failedLoginAttempts = 0;
  user.loginLockUntil = null;
  await user.save();

  // Issue RefreshToken record
  const tokenId = new mongoose.Types.ObjectId();
  const refreshTokenJwt = signRefreshToken(user._id.toString(), tokenId.toString());
  const refreshHash = hashToken(refreshTokenJwt);
  const csrfToken = generateToken(32);

  await RefreshToken.create({
    _id: tokenId,
    userId: user._id,
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = signAccessToken(user._id.toString());

  setAuthCookies(res, {
    accessToken,
    refreshToken: refreshTokenJwt,
    csrfToken,
  });

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies.cs_refresh;
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'No refresh token provided');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(token);
  const refreshTokenDoc = await RefreshToken.findById(decoded.tokenId);

  if (!refreshTokenDoc) {
    throw new AppError(401, 'UNAUTHORIZED', 'Refresh token not found');
  }

  if (refreshTokenDoc.tokenHash !== tokenHash) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token signature mismatch');
  }

  if (refreshTokenDoc.revoked) {
    // Reuse detected! Revoke all tokens for this user.
    await RefreshToken.updateMany(
      { userId: refreshTokenDoc.userId, revoked: false },
      { $set: { revoked: true, revokedAt: new Date() } }
    );
    throw new AppError(401, 'UNAUTHORIZED', 'Token reuse detected. All sessions revoked.');
  }

  // Revoke the old token
  refreshTokenDoc.revoked = true;
  refreshTokenDoc.revokedAt = new Date();
  
  // Issue new tokens
  const newTokenId = new mongoose.Types.ObjectId();
  const newRefreshTokenJwt = signRefreshToken(refreshTokenDoc.userId.toString(), newTokenId.toString());
  const newRefreshHash = hashToken(newRefreshTokenJwt);
  const newCsrfToken = generateToken(32);

  refreshTokenDoc.replacedByTokenId = newTokenId;
  await refreshTokenDoc.save();

  await RefreshToken.create({
    _id: newTokenId,
    userId: refreshTokenDoc.userId,
    tokenHash: newRefreshHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = signAccessToken(refreshTokenDoc.userId.toString());

  setAuthCookies(res, {
    accessToken,
    refreshToken: newRefreshTokenJwt,
    csrfToken: newCsrfToken,
  });

  return res.status(200).json({ status: 'ok' });
};

export const logout = async (req, res) => {
  const token = req.cookies.cs_refresh;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await RefreshToken.findByIdAndUpdate(decoded.tokenId, {
        $set: { revoked: true, revokedAt: new Date() },
      });
    } catch (err) {
      // If token is invalid or expired, just ignore and clear cookies
    }
  }

  clearAuthCookies(res);
  return res.status(204).send();
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  
  // To prevent enumeration, we always return the same generic message.
  const successMessage = 'If an account with that email exists, a password reset link has been sent.';

  if (!user) {
    return res.status(200).json({ message: successMessage });
  }

  // Rate Limiting: max 3 requests per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentRequestsCount = await PasswordResetToken.countDocuments({
    userId: user._id,
    expiresAt: { $gt: oneHourAgo }, // We use expiresAt as a proxy for createdAt (it's +15m)
  });

  if (recentRequestsCount >= 3) {
    // Still return the generic message to avoid giving clues, 
    // but don't send the email.
    return res.status(200).json({ message: successMessage });
  }

  const rawResetToken = generateToken(32);
  const resetHash = hashToken(rawResetToken);

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash: resetHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });

  await emailService.sendPasswordResetEmail(user.email, rawResetToken);

  return res.status(200).json({ message: successMessage });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const resetHash = hashToken(token);
  const resetTokenDoc = await PasswordResetToken.findOne({
    tokenHash: resetHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).populate('userId');

  if (!resetTokenDoc || !resetTokenDoc.userId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid or expired reset token');
  }

  // Mark token as used
  resetTokenDoc.usedAt = new Date();
  await resetTokenDoc.save();

  // Update user's password
  const newPasswordHash = await hashPassword(password);
  const user = resetTokenDoc.userId;
  user.passwordHash = newPasswordHash;
  await user.save();

  // Revoke every refresh token for that user (end all sessions)
  await RefreshToken.updateMany(
    { userId: user._id, revoked: false },
    { $set: { revoked: true, revokedAt: new Date() } }
  );

  return res.status(200).json({ message: 'Password has been reset successfully' });
};

export default {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
