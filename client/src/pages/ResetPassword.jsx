import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import './ResetPassword.css';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  
  const userEmail = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if missing state
  useEffect(() => {
    if (!otp) {
      navigate('/login');
    }
  }, [otp, navigate]);

  // Password validation state
  const hasLength = password.length >= 8;
  const hasCaseNum = /[A-Z]/.test(password) && /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  let score = 0;
  if (password.length > 0) score++;
  if (hasLength) score++;
  if (hasCaseNum) score++;
  if (hasSymbol) score++;

  let strengthLabel = 'Weak';
  let strengthClass = 'text-error';
  if (score <= 1) {
    strengthLabel = 'Weak';
    strengthClass = 'text-error';
  } else if (score <= 3) {
    strengthLabel = 'Moderate';
    strengthClass = 'text-warning';
  } else {
    strengthLabel = 'Strong';
    strengthClass = 'text-success';
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    if (!hasLength || !hasCaseNum || !hasSymbol) {
      setErrorMessage('Please ensure your password meets all requirements.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await resetPassword(otp, password);
      setIsSuccess(true);
      
      // Navigate to Login after success
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3500);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err.message || 'An error occurred while resetting your password.'
      );
    }
  };

  return (
    <div className="cs-reset-page">
      <Navbar />

      <main className="cs-reset-main">
        <div className="cs-ambient-glow-1" aria-hidden="true" />
        <div className="cs-ambient-glow-2" aria-hidden="true" />

        <div className="cs-reset-container">
          <div className="cs-reset-card animate-slide-up">
            <div className="cs-card-header">
              <h1 className="cs-card-title">Set New Password</h1>
              <p className="cs-card-subtitle">
                Your identity has been verified. Choose a strong, unique password to secure your account.
              </p>
            </div>

            {errorMessage && (
              <div className="cs-alert-error animate-shake" role="alert">
                <svg className="cs-alert-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="cs-reset-form" onSubmit={handleSubmit} noValidate>
              <div className="cs-form-group">
                <div className="cs-label-row">
                  <label className="cs-label" htmlFor="new-password">New Password</label>
                  {password.length > 0 && (
                    <span className={`cs-strength-label ${strengthClass}`}>{strengthLabel}</span>
                  )}
                </div>
                <div className="cs-input-wrapper">
                  <span className="material-symbols-outlined cs-input-icon">lock</span>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="cs-input cs-input-password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || isSuccess}
                  />
                  <button
                    type="button"
                    className="cs-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                
                <div className="cs-strength-bars">
                  <div className={`cs-bar ${score >= 1 ? (score <= 2 ? 'bg-error' : score === 3 ? 'bg-warning' : 'bg-success') : ''}`}></div>
                  <div className={`cs-bar ${score >= 2 ? (score <= 2 ? 'bg-error' : score === 3 ? 'bg-warning' : 'bg-success') : ''}`}></div>
                  <div className={`cs-bar ${score >= 3 ? (score === 3 ? 'bg-warning' : 'bg-success') : ''}`}></div>
                  <div className={`cs-bar ${score >= 4 ? 'bg-success' : ''}`}></div>
                </div>

                <div className="cs-requirements-box">
                  <p className="cs-req-title">Requirements</p>
                  <div className={`cs-req-item ${hasLength ? 'valid' : ''}`}>
                    <span className="material-symbols-outlined">{hasLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                    <span>At least 8 characters long</span>
                  </div>
                  <div className={`cs-req-item ${hasCaseNum ? 'valid' : ''}`}>
                    <span className="material-symbols-outlined">{hasCaseNum ? 'check_circle' : 'radio_button_unchecked'}</span>
                    <span>Includes uppercase letter and a number</span>
                  </div>
                  <div className={`cs-req-item ${hasSymbol ? 'valid' : ''}`}>
                    <span className="material-symbols-outlined">{hasSymbol ? 'check_circle' : 'radio_button_unchecked'}</span>
                    <span>Includes a special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              <div className="cs-form-group">
                <div className="cs-label-row">
                  <label className="cs-label" htmlFor="confirm-password">Confirm New Password</label>
                  {confirmPassword.length > 0 && (
                    <div className={`cs-match-badge ${passwordsMatch ? 'match' : 'mismatch'}`}>
                      <span className="material-symbols-outlined">{passwordsMatch ? 'check' : 'close'}</span>
                      <span>{passwordsMatch ? 'Passwords match' : 'Mismatch'}</span>
                    </div>
                  )}
                </div>
                <div className="cs-input-wrapper">
                  <span className="material-symbols-outlined cs-input-icon">shield_lock</span>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="cs-input cs-input-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading || isSuccess}
                  />
                  <button
                    type="button"
                    className="cs-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`cs-submit-btn ${isLoading ? 'is-loading' : ''} ${isSuccess ? 'is-success' : ''}`}
                disabled={isLoading || isSuccess || !password || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <span className="cs-btn-spinner" aria-hidden="true" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password &amp; Sign In</span>
                    <span className="material-symbols-outlined cs-btn-arrow-icon">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="cs-back-container">
                <Link to="/login" className="cs-back-btn group">
                  <span className="material-symbols-outlined cs-back-icon group-hover:-translate-x-1">arrow_back</span>
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Toast Notification */}
          <div className={`cs-toast ${isSuccess ? 'show' : ''}`} id="toast">
            <span className="material-symbols-outlined text-secondary-container">check_circle</span>
            <div className="cs-toast-content">
              <span className="cs-toast-title">Password Updated</span>
              <span className="cs-toast-subtitle">Redirecting to login...</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
