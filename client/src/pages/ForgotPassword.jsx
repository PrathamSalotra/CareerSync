import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });
      
      // Navigate to OTP verification page on success
      navigate('/otp-verification', { state: { email } });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to request password reset.');
      setLoading(false);
    }
  };

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
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Forgot Password</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
                Enter your email address and we'll send you a 6-digit code to reset your password.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-body-sm shadow-inner">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none">mail</span>
                  <input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.rivers@design.co"
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-12 pr-4 py-3.5 rounded-xl transition-all outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#000000]"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={!email || loading}
                className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary py-4 px-6 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 group active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                ) : (
                  <>
                    <span>Send Reset Code</span>
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

export default ForgotPassword;
