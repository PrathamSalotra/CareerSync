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

export default {
  hashPassword,
  verifyPassword,
  hashToken,
  generateToken,
};
