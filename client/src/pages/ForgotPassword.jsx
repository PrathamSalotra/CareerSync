import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import './ForgotPassword.css';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      
      // Navigate to OTP Verification with email state
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err.message || 'An error occurred while requesting a password reset.'
      );
    }
  };

  return (
    <div className="cs-forgot-page">
      <Navbar />

      <main className="cs-forgot-main">
        <div className="cs-ambient-glow" aria-hidden="true" />

        <div className="cs-forgot-container">
          <div className="cs-forgot-card animate-slide-up">
            <div className="cs-card-header">
              <h1 className="cs-card-title">Reset Password</h1>
              <p className="cs-card-subtitle">
                Enter your email address and we'll send you a 6-digit verification code to reset your password.
              </p>
            </div>

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
            
            {isSuccess && (
              <div className="cs-alert-success animate-fade-in" role="status">
                <svg className="cs-alert-success-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verification code sent!</span>
              </div>
            )}

            <form className="cs-forgot-form" onSubmit={handleSubmit} noValidate>
              <div className="cs-form-group">
                <label className="cs-label" htmlFor="email-input">
                  Email
                </label>
                <div className="cs-input-wrapper">
                  <svg className="cs-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    className="cs-input"
                    placeholder="alex.rivers@design.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading || isSuccess}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`cs-submit-btn ${isLoading ? 'is-loading' : ''} ${isSuccess ? 'is-success' : ''}`}
                disabled={isLoading || isSuccess || !email}
              >
                {isLoading ? (
                  <>
                    <span className="cs-btn-spinner" aria-hidden="true" />
                    <span>Sending Code...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <svg className="cs-btn-check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Sent</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <svg className="cs-btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

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
