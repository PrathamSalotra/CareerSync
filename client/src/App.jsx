import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { OtpVerification } from './pages/OtpVerification';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import './App.css';

// Placeholder route wrappers for upcoming phases
const HomePlaceholder = () => <Navigate to="/login" replace />;

const DashboardPlaceholder = () => (
  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-family)' }}>
    <h2>Dashboard</h2>
    <p>Welcome to CareerSync Dashboard.</p>
  </div>
);
const AboutPlaceholder = () => (
  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-family)' }}>
    <h2>CareerSync Help &amp; Support</h2>
    <p>For assistance, contact support@careersync.com</p>
    <a href="/login" style={{ color: 'var(--color-secondary)', textDecoration: 'underline' }}>
      Back to Sign In
    </a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePlaceholder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password/verify" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/about" element={<AboutPlaceholder />} />
          {/* Catch all to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
