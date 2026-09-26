import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';

import SearchAnalyzer from './pages/SearchAnalyzer';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerification from './pages/OtpVerification';
import ResetPassword from './pages/ResetPassword';
import History from './pages/History';
import { UserProvider } from './contexts/UserContext';

// Placeholder Components
const Home = () => <div><h1>Home</h1><p>Welcome to CareerSync</p><Link to="/login">Login</Link></div>;
const SearchResults = () => <div><h1>Search Results</h1></div>;
const About = () => <div><h1>About</h1></div>;

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes placeholder */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/search-analyzer" element={<SearchAnalyzer />} />
        <Route path="/results/:searchId" element={<SearchResults />} />
        <Route path="/history" element={<History />} />
        
        <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
