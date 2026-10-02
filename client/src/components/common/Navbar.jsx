import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = ({ rightAction }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  return (
    <header className="cs-navbar">
      <div className="cs-navbar-container">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="cs-brand" aria-label="CareerSync Home">
          <span className="cs-brand-text">CareerSync</span>
        </Link>
        {isAuthenticated && !isAuthPage && (
          <nav className="cs-nav-center">
            <Link to="/dashboard" viewTransition className={`cs-nav-center-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link to="/resumes" viewTransition className={`cs-nav-center-link ${location.pathname === '/resumes' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">description</span>
              Resumes
            </Link>
            <Link to="/search" viewTransition className={`cs-nav-center-link ${location.pathname === '/search' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">search</span>
              Search
            </Link>
            <Link to="/history" viewTransition className={`cs-nav-center-link ${location.pathname === '/history' ? 'active' : ''}`}>
              <span className="material-symbols-outlined">history</span>
              History
            </Link>
          </nav>
        )}
        <nav className="cs-nav-links">
          {rightAction ? (
            rightAction
          ) : (
            <Link to="/about" className="cs-nav-link">
              Help &amp; Support
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
