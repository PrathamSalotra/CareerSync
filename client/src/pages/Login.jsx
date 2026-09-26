import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { SocialProof } from '../components/auth/SocialProof';
import './Login.css';

// Flag to easily toggle social logins if OAuth is configured in the future
// Set to false by default per requirement: remove options not yet implemented on the backend.
const ENABLE_SOCIAL_AUTH = false;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination after login (e.g. redirected from protected route)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 700);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(
        err.message || 'Unable to sign in. Please verify your email and password.'
      );
    }
  };

  return (
    <div className="cs-login-page">
      <Navbar />

      <main className="cs-login-main">
        {/* Ambient background blur glow */}
        <div className="cs-ambient-glow" aria-hidden="true" />

        <div className="cs-login-container">
          <div className="cs-login-card animate-slide-up">
            {/* Header / Title */}
            <div className="cs-card-header">
              <h1 className="cs-card-title">Welcome Back</h1>
              <p className="cs-card-subtitle">
                Sign in to access your AI job matching intelligence and career dossier.
              </p>
            </div>

            {/* Optional Social Login Buttons (Configurable) */}
            {ENABLE_SOCIAL_AUTH && (
              <>
                <div className="cs-social-buttons">
                  <button
                    type="button"
                    className="cs-social-btn"
                    onClick={() => alert('Google Sign-In is not configured yet.')}
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
                    onClick={() => alert('GitHub Sign-In is not configured yet.')}
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
                  <span className="cs-divider-text">Or continue with email</span>
                </div>
              </>
            )}

            {/* Error Notification Banner */}
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

            {/* Login Form */}
            <form className="cs-login-form" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
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

              {/* Password Field */}
              <div className="cs-form-group">
                <div className="cs-label-row">
                  <label className="cs-label" htmlFor="password-input">
                    Password
                  </label>
                  <Link to="/forgot-password" className="cs-forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="cs-input-wrapper">
                  <svg className="cs-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="cs-input cs-input-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading || isSuccess}
                  />
                  <button
                    type="button"
                    className="cs-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
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
                    <span>Authenticating...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <svg className="cs-btn-check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Authenticated</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to CareerSync</span>
                    <svg className="cs-btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="cs-signup-prompt">
              <p className="cs-signup-text">
                Don't have an account?{' '}
                <Link to="/signup" className="cs-signup-link">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Social Proof Pill below card */}
          <SocialProof />
        </div>
      </main>

      <Footer />
    </div>
  );
};
