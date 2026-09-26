import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = ({ rightAction }) => {
  return (
    <header className="cs-navbar">
      <div className="cs-navbar-container">
        <Link to="/" className="cs-brand" aria-label="CareerSync Home">
          <span className="cs-brand-text">CareerSync</span>
        </Link>
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
