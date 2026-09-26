import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service to register.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      await apiClient('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password }
      });
      setStatus('success');
      // Adding a tiny delay to show the success animation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setStatus('error');
      setErrorMsg(error.response?.data?.error?.message || error.message || 'An error occurred during registration. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Simple password strength calculator for the visual bar
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/) ? 3 : 2;

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
          <div className="absolute -top-16 -left-12 w-96 h-96 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute -bottom-20 -right-16 w-96 h-96 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="w-full max-w-[560px] bg-surface-container-lowest rounded-xl shadow-xl p-8 sm:p-10 relative">
            <div className="flex flex-col items-center text-center mb-8">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Create your Account</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
                Start exploring high-affinity AI matched roles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button type="button" className="group flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-surface-container-low hover:bg-surface-container transition-all duration-200">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" fill="#4285F4"></path>
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z" fill="#34A853"></path>
                  <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" fill="#FBBC05"></path>
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" fill="#EA4335"></path>
                </svg>
                <span className="font-label-md text-label-md text-on-surface group-hover:text-primary">Google</span>
              </button>
              <button type="button" className="group flex items-center justify-center gap-2.5 py-3 px-4 rounded-full bg-surface-container-low hover:bg-surface-container transition-all duration-200">
                <svg className="w-4 h-4 flex-shrink-0 fill-current text-on-surface" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2Z" fillRule="evenodd"></path>
                </svg>
                <span className="font-label-md text-label-md text-on-surface group-hover:text-primary">GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-6">
              <div className="w-full h-px bg-surface-container-high"></div>
              <span className="absolute bg-surface-container-lowest px-3 font-body-sm text-body-sm text-on-surface-variant">
                Or register with email
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              {errorMsg && (
                <div className="bg-error-container text-on-error-container text-body-sm p-3 rounded-md text-center">
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="reg-name" className="block font-label-md text-label-md text-on-surface mb-1.5">Full Name</label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-4 text-outline group-focus-within:text-secondary pointer-events-none text-[20px] transition-colors">person</span>
                  <input
                    type="text"
                    id="reg-name"
                    placeholder="Alex Rivera"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-low pl-11 pr-4 py-3 rounded-full text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(0,99,152,0.35)] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block font-label-md text-label-md text-on-surface mb-1.5">Work Email</label>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-4 text-outline group-focus-within:text-secondary pointer-events-none text-[20px] transition-colors">mail</span>
                  <input
                    type="email"
                    id="reg-email"
                    placeholder="alex@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low pl-11 pr-4 py-3 rounded-full text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(0,99,152,0.35)] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reg-pass" className="font-label-md text-label-md text-on-surface">Password</label>
                  <span className="font-label-sm text-label-sm text-secondary" id="strength-label">
                    {strength === 0 ? '' : strength === 1 ? 'Weak' : strength === 2 ? 'Good' : 'Strong'}
                  </span>
                </div>
                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-4 text-outline group-focus-within:text-secondary pointer-events-none text-[20px] transition-colors">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-pass"
                    placeholder="user@123"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low pl-11 pr-11 py-3 rounded-full text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(0,99,152,0.35)] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label="Toggle password visibility"
                    className="absolute right-4 text-outline hover:text-on-surface transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full w-1/3 rounded-full transition-all duration-300 ${strength >= 1 ? 'bg-secondary' : 'bg-transparent'}`}></div>
                    <div className={`h-full w-1/3 rounded-full transition-all duration-300 ${strength >= 2 ? 'bg-secondary' : 'bg-transparent'}`}></div>
                    <div className={`h-full w-1/3 rounded-full transition-all duration-300 ${strength >= 3 ? 'bg-secondary' : 'bg-transparent'}`}></div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[15px] ${strength >= 3 ? 'text-secondary' : 'text-outline-variant'}`}>check_circle</span>
                    8+ characters with mixed case, numbers &amp; symbols
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer flex-shrink-0"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed select-none">
                    I agree to the <Link to="/terms" className="text-on-surface underline hover:text-primary transition-colors font-semibold">Terms of Service</Link> and acknowledge the <Link to="/privacy" className="text-on-surface underline hover:text-primary transition-colors font-semibold">Privacy Policy</Link>.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full py-3.5 px-6 rounded-full font-headline-sm text-headline-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 group
                    ${status === 'success' ? 'bg-secondary text-white' : 'bg-primary text-on-primary hover:bg-on-surface-variant hover:shadow-lg'}
                    ${status === 'loading' ? 'opacity-80' : ''}
                  `}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin mr-2"></span>
                      <span>Creating Account...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] mr-1.5">check_circle</span>
                      <span>Account Created</span>
                    </>
                  ) : (
                    <>
                      <span>Create CareerSync Account</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-6 pt-5 border-t border-surface-container">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Already have an account?
                <Link to="/login" className="text-on-surface font-semibold hover:text-primary transition-colors inline-flex items-center gap-0.5 ml-1">
                  Sign in
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </p>
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

export default Signup;
