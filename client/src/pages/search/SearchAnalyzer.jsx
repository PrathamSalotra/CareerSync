import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import './SearchAnalyzer.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const COUNTRIES = [
  { code: 'us', name: 'US' },
  { code: 'gb', name: 'UK' },
  { code: 'ca', name: 'Can' },
  { code: 'au', name: 'Aus' },
  { code: 'in', name: 'In' },
  { code: 'de', name: 'Ger' },
  { code: 'fr', name: 'Fr' },
];

const WORK_ARRANGEMENTS = [
  { value: '', label: 'Any Arrangement' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' }
];

export const SearchAnalyzer = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResumeDropdownOpen, setIsResumeDropdownOpen] = useState(false);

  // Search State
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('us');
  const [cityOrState, setCityOrState] = useState('');
  const [workArrangement, setWorkArrangement] = useState('');
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || '');
  const [resumes, setResumes] = useState([]);

  // Results State
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await apiClient('/api/resumes');
        if (data && data.resumes) {
          setResumes(data.resumes);
        }
      } catch (err) {
        console.warn('Could not fetch resumes', err);
      }
    };
    fetchResumes();
  }, []);

  useEffect(() => {
    if (searchParams.get('resumeId')) {
      handleSearch({ preventDefault: () => {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query && !resumeId) {
      setError('Please enter a search query or select a resume.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setJobs([]);
    setSelectedJob(null);

    try {
      const payload = {
        country,
      };
      if (query) payload.query = query;
      if (cityOrState) payload.cityOrState = cityOrState;
      if (workArrangement) payload.workArrangement = workArrangement;
      if (resumeId) payload.resumeId = resumeId;

      const data = await apiClient('/api/search', {
        method: 'POST',
        body: payload,
      });

      if (data && data.jobs) {
        setJobs(data.jobs);
        if (data.jobs.length > 0) {
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="cs-search-page">
      <Navbar rightAction={rightAction} />

      <main className="cs-search-main">
        {/* Filter Bar */}
        <section className="cs-search-filter-section">
          <div className="cs-search-filter-container">

            <div className="cs-search-header-group">
              <div className="cs-search-title-box">
                <h1 className="cs-search-title">Discovery Engine</h1>
                <p className="cs-search-subtitle">Live semantic comparison against candidate baseline dossier and real-time enterprise listings.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="cs-search-form">
              <div className="cs-search-input-group">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Role, skills, or title..."
                  className="cs-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="cs-search-input-group cs-search-input-location">
                <span className="material-symbols-outlined">location_on</span>
                <input
                  type="text"
                  placeholder="City or State..."
                  className="cs-search-input"
                  value={cityOrState}
                  onChange={(e) => setCityOrState(e.target.value)}
                />
              </div>



              <div className="cs-search-select-group cs-search-resume-group">
                <span className="material-symbols-outlined">description</span>
                <div className="cs-resume-dropdown-container">
                  <button
                    type="button"
                    className="cs-search-select-btn"
                    onClick={() => setIsResumeDropdownOpen(!isResumeDropdownOpen)}
                  >
                    <span className="cs-search-select-text">
                      {resumeId ? (resumes.find(r => r._id === resumeId || r.id === resumeId)?.originalFilename || 'Unknown Resume') : 'No Resume (Job Only)'}
                    </span>
                    <span className="material-symbols-outlined">expand_more</span>
                  </button>
                  {isResumeDropdownOpen && (
                    <div className="cs-resume-dropdown-menu">
                      <button 
                        type="button" 
                        className={`cs-resume-dropdown-item ${!resumeId ? 'active' : ''}`}
                        onClick={() => { setResumeId(''); setIsResumeDropdownOpen(false); }}
                      >
                        No Resume (Job Only)
                      </button>
                      {resumes.map(r => (
                        <button 
                          type="button" 
                          key={r._id || r.id} 
                          className={`cs-resume-dropdown-item ${resumeId === (r._id || r.id) ? 'active' : ''}`}
                          onClick={() => { setResumeId(r._id || r.id); setIsResumeDropdownOpen(false); }}
                        >
                          {r.originalFilename}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="cs-btn-search"
              >
                {isSearching ? 'Analyzing...' : 'Explore'}
                {!isSearching && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>

            <div className="cs-search-options-row">
              <div className="cs-options-group">
                <span className="cs-options-label">Country:</span>
                <div className="cs-options-buttons">
                  {COUNTRIES.map(c => (
                    <button 
                      key={c.code} 
                      type="button" 
                      className={`cs-option-btn ${country === c.code ? 'active' : ''}`}
                      onClick={() => setCountry(c.code)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="cs-options-group">
                <span className="cs-options-label">Arrangement:</span>
                <div className="cs-options-buttons">
                  {WORK_ARRANGEMENTS.map(w => (
                    <button 
                      key={w.value} 
                      type="button" 
                      className={`cs-option-btn ${workArrangement === w.value ? 'active' : ''}`}
                      onClick={() => setWorkArrangement(w.value)}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="cs-search-error">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Workspace */}
        <div className="cs-search-workspace">
          {jobs.length === 0 && !isSearching && !error ? (
            <div className="cs-search-empty-state">
              <div className="cs-search-empty-icon">
                <span className="material-symbols-outlined">travel_explore</span>
              </div>
              <h3>Start Your Discovery</h3>
              <p>Enter a role and location to find matched opportunities. Select a resume for AI semantic matching and gap analysis.</p>
            </div>
          ) : (
            <div className="cs-search-grid">

              {/* LEFT COLUMN: Matched Opportunities */}
              <div className="cs-search-list-col">
                <div className="cs-search-list-header">
                  <div className="cs-search-list-title">
                    <span>Matched Opportunities</span>
                    {jobs.length > 0 && <span className="cs-badge-verified">{jobs.length} Verified</span>}
                  </div>
                </div>

                {isSearching ? (
                  <div className="cs-search-skeleton-list">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="cs-search-skeleton-card">
                        <div className="cs-search-skeleton-inner"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cs-search-jobs-list">
                    {jobs.map((job) => {
                      const isSelected = selectedJob?.jobId === job.jobId;
                      // Determine tint based on score
                      let tintClass = 'cs-job-tint-low';
                      if (job.matchScore >= 90) tintClass = 'cs-job-tint-high';
                      else if (job.matchScore >= 80) tintClass = 'cs-job-tint-mid';

                      return (
                        <div
                          key={job.jobId}
                          onClick={() => setSelectedJob(job)}
                          className={`cs-job-card ${isSelected ? 'cs-job-card-selected' : ''}`}
                        >
                          {isSelected && <div className="cs-job-card-indicator"></div>}

                          <div className={`cs-job-card-inner ${tintClass}`}>
                            <div className="cs-job-card-top">
                              <span className="cs-job-date">
                                {new Date(job.postedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="cs-job-card-mid">
                              <span className="cs-job-company">{job.company}</span>
                              <h2 className="cs-job-title">{job.title}</h2>
                            </div>
                            <div className="cs-job-tags">
                              {job.workArrangement && <span className="cs-job-tag">{job.workArrangement}</span>}
                            </div>
                          </div>

                          <div className="cs-job-card-bottom">
                            <div className="cs-job-salary-loc">
                              {job.salaryMin && job.salaryMax ? (
                                <div className="cs-job-salary">${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k</div>
                              ) : (
                                <div className="cs-job-salary-empty">Salary Undisclosed</div>
                              )}
                              <div className="cs-job-loc">{job.location}</div>
                            </div>
                            <div className="cs-job-actions">
                              <span className="cs-job-match-badge">{job.matchScore}% Match</span>
                              <button className={`cs-btn-details ${isSelected ? 'cs-btn-selected' : ''}`}>
                                {isSelected ? 'Selected' : 'Details'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Detailed Deep Dive Inspector */}
              <div className="cs-search-detail-col">
                {selectedJob ? (
                  <div className="cs-search-detail-card">
                    <div className="cs-detail-header-top">
                      <span className="cs-detail-label">TARGET ROLE BREAKDOWN</span>
                    </div>

                    <div className="cs-detail-header-main">
                      <div className="cs-detail-title-group">
                        <h2>{selectedJob.title}</h2>
                        <div className="cs-detail-meta">
                          <span className="cs-detail-company">{selectedJob.company}</span>
                          <span>•</span>
                          <span>{selectedJob.location} {selectedJob.workArrangement && `(${selectedJob.workArrangement})`}</span>
                        </div>
                      </div>
                      {selectedJob.redirectUrl && (
                        <a
                          href={selectedJob.redirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="cs-btn-view-original"
                        >
                          View Original
                          <span className="material-symbols-outlined">north_east</span>
                        </a>
                      )}
                    </div>

                    {/* Score Card */}
                    <div className="cs-detail-score-card">
                      <div className="cs-score-gauge-container">
                        <svg className="cs-score-gauge" viewBox="0 0 100 100">
                          <circle className="cs-gauge-bg" cx="50" cy="50" fill="none" r="42" strokeWidth="8"></circle>
                          <circle
                            className="cs-gauge-fg"
                            cx="50" cy="50" fill="none" r="42"
                            strokeDasharray="263.89"
                            strokeDashoffset={263.89 - (263.89 * selectedJob.matchScore) / 100}
                            strokeLinecap="round" strokeWidth="8"
                          ></circle>
                        </svg>
                        <div className="cs-gauge-text">
                          <span className="cs-gauge-value">{selectedJob.matchScore}%</span>
                          <span className="cs-gauge-label">FIT SCORE</span>
                        </div>
                      </div>

                      <div className="cs-score-info">
                        <div className="cs-score-title">
                          <span className="material-symbols-outlined">auto_awesome</span>
                          <span>Analysis for {user?.name?.split(' ')[0]}</span>
                        </div>
                        <p className="cs-score-desc">
                          {selectedJob.fitExplanation || 'Semantic match analysis processed successfully based on query relevance and available resume profile.'}
                        </p>
                      </div>
                    </div>

                    {/* Why It Fits (Evidence) */}
                    {selectedJob.evidence && selectedJob.evidence.length > 0 && (
                      <div className="cs-detail-section">
                        <div className="cs-detail-section-title">
                          <span>WHY IT FITS (KEY STRENGTHS)</span>
                          <span className="cs-dot-green"></span>
                        </div>
                        <div className="cs-evidence-list">
                          {selectedJob.evidence.map((ev, idx) => (
                            <div key={idx} className="cs-evidence-item">
                              <div className="cs-evidence-icon">
                                <span className="material-symbols-outlined">check</span>
                              </div>
                              <p><strong className="cs-evidence-bold">{ev.resumeSection ? `${ev.resumeSection}: ` : 'Match point: '}</strong>{typeof ev === 'object' ? ev.detail : ev}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gaps */}
                    {selectedJob.gaps && selectedJob.gaps.skillGaps && selectedJob.gaps.skillGaps.length > 0 && (
                      <div className="cs-detail-section">
                        <div className="cs-detail-section-title">
                          <span>WHAT'S MISSING (SKILL GAPS)</span>
                          <span className="cs-dot-red"></span>
                        </div>
                        <div className="cs-gap-list">
                          {selectedJob.gaps.skillGaps.map((gap, idx) => (
                            <div key={idx} className="cs-gap-item">
                              <div className="cs-gap-icon">
                                <span className="material-symbols-outlined">info</span>
                              </div>
                              <div className="cs-gap-content">
                                <p><strong className="cs-gap-bold">{gap.skill}:</strong> {gap.suggestion || 'Missing or implicitly referenced.'}</p>
                                {gap.resourceUrl && (
                                  <div className="cs-gap-resource">
                                    <span>Suggested Resource:</span>
                                    <a href={gap.resourceUrl} target="_blank" rel="noreferrer">View Course</a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience Gaps */}
                    {selectedJob.gaps && selectedJob.gaps.experienceGaps && selectedJob.gaps.experienceGaps.length > 0 && (
                      <div className="cs-detail-section">
                        <div className="cs-detail-section-title">
                          <span>WHAT'S MISSING (EXPERIENCE GAPS)</span>
                          <span className="cs-dot-red"></span>
                        </div>
                        <div className="cs-gap-list">
                          {selectedJob.gaps.experienceGaps.map((gap, idx) => (
                            <div key={idx} className="cs-gap-item">
                              <div className="cs-gap-icon">
                                <span className="material-symbols-outlined">timeline</span>
                              </div>
                              <div className="cs-gap-content">
                                <p><strong className="cs-gap-bold">Experience Gap:</strong> {gap.description}</p>
                                {gap.suggestion && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{gap.suggestion}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  !isSearching && jobs.length > 0 && (
                    <div className="cs-detail-empty">
                      <span>Select an opportunity to view deep dive analysis.</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
