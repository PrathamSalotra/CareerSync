import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter = null;
if (config.SMTP_USER && config.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using another provider
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
}

/**
 * Sends a password reset email to the user.
 * @param {string} email - The user's email address
 * @param {string} otp - The 6-digit one-time password
 */
export const sendPasswordResetEmail = async (email, otp) => {
  if (!transporter) {
    console.warn(`[Mock Email] Password reset for ${email} with OTP: ${otp}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"CareerSync" <${config.SMTP_USER}>`,
      to: email,
      subject: 'CareerSync - Password Reset OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your CareerSync account.</p>
          <p>Please use the following 6-digit code to reset your password. This code will expire in 15 minutes.</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h2 style="font-size: 32px; letter-spacing: 4px; color: #333; margin: 0;">${otp}</h2>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <small style="color: #888;">CareerSync Support</small>
        </div>
      `,
    });

    console.log(`Password reset OTP sent to ${email} (Message ID: ${info.messageId})`);
  } catch (err) {
    console.error('Failed to send password reset email exception:', err);
    // We intentionally don't throw an error here to prevent email enumeration or 
    // blocking the response if the third-party service fails.
  }
};

export default {
  sendPasswordResetEmail,
};
