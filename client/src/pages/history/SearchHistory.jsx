import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import './SearchHistory.css';
import { Link, useNavigate } from 'react-router-dom';

export const SearchHistory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [historyList, setHistoryList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [selectedSearchDetails, setSelectedSearchDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/api/search/history');
      // Grouping can be done in render
      setHistoryList(data);
      setFilteredList(data);
    } catch (err) {
      setError(err.message || 'Failed to load search history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  
  useEffect(() => {
    if (!searchQuery) {
      setFilteredList(historyList);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = historyList.filter(item => 
      (item.query || '').toLowerCase().includes(q) ||
      (item.cityOrState || '').toLowerCase().includes(q) ||
      (item.country || '').toLowerCase().includes(q)
    );
    setFilteredList(filtered);
  }, [searchQuery, historyList]);

  const handleSelectHistory = async (id) => {
    setSelectedSearch(id);
    setIsLoadingDetails(true);
    setSelectedSearchDetails(null);
    try {
      const data = await apiClient(`/api/search/${id}`);
      setSelectedSearchDetails(data);
    } catch (err) {
      console.error('Failed to fetch search details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleReopen = (e, item) => {
    e.stopPropagation();
    // Navigate to Search Analyzer with context
    navigate('/search', { state: { historyId: item._id }, viewTransition: true });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this search history?')) return;
    try {
      await apiClient(`/api/search/${id}`, { method: 'DELETE' });
      const newList = historyList.filter(h => h._id !== id);
      setHistoryList(newList);
      
      if (!searchQuery) {
        setFilteredList(newList);
      } else {
        const q = searchQuery.toLowerCase();
        setFilteredList(newList.filter(item => 
          (item.query || '').toLowerCase().includes(q) ||
          (item.cityOrState || '').toLowerCase().includes(q) ||
          (item.country || '').toLowerCase().includes(q)
        ));
      }

      if (selectedSearch === id) {
        setSelectedSearch(null);
        setSelectedSearchDetails(null);
      }
    } catch (err) {
      console.error('Failed to delete search history:', err);
      alert(err.message || 'Failed to delete search history');
    }
  };

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

  // Group history by date
  const groupedHistory = filteredList.reduce((acc, item) => {
    const date = new Date(item.searchedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let key = 'Older';
    if (date.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else if (date > new Date(today.setDate(today.getDate() - 7))) {
      key = 'Last Week';
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="cs-history-page">
      <Navbar rightAction={rightAction} />
      
      <main className="cs-history-main">
        <div className="cs-history-container">
          
          <div className="cs-history-header-group">
            <div>
              <h1 className="cs-history-title">Search History</h1>
              <p className="cs-history-subtitle">Review and reopen your previous AI-powered match searches.</p>
            </div>
            
            <div className="cs-history-search-bar">
              <div className="cs-search-input-wrapper">
                <span className="material-symbols-outlined">search</span>
                <input 
                  type="text" 
                  placeholder="Filter past queries, locations..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cs-search-input"
                />
              </div>
              <button className="cs-btn-filter" onClick={() => setSearchQuery('')}>
                <span className="material-symbols-outlined">clear</span>
                Clear
              </button>
            </div>
          </div>

          <div className="cs-history-grid">
            <div className="cs-history-list-col">
              {isLoading ? (
                <div className="cs-history-loading">Loading search history...</div>
              ) : error ? (
                <div className="cs-history-error">{error}</div>
              ) : filteredList.length === 0 ? (
                <div className="cs-history-empty">No search history found.</div>
              ) : (
                ['Today', 'Yesterday', 'Last Week', 'Older'].map(groupKey => {
                  if (!groupedHistory[groupKey]) return null;
                  return (
                    <div key={groupKey} className="cs-history-group">
                      <div className="cs-history-group-header">
                        <div className="cs-group-title-box">
                          <h2>{groupKey}</h2>
                          <span className="cs-group-count">{groupedHistory[groupKey].length} searches</span>
                        </div>
                      </div>
                      
                      <div className="cs-history-cards">
                        {groupedHistory[groupKey].map(item => (
                          <div 
                            key={item._id} 
                            className={`cs-query-card ${selectedSearch === item._id ? 'selected' : ''}`}
                            onClick={() => handleSelectHistory(item._id)}
                          >
                            <div className="cs-query-card-content">
                              <div className="cs-query-info">
                                <div className="cs-query-icon">
                                  <span className="material-symbols-outlined">architecture</span>
                                </div>
                                <div className="cs-query-details">
                                  <div className="cs-query-title-row">
                                    <span className="cs-query-title">{item.query || 'Global Search'}</span>
                                    {item.cityOrState && (
                                      <>
                                        <span className="cs-dot">•</span>
                                        <span className="cs-query-location">{item.cityOrState}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="cs-query-meta">
                                    <span className="material-symbols-outlined">schedule</span>
                                    <span>{new Date(item.searchedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="cs-dot">•</span>
                                    <span>{item.country?.toUpperCase() || 'US'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="cs-query-actions">
                                <button className="cs-btn-reopen" onClick={(e) => handleReopen(e, item)}>
                                  Reopen
                                </button>
                                <button className="cs-btn-delete-history" onClick={(e) => handleDelete(e, item._id)} title="Delete search">
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <aside className="cs-history-sidebar">
              {!selectedSearch ? (
                <div className="cs-sidebar-default">
                  <div className="cs-sidebar-header">
                    <h3>Telemetry & Match Index</h3>
                    <span className="material-symbols-outlined">monitoring</span>
                  </div>
                  <p className="cs-sidebar-desc">
                    Select a search history item to view its detailed job results here, or reopen it to perform a fresh search.
                  </p>
                  
                  <div className="cs-telemetry-card">
                    <div className="cs-telemetry-row">
                      <span>Total Searches</span>
                      <strong>{historyList.length}</strong>
                    </div>
                  </div>
                </div>
              ) : isLoadingDetails ? (
                <div className="cs-sidebar-loading">
                  <span className="material-symbols-outlined spin">refresh</span>
                  Loading job results...
                </div>
              ) : selectedSearchDetails ? (
                <div className="cs-sidebar-results">
                  <div className="cs-sidebar-header">
                    <h3>Job Results</h3>
                    <span className="cs-results-count">{selectedSearchDetails.results?.length || 0} found</span>
                  </div>
                  
                  <div className="cs-sidebar-jobs">
                    {selectedSearchDetails.results?.slice(0, 10).map((job, idx) => (
                      <div key={idx} className="cs-sidebar-job-card">
                        <div className="cs-job-title-row">
                          <h4 className="cs-job-title">{job.title}</h4>
                          {job.matchScore && (
                            <span className="cs-job-score">{job.matchScore}%</span>
                          )}
                        </div>
                        <p className="cs-job-company">{job.company}</p>
                        <div className="cs-job-meta">
                          {job.location && <span>{job.location}</span>}
                          {job.salaryMin && job.salaryMax && (
                            <>
                              <span className="cs-dot">•</span>
                              <span>${(job.salaryMin/1000).toFixed(0)}k - ${(job.salaryMax/1000).toFixed(0)}k</span>
                            </>
                          )}
                        </div>
                        <a href={job.redirectUrl} target="_blank" rel="noopener noreferrer" className="cs-job-link">
                          View Job <span className="material-symbols-outlined">open_in_new</span>
                        </a>
                      </div>
                    ))}
                    {selectedSearchDetails.results?.length > 10 && (
                      <button className="cs-btn-view-all" onClick={() => handleReopen({ preventDefault: () => {} }, { _id: selectedSearch })}>
                        Reopen to see all results
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="cs-sidebar-error">
                  Failed to load details for this search.
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
