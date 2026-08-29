import config from '../config/index.js';

export const getCookieOptions = (customOptions = {}) => {
  return {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    ...customOptions,
  };
};

export default getCookieOptions;
