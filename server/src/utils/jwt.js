import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const signAccessToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

export const signRefreshToken = (userId, tokenId) => {
  return jwt.sign({ userId, tokenId }, config.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

export const signResetToken = (userId, tokenId) => {
  return jwt.sign({ userId, tokenId }, config.JWT_RESET_SECRET, {
    expiresIn: '15m',
  });
};

export const verifyResetToken = (token) => {
  return jwt.verify(token, config.JWT_RESET_SECRET);
};

export default {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
};
