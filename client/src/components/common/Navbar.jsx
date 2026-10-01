import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = ({ rightAction }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  return (
    <header className="cs-navbar">
      <div className="cs-navbar-container">
        <Link to="/" className="cs-brand" aria-label="CareerSync Home">
          <span className="cs-brand-text">CareerSync</span>
        </Link>
        {isAuthenticated && (
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
