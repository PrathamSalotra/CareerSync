import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="cs-footer">
      <div className="cs-footer-container">
        <p className="cs-footer-copyright">
          &copy; {new Date().getFullYear()} CareerSync Technologies Inc. All rights reserved.
        </p>
        <nav className="cs-footer-nav" aria-label="Legal Links">
          <Link to="/about" className="cs-footer-link">
            Privacy Policy
          </Link>
          <Link to="/about" className="cs-footer-link">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
};
