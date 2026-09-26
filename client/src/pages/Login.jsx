import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await apiClient('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      setStatus('success');
      // Adding a tiny delay to show the success animation from the design
      setTimeout(() => {
        navigate('/dashboard'); // or wherever the user goes after login
      }, 1000);
    } catch (error) {
      setStatus('error');
      setErrorMsg(error.response?.data?.error?.message || 'Invalid email or password. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <header className="w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-space-sm group">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight group-hover:text-primary transition-colors">
              CareerSync
            </span>
          </Link>
          <nav className="flex items-center gap-space-lg">
            <Link to="/help" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
              Help &amp; Support
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-center py-space-xl">
        <div className="flex flex-col w-full items-center justify-center relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[620px] h-[360px] bg-gradient-to-tr from-secondary-fixed-dim/20 via-tertiary-fixed/30 to-secondary-container/15 blur-3xl pointer-events-none rounded-full -z-10"></div>
          <div className="w-full max-w-md mx-auto">
            <div className="bg-surface-container-lowest rounded-xl p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(18,19,22,0.06)] relative overflow-hidden transition-all duration-300">
              
              <div className="space-y-1 mb-8 text-center">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Welcome Back</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Sign in to access your AI job matching intelligence and career dossier.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-space-sm mb-6">
                <button type="button" className="group flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-surface-container-lowest hover:bg-surface-container-low shadow-sm transition-all duration-200">
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-label-md text-label-md text-on-surface">Google</span>
                </button>
                <button type="button" className="group flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-surface-container-lowest hover:bg-surface-container-low shadow-sm transition-all duration-200">
                  <svg className="w-4 h-4 shrink-0 text-on-surface transition-transform group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                  </svg>
                  <span className="font-label-md text-label-md text-on-surface">GitHub</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full h-px bg-surface-container-highest"></div>
                <span className="absolute px-3 bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Or continue with email
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                {errorMsg && (
                  <div className="bg-error-container text-on-error-container text-body-sm p-3 rounded-md text-center">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block font-label-md text-label-md text-on-surface">
                    Email
                  </label>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-secondary text-[20px] transition-colors">
                      mail
                    </span>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="alex.rivers@design.co" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-body-md pl-11 pr-4 py-3 rounded-full outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(0,99,152,0.35)]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block font-label-md text-label-md text-on-surface">
                      Password
                    </label>
                    <Link to="/forgot-password" className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-fixed-variant transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center group">
                    <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-secondary text-[20px] transition-colors">
                      lock
                    </span>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      id="password" 
                      name="password" 
                      placeholder="••••••••••••" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-low text-on-surface placeholder:text-outline-variant font-body-md text-body-md pl-11 pr-12 py-3 rounded-full outline-none transition-all duration-200 focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(0,99,152,0.35)]" 
                    />
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility}
                      aria-label="Toggle password visibility" 
                      className="absolute right-4 text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 rounded-full transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-label-md text-label-md transition-all duration-200 shadow-sm group cursor-pointer
                    ${status === 'success' ? 'bg-secondary text-white hover:bg-secondary' : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow-md active:scale-[0.99]'}
                    ${status === 'loading' ? 'opacity-80' : ''}
                  `}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin mr-2"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] mr-1.5">check_circle</span>
                      <span>Authenticated</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to CareerSync</span>
                      <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center pt-4">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Don't have an account? 
                  <Link to="/signup" className="font-headline-sm text-body-md text-on-surface hover:text-secondary font-semibold transition-colors underline-offset-4 hover:underline ml-1">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex -space-x-1.5 items-center">
                <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed shadow-sm">AI</div>
                <div className="w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold text-on-tertiary-fixed shadow-sm">UX</div>
                <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface shadow-sm">+8k</div>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Matching with 8,400+ tech leaders this week
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low/60 py-space-lg shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 CareerSync Technologies Inc. All rights reserved.</p>
          <nav className="flex items-center gap-space-lg">
            <Link to="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Login;
