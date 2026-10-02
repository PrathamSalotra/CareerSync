import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient('/api/search/history');
        setRecentSearches(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load recent searches');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
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
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const rightAction = (
    <div className="cs-account-dropdown">
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

      {isDropdownOpen && (
        <div className="cs-dropdown-menu">
          <div className="cs-dropdown-header">
            <p className="cs-dropdown-name">{user?.name}</p>
            <p className="cs-dropdown-email">{user?.email}</p>
          </div>
          <div className="cs-dropdown-divider"></div>
          <Link to="/forgot-password" className="cs-dropdown-item">
            <span className="material-symbols-outlined">lock_reset</span>
            Change Password
          </Link>
          <button onClick={handleLogout} className="cs-dropdown-item cs-text-error">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="cs-dashboard-page">
      <Navbar rightAction={rightAction} />

      <main className="cs-dashboard-main">
        <div className="cs-dashboard-container">
          
          <div className="cs-welcome-header">
            <h1 className="cs-greeting">Hello, {user?.name?.split(' ')[0] || 'User'}</h1>
            <p className="cs-subtitle">Welcome back! Ready to find your next career step?</p>
          </div>

          <div className="cs-action-bento">
            {/* Card 1: Upload Resume */}
            <div className="cs-bento-card cs-card-resume">
              <div className="cs-card-bg-glow"></div>
              <div className="cs-card-content">
                <div className="cs-card-top">
                  <div className="cs-icon-box">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="cs-badge">
                    <span className="cs-dot"></span>
                    <span>PDF, DOCX ready</span>
                  </div>
                </div>
                
                <div className="cs-card-text">
                  <span className="cs-label">AI Skill Ingestion</span>
                  <h2>Upload &amp; Parse Resume</h2>
                  <p>Sync your latest PDF resume to update parsed skills and AI match algorithms across 1,200+ partner talent graphs.</p>
                </div>
              </div>
              
              <div className="cs-card-footer">
                <button className="cs-btn-primary" onClick={() => navigate('/resumes', { viewTransition: true })}>Upload Resume</button>
                <div className="cs-security-note">
                  <span className="material-symbols-outlined">verified_user</span>
                  Encrypted &amp; Private
                </div>
              </div>
            </div>

            {/* Card 2: Launch Search */}
            <div className="cs-bento-card cs-card-search">
              <div className="cs-card-bg-glow cs-glow-warm"></div>
              <div className="cs-card-content">
                <div className="cs-card-top">
                  <div className="cs-icon-box cs-box-warm">
                    <span className="material-symbols-outlined">travel_explore</span>
                  </div>
                  <div className="cs-badge">
                    <span className="cs-dot cs-dot-dark"></span>
                    <span>500+ Top Tech Cos</span>
                  </div>
                </div>
                
                <div className="cs-card-text">
                  <span className="cs-label cs-label-warm">Discovery Engine</span>
                  <h2>Launch New Job Search</h2>
                  <p>Explore live openings across leading product-driven tech companies matched directly to your verified career trajectory.</p>
                </div>
              </div>
              
              <div className="cs-card-footer">
                <button className="cs-btn-primary" onClick={() => navigate('/search', { viewTransition: true })}>Start Search</button>
                <div className="cs-avatars-overlap">
                  <div className="cs-avatar-mini" style={{backgroundColor: '#cde5ff', color: '#001d32'}}>G</div>
                  <div className="cs-avatar-mini" style={{backgroundColor: '#f7decd', color: '#25190f'}}>A</div>
                  <div className="cs-avatar-mini" style={{backgroundColor: '#e7e8ea', color: '#191c1e'}}>+80</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cs-recent-section">
            <div className="cs-recent-header">
              <div className="cs-recent-title-group">
                <h2>Recent Searches</h2>
                <span className="cs-active-badge">{recentSearches.length} Active Queries</span>
              </div>
              <Link to="/history" viewTransition className="cs-view-all">
                View all history
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {isLoading ? (
              <div className="cs-loading-state">Loading recent searches...</div>
            ) : error ? (
              <div className="cs-error-state">{error}</div>
            ) : recentSearches.length === 0 ? (
              <div className="cs-empty-state">No recent searches found.</div>
            ) : (
              <div className="cs-recent-grid">
                {recentSearches.slice(0, 3).map((search, idx) => {
                  const date = new Date(search.searchedAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric'
                  });
                  
                  // Rotate colors based on index
                  const colorThemes = ['cs-theme-mint', 'cs-theme-blue', 'cs-theme-peach'];
                  const theme = colorThemes[idx % colorThemes.length];
                  
                  return (
                    <div key={search._id} className="cs-query-card">
                      <div className={`cs-query-inner ${theme}`}>
                        <div className="cs-query-top">
                          <span className="cs-query-date">{date}</span>
                          <button className="cs-btn-bookmark">
                            <span className="material-symbols-outlined">bookmark</span>
                          </button>
                        </div>
                        
                        <div className="cs-query-mid">
                          <div className="cs-query-meta">
                            <span>{search.cityOrState || 'Anywhere'} • {search.workArrangement || 'Any'}</span>
                            <div className="cs-company-initial">
                              {search.query ? search.query[0].toUpperCase() : 'R'}
                            </div>
                          </div>
                          <h3>{search.query || 'Resume Match'}</h3>
                        </div>
                        
                        <div className="cs-query-tags">
                          <span className="cs-tag">{search.country.toUpperCase()}</span>
                          <span className="cs-tag">{search.searchMode}</span>
                        </div>
                      </div>
                      
                      <div className="cs-query-footer">
                        <div className="cs-match-stats">
                          <div className="cs-match-row">
                            <span className="cs-dot cs-dot-blue"></span>
                            <strong>Active</strong>
                          </div>
                          <span className="cs-roles-found">Click details to view</span>
                        </div>
                        <button className="cs-btn-details" onClick={() => navigate('/history', { viewTransition: true })}>Details</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
