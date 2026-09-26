import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const otp = location.state?.otp;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // If user accesses this route directly without an OTP, kick them to forgot-password
  useEffect(() => {
    if (!otp) {
      navigate('/forgot-password');
    }
  }, [otp, navigate]);

  const hasLen = password.length >= 8;
  const hasCaseNum = /[A-Z]/.test(password) && /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length > 0) score++;
  if (hasLen) score++;
  if (hasCaseNum) score++;
  if (hasSymbol) score++;

  const getStrengthData = () => {
    if (score <= 1) return { text: 'Weak', className: 'text-error' };
    if (score <= 3) return { text: 'Moderate', className: 'text-on-surface-variant' };
    return { text: 'Strong', className: 'text-secondary' };
  };

  const getBarClass = (idx) => {
    if (idx >= score) return 'bg-surface-container-highest';
    if (score <= 2) return 'bg-error';
    if (score === 3) return 'bg-tertiary-fixed-dim';
    return 'bg-secondary-container';
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch || score < 4) return;

    setLoading(true);
    setError('');

    try {
      await apiClient('/api/auth/reset-password', {
        method: 'POST',
        body: { otp, password }
      });
      
      setShowToast(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reset password. The OTP may be invalid or expired.');
      setLoading(false);
    }
  };

  const strengthData = getStrengthData();

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <header className="w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-space-sm group">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors">CareerSync</span>
          </Link>
          <nav className="flex items-center gap-space-lg">
            <Link to="/support" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">Help & Support</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-center py-space-xl">
        <div className="flex flex-col w-full items-center justify-center relative">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-secondary-fixed/40 blur-3xl -top-24 -left-32 pointer-events-none -z-10"></div>
          <div className="absolute w-[450px] h-[450px] rounded-full bg-tertiary-fixed/30 blur-3xl -bottom-20 -right-24 pointer-events-none -z-10"></div>
          
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(25,28,30,0.06)] relative overflow-hidden transition-all duration-300">
            <div className="flex flex-col items-center text-center mb-8">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Set New Password</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
                Your identity has been verified. Choose a strong, unique password to secure your account.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-body-sm shadow-inner">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="new-password">New Password</label>
                  <span className={`font-label-sm text-label-sm font-semibold ${strengthData.className}`}>{strengthData.text}</span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none">lock</span>
                  <input 
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-12 pr-12 py-3.5 rounded-xl transition-all outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#000000]"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 rounded-lg text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${getBarClass(idx)}`}></div>
                  ))}
                </div>
                
                <div className="bg-surface-container-low/70 rounded-2xl p-4 mt-2 flex flex-col gap-2">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5">Requirements</p>
                  <div className={`flex items-center gap-2 ${hasLen ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${hasLen ? 'text-secondary' : 'text-outline-variant'}`}>
                      {hasLen ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="font-body-sm text-body-sm">At least 8 characters long</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasCaseNum ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${hasCaseNum ? 'text-secondary' : 'text-outline-variant'}`}>
                      {hasCaseNum ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="font-body-sm text-body-sm">Includes uppercase letter and a number</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasSymbol ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${hasSymbol ? 'text-secondary' : 'text-outline-variant'}`}>
                      {hasSymbol ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="font-body-sm text-body-sm">Includes a special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm-password">Confirm New Password</label>
                  {passwordsMatch && (
                    <div className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm opacity-100">
                      <span className="material-symbols-outlined text-[16px]">check</span><span>Passwords match</span>
                    </div>
                  )}
                  {mismatch && (
                    <div className="inline-flex items-center gap-1 text-error font-label-sm text-label-sm opacity-100">
                      <span className="material-symbols-outlined text-[16px]">close</span><span>Mismatch</span>
                    </div>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none">shield_lock</span>
                  <input 
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-12 pr-12 py-3.5 rounded-xl transition-all outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#000000]"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 p-1 rounded-lg text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={!passwordsMatch || score < 4 || loading}
                className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary py-4 px-6 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 group active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                ) : (
                  <>
                    <span>Reset Password & Sign In</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
              
              <div className="text-center mt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors group">
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Toast Notification */}
          <div className={`fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 pointer-events-none ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
            <span className="material-symbols-outlined text-secondary-container">check_circle</span>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm">Password Updated</span>
              <span className="font-body-sm text-body-sm text-surface-dim">Redirecting to login...</span>
            </div>
          </div>

        </div>
      </main>

      <footer className="w-full bg-surface-container-low/60 py-space-lg shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 CareerSync Technologies Inc. All rights reserved.</p>
          <nav className="flex items-center gap-space-lg">
            <Link to="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;
