import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const generateOTP = (length = 6) => {
  // Generate a cryptographically secure random number between 100000 and 999999
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

export default {
  hashPassword,
  verifyPassword,
  hashToken,
  generateToken,
  generateOTP,
};
