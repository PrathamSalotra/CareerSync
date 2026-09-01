import { Resend } from 'resend';
import config from '../config/index.js';

let resendClient = null;
if (config.RESEND_API_KEY && config.RESEND_API_KEY !== 'mock_resend_key') {
  resendClient = new Resend(config.RESEND_API_KEY);
}

/**
 * Sends a password reset email to the user.
 * @param {string} email - The user's email address
 * @param {string} resetToken - The 32-byte hex reset token
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  if (!resendClient) {
    console.warn(`[Mock Email] Password reset for ${email} with token: ${resetToken}`);
    return;
  }

  // Generate a reset link using the frontend origin.
  // We assume the frontend will have a /reset-password route that reads the token query param.
  const resetLink = `${config.APP_ORIGIN}/reset-password?token=${resetToken}`;

  try {
    await resendClient.emails.send({
      from: config.RESEND_FROM_EMAIL || 'noreply@careersync.local',
      to: email,
      subject: 'CareerSync - Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your CareerSync account.</p>
        <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <small>CareerSync Support</small>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // We intentionally don't throw an error here to prevent email enumeration or 
    // blocking the response if the third-party service fails.
  }
};

export default {
  sendPasswordResetEmail,
};
