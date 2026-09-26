import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import './OtpVerification.css';

export const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { forgotPassword } = useAuth();

  // Retrieve email passed from forgot-password flow or fallback
  const userEmail = location.state?.email || 'alex.rivers@design.co';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15:00 in seconds
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Focus management
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value) return; // ignore non-numeric

    const newDigits = [...digits];
    // If user typed a single digit
    newDigits[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setDigits(newDigits);
    setErrorMessage('');

    // Advance focus if value was entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const cleanNumbers = pasteData.replace(/[^0-9]/g, '').slice(0, 6);
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    cleanNumbers.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);
    setErrorMessage('');

    const targetIndex = Math.min(cleanNumbers.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleResend = async () => {
    if (isResending || timeLeft > 14 * 60) return; // cooldown
    setIsResending(true);
    setResendStatus('');
    setErrorMessage('');

    try {
      await forgotPassword(userEmail);
      setTimeLeft(15 * 60);
      setResendStatus('A new 6-digit code has been sent.');
      setTimeout(() => setResendStatus(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('Verification code has expired. Please request a new one.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Navigate to reset password page with email & OTP in state
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/reset-password', {
        state: { email: userEmail, otp: otpCode },
      });
    }, 600);
  };

  return (
    <div className="cs-otp-page">
      <Navbar />

      <main className="cs-otp-main">
        {/* Ambient atmospheric aura */}
        <div className="cs-otp-orb-top" aria-hidden="true" />
        <div className="cs-otp-orb-bottom" aria-hidden="true" />

        <div className="cs-otp-container">
          <div className="cs-otp-card animate-slide-up">
            {/* Header */}
            <div className="cs-otp-header">
              <h1 className="cs-otp-title">Enter 6-Digit Code</h1>
              <p className="cs-otp-subtitle">
                We sent a single-use verification code to{' '}
                <span className="cs-otp-email">{userEmail}</span> to confirm your
                password recovery request.
              </p>
            </div>

            {/* Error or Success Alert */}
            {errorMessage && (
              <div className="cs-alert-error animate-shake" role="alert">
                <svg className="cs-alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {resendStatus && (
              <div className="cs-alert-success animate-fade-in" role="status">
                <svg className="cs-alert-success-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{resendStatus}</span>
              </div>
            )}

            {/* OTP Form */}
            <form className="cs-otp-form" onSubmit={handleSubmit} noValidate>
              <div className="cs-otp-input-group" onPaste={handlePaste}>
                {/* First 3 digits */}
                <div className="cs-otp-cluster">
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`cs-otp-box ${digits[idx] ? 'is-filled' : ''}`}
                      value={digits[idx]}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      aria-label={`Digit ${idx + 1}`}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>

                <span className="cs-otp-separator" aria-hidden="true">
                  -
                </span>

                {/* Last 3 digits */}
                <div className="cs-otp-cluster">
                  {[3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`cs-otp-box ${digits[idx] ? 'is-filled' : ''}`}
                      value={digits[idx]}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      aria-label={`Digit ${idx + 1}`}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </div>

              {/* Timer and Resend Row */}
              <div className="cs-otp-meta-row">
                <div className="cs-timer-cluster">
                  <svg className="cs-timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="cs-timer-label">Expires in:</span>
                  <span className="cs-timer-clock">{formatTime(timeLeft)}</span>
                </div>

                <button
                  type="button"
                  className="cs-resend-btn"
                  onClick={handleResend}
                  disabled={isResending || timeLeft <= 0}
                >
                  Didn't receive code?{' '}
                  <span className="cs-resend-action">
                    {isResending ? 'Sending...' : 'Resend'}
                  </span>
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className={`cs-verify-btn ${isSubmitting ? 'is-loading' : ''}`}
                disabled={isSubmitting || digits.join('').length < 6}
              >
                {isSubmitting ? (
                  <>
                    <span className="cs-btn-spinner" aria-hidden="true" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code &amp; Continue</span>
                    <svg className="cs-btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="cs-back-container">
              <Link to="/login" className="cs-back-btn">
                <svg className="cs-back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back to login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
