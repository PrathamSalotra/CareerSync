import { User, RefreshToken } from '../../models/index.js';
import { hashPassword, verifyPassword, generateToken, hashToken } from '../../utils/passwords.js';
import { signAccessToken, signRefreshToken } from '../../utils/jwt.js';
import { setAuthCookies } from '../../utils/cookies.js';
import { AppError } from '../../utils/errors.js';

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
  const rawRefreshToken = generateToken(32);
  const refreshHash = hashToken(rawRefreshToken);
  const csrfToken = generateToken(32);

  const refreshTokenDoc = await RefreshToken.create({
    userId: user._id,
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  const accessToken = signAccessToken(user._id.toString());
  const refreshTokenJwt = signRefreshToken(user._id.toString(), refreshTokenDoc._id.toString());

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
  const rawRefreshToken = generateToken(32);
  const refreshHash = hashToken(rawRefreshToken);
  const csrfToken = generateToken(32);

  const refreshTokenDoc = await RefreshToken.create({
    userId: user._id,
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const accessToken = signAccessToken(user._id.toString());
  const refreshTokenJwt = signRefreshToken(user._id.toString(), refreshTokenDoc._id.toString());

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

export default {
  signup,
  login,
};
