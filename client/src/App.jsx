import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { OtpVerification } from './pages/auth/OtpVerification';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Dashboard } from './pages/dashboard';
import { SearchAnalyzer } from './pages/search';
import { ResumeManager } from './pages/resumes';
import { SearchHistory } from './pages/history';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import './App.css';

// Placeholder route wrappers for upcoming phases
const HomePlaceholder = () => <Navigate to="/login" replace />;


const AboutPlaceholder = () => (
  <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-family)' }}>
    <h2>CareerSync Help &amp; Support</h2>
    <p>For assistance, contact support@careersync.com</p>
    <a href="/login" style={{ color: 'var(--color-secondary)', textDecoration: 'underline' }}>
      Back to Sign In
    </a>
  </div>
);

const router = createBrowserRouter([
  { path: '/', element: <HomePlaceholder /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Register /> },
  { path: '/register', element: <Register /> },
  { path: '/verify-otp', element: <OtpVerification /> },
  { path: '/otp-verification', element: <OtpVerification /> },
  { path: '/forgot-password/verify', element: <OtpVerification /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/resumes', element: <ProtectedRoute><ResumeManager /></ProtectedRoute> },
  { path: '/search', element: <ProtectedRoute><SearchAnalyzer /></ProtectedRoute> },
  { path: '/history', element: <ProtectedRoute><SearchHistory /></ProtectedRoute> },
  { path: '/about', element: <AboutPlaceholder /> },
  { path: '*', element: <Navigate to="/login" replace /> }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
