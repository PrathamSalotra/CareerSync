import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = ({ rightAction }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/login', '/signup', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };
  
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
          {isAuthenticated && !isAuthPage ? (
            <div className="cs-account-dropdown" ref={dropdownRef}>
              <button
                className="cs-account-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
              >
                <div className="cs-avatar">
                  {getInitials(user?.name)}
                </div>
                <span className="cs-user-name">{user?.name || 'User'}</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>

              <div className={`cs-dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                <div className="cs-dropdown-header">
                  <p className="cs-dropdown-name">{user?.name}</p>
                  <p className="cs-dropdown-email">{user?.email}</p>
                </div>
                <div className="cs-dropdown-divider"></div>
                <Link to="/forgot-password" className="cs-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <span className="material-symbols-outlined">lock_reset</span>
                  Change Password
                </Link>
                <button onClick={handleLogout} className="cs-dropdown-item cs-text-error">
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            rightAction || (
              <Link to="/about" className="cs-nav-link">
                Help &amp; Support
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
};
