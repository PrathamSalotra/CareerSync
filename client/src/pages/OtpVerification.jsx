import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(299);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleInput = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6).split('');
    
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    // In a real app, you would call POST /api/auth/forgot-password again
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    setTimeLeft(299);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      // Pass the code to the next page
      navigate('/reset-password', { state: { otp: code, email } });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
          <div className="absolute -top-24 w-96 h-96 bg-secondary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute -bottom-20 w-80 h-80 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] p-8 sm:p-12 relative overflow-hidden transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">
                Enter 6-Digit Code
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                We sent a single-use verification code to <span className="font-semibold text-on-surface">{email}</span> to confirm your password recovery request.
              </p>
              
              <form onSubmit={handleSubmit} className="w-full mt-8 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
                  {[0, 1, 2].map((i) => (
                    <input 
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      value={otp[i]}
                      onChange={e => handleInput(e, i)}
                      onKeyDown={e => handleKeyDown(e, i)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className="otp-digit w-12 h-14 sm:w-14 sm:h-16 text-center font-display-hero text-headline-lg rounded-DEFAULT bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#000000] outline-none transition-all caret-primary"
                      inputMode="numeric"
                      maxLength="1"
                      pattern="[0-9]*"
                      required
                      type="text"
                    />
                  ))}
                  <span className="text-outline-variant font-headline-sm px-0.5 select-none">-</span>
                  {[3, 4, 5].map((i) => (
                    <input 
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      value={otp[i]}
                      onChange={e => handleInput(e, i)}
                      onKeyDown={e => handleKeyDown(e, i)}
                      className="otp-digit w-12 h-14 sm:w-14 sm:h-16 text-center font-display-hero text-headline-lg rounded-DEFAULT bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_#000000] outline-none transition-all caret-primary"
                      inputMode="numeric"
                      maxLength="1"
                      pattern="[0-9]*"
                      required
                      type="text"
                    />
                  ))}
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between w-full px-2 gap-2 text-center">
                  <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>Expires in:</span>
                    <span className="font-numeric-stat text-body-sm text-on-surface font-semibold tracking-wider">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={timeLeft > 0}
                    className={`font-label-md text-label-md transition-colors ${timeLeft > 0 ? 'text-outline opacity-40 cursor-not-allowed' : 'text-primary font-semibold hover:text-on-surface'}`}
                  >
                    Didn't receive code? <span className="underline underline-offset-4 decoration-outline-variant">Resend</span>
                  </button>
                </div>
                
                <button 
                  type="submit"
                  disabled={otp.join('').length !== 6}
                  className="w-full mt-8 h-12 bg-primary hover:bg-primary-container text-on-primary rounded-full font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-all duration-200 active:scale-[0.99] group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Verify Code & Continue</span>
                  <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
                </button>
              </form>

              <div className="mt-8 pt-6 w-full flex flex-col items-center gap-4">
                <Link to="/login" className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-1 px-3 rounded-full hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Back to login</span>
                </Link>
              </div>
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

export default OtpVerification;
