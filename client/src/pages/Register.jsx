import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import './Register.css';

// Flag to easily toggle social logins if OAuth is configured in the future
// Set to false per requirement: remove options not yet implemented on the backend.
const ENABLE_SOCIAL_AUTH = false;

export const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: 'var(--color-error)' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#d97706' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'var(--color-secondary)' };
    return { score: 0, label: 'Too short', color: 'var(--color-error)' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (strength.score < 3) {
      setErrorMessage('Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await signup(name, email, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 700);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err.message || 'Unable to create account. Please check your information.'
      );
    }
  };

  return (
    <div className="cs-register-page">
      <Navbar />

      <main className="cs-register-main">
        {/* Ambient atmospheric blur orbs */}
        <div className="cs-ambient-orb-top" aria-hidden="true" />
        <div className="cs-ambient-orb-bottom" aria-hidden="true" />

        <div className="cs-register-container">
          <div className="cs-register-card animate-slide-up">
            {/* Header / Title */}
            <div className="cs-reg-header">
              <h1 className="cs-reg-title">Create your Account</h1>
              <p className="cs-reg-subtitle">
                Start exploring high-affinity AI matched roles.
              </p>
            </div>

            {/* Optional Social Register Buttons */}
            {ENABLE_SOCIAL_AUTH && (
              <>
                <div className="cs-social-buttons">
                  <button
                    type="button"
                    className="cs-social-btn"
                    onClick={() => alert('Google Sign-Up is not configured yet.')}
                  >
                    <svg className="cs-social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="cs-social-btn"
                    onClick={() => alert('GitHub Sign-Up is not configured yet.')}
                  >
                    <svg className="cs-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="cs-divider">
                  <div className="cs-divider-line" />
                  <span className="cs-divider-text">Or register with email</span>
                </div>
              </>
            )}

            {/* Error Notification */}
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

            {/* Registration Form */}
            <form className="cs-reg-form" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="cs-form-group">
                <label className="cs-label" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="cs-input-wrapper">
                  <svg className="cs-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    className="cs-input"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    disabled={isLoading || isSuccess}
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="cs-form-group">
                <label className="cs-label" htmlFor="reg-email">
                  Work Email
                </label>
                <div className="cs-input-wrapper">
                  <svg className="cs-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    className="cs-input"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading || isSuccess}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="cs-form-group">
                <div className="cs-label-row">
                  <label className="cs-label" htmlFor="reg-pass">
                    Password
                  </label>

                </div>
                <div className="cs-input-wrapper">
                  <svg className="cs-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="cs-input cs-input-password"
                    placeholder="Min. 8 characters"
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cs-toggle-icon" aria-hidden="true">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cs-toggle-icon" aria-hidden="true">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Hint */}
                <div className="cs-strength-meter">
                  <p className="cs-strength-hint">
                    {strength.score === 3 ? (
                      <svg className="cs-hint-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ color: 'var(--color-secondary)' }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="cs-hint-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ color: 'var(--color-outline-variant)' }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span style={{ color: strength.score === 3 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}>
                      8+ characters with mixed case, numbers &amp; symbols
                    </span>
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="cs-terms-group">
                <label className="cs-checkbox-label">
                  <input
                    type="checkbox"
                    className="cs-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={isLoading || isSuccess}
                  />
                  <span className="cs-checkbox-text">
                    I agree to the{' '}
                    <Link to="/about" className="cs-inline-link">
                      Terms of Service
                    </Link>{' '}
                    and acknowledge the{' '}
                    <Link to="/about" className="cs-inline-link">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className={`cs-submit-btn ${isLoading ? 'is-loading' : ''} ${isSuccess ? 'is-success' : ''}`}
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  <>
                    <span className="cs-btn-spinner" aria-hidden="true" />
                    <span>Creating Account...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <svg className="cs-btn-check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Account Created</span>
                  </>
                ) : (
                  <>
                    <span>Create CareerSync Account</span>
                    <svg className="cs-btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Sign In Prompt */}
            <div className="cs-signin-prompt">
              <p className="cs-signin-text">
                Already have an account?{' '}
                <Link to="/login" className="cs-signin-link">
                  Sign in
                  <svg className="cs-chevron-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
