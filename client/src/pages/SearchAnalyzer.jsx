import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useUser } from '../contexts/UserContext';

const SearchAnalyzer = () => {
  const navigate = useNavigate();
  const { user, loadingUser } = useUser();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search Form State
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('us');
  const [cityOrState, setCityOrState] = useState('');
  const [workArrangement, setWorkArrangement] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Results State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumesRes = await apiClient('/api/resumes');
        setResumes(resumesRes.resumes);
      } catch (err) {
        if (err.status === 401) {
          navigate('/login');
        } else {
          console.error('Failed to load profile:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) {
      setSearchError('Please enter a role, skill, or title.');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSelectedJobId(null);

    // Grab the latest resume
    const activeResume = resumes.length > 0 ? resumes[0] : null;

    try {
      const payload = {
        query,
        country,
        ...(cityOrState && { cityOrState }),
        ...(workArrangement && { workArrangement }),
        ...(activeResume && { resumeId: activeResume.id || activeResume._id })
      };

      const response = await apiClient('/api/search', {
        method: 'POST',
        body: payload
      });

      setJobs(response.jobs || []);
      if (response.jobs && response.jobs.length > 0) {
        setSelectedJobId(response.jobs[0].id || response.jobs[0].jobId || response.jobs[0]._id);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(err.message || 'Failed to perform search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectedJob = jobs.find(j => (j.id || j.jobId || j._id) === selectedJobId);
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary-container shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)]">
        <div className="h-44 max-w-7xl mx-auto px-margin flex flex-col justify-between py-space-sm">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-space-md">
              <span className="font-headline-sm text-headline-sm text-on-primary tracking-tight">CareerSync</span>
            </div>
            <nav className="hidden lg:flex items-center gap-space-sm bg-inverse-surface/50 p-space-xs rounded-full">
              <Link to="/dashboard" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                Dashboard
              </Link>
              <Link to="/resumes" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                Resumes
              </Link>
              <Link to="/search-analyzer" aria-current="page" className="transition-colors bg-surface-container-lowest text-on-surface shadow-sm rounded-full font-label-md text-label-md px-space-md py-space-xs">
                Search Analyzer
              </Link>
              <Link to="/history" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                History
              </Link>
            </nav>
            <div className="flex items-center gap-space-md">
              <button className="relative p-space-xs text-outline-variant hover:text-on-primary transition-colors flex items-center justify-center"></button>
              <div className="flex items-center gap-space-sm pl-space-xs">
                <div className="hidden md:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-on-primary leading-tight">{user ? user.name : '\u00A0'}</span>
                  <span className="font-label-sm text-label-sm text-outline-variant leading-tight">{user ? user.email : '\u00A0'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pb-space-sm pt-space-xs">
            <form onSubmit={handleSearch} className="bg-inverse-surface rounded-2xl p-space-xs flex flex-wrap lg:flex-nowrap items-center gap-space-sm shadow-inner">
              <div className="flex-1 min-w-[200px] flex items-center gap-space-sm px-space-md py-space-xs bg-primary-container/80 rounded-xl text-on-primary">
                <span className="material-symbols-outlined text-outline-variant">search</span>
                <input 
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Role, skills, or title..."
                  className="bg-transparent border-none outline-none w-full text-body-sm font-body-sm text-on-primary placeholder:text-outline-variant focus:ring-0"
                />
              </div>
              <div className="flex-1 min-w-[160px] flex items-center justify-between px-space-md py-space-xs bg-primary-container/80 rounded-xl text-on-primary">
                <div className="flex items-center gap-space-sm w-full">
                  <span className="material-symbols-outlined text-outline-variant">location_on</span>
                  <input 
                    type="text"
                    value={cityOrState}
                    onChange={e => setCityOrState(e.target.value)}
                    placeholder="City or State (optional)"
                    className="bg-transparent border-none outline-none w-full text-body-sm font-body-sm text-on-primary placeholder:text-outline-variant focus:ring-0"
                  />
                </div>
              </div>
              <div className="flex-none min-w-[120px] flex items-center px-space-md py-space-xs bg-primary-container/80 rounded-xl text-on-primary">
                <select 
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-body-sm font-body-sm text-on-primary focus:ring-0 appearance-none cursor-pointer"
                >
                  <option value="us" className="text-on-surface">United States</option>
                  <option value="gb" className="text-on-surface">United Kingdom</option>
                  <option value="ca" className="text-on-surface">Canada</option>
                  <option value="au" className="text-on-surface">Australia</option>
                  <option value="in" className="text-on-surface">India</option>
                </select>
                <span className="material-symbols-outlined text-outline-variant text-body-sm font-body-sm ml-2">expand_more</span>
              </div>
              <button 
                type="submit"
                disabled={searching}
                className={`h-10 px-space-xl bg-secondary-container hover:bg-secondary-fixed text-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-space-xs transition-colors ${searching ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {searching ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-headline-sm font-headline-sm">tune</span>
                    <span>Explore</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="w-full pt-44 bg-background flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {searchError && (
              <div className="max-w-7xl mx-auto px-margin pt-space-lg w-full">
                <div className="bg-error-container text-on-error-container p-space-md rounded-xl font-body-md text-body-md shadow-sm">
                  {searchError}
                </div>
              </div>
            )}

            {!searching && jobs.length === 0 && !searchError && (
              <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col items-center justify-center h-[50vh]">
                <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center text-outline mb-space-md shadow-inner">
                  <span className="material-symbols-outlined text-display-hero">search_insights</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">Ready to analyze your next role</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md text-center">
                  Enter a role, skill, or title above to search across 140+ boards and analyze matches against your active resume.
                </p>
              </div>
            )}

            {searching && (
              <div className="max-w-7xl mx-auto px-margin py-space-xl w-full flex flex-col items-center justify-center h-[50vh]">
                <div className="w-16 h-16 rounded-full border-4 border-secondary border-t-transparent animate-spin mb-space-md"></div>
                <h2 className="font-headline-md text-headline-md text-on-surface animate-pulse">Running semantic analysis & scoring...</h2>
                <p className="font-body-md text-body-md text-outline mt-2">This may take up to 30 seconds</p>
              </div>
            )}

            {!searching && jobs.length > 0 && (
              <>
                {/* Query Telemetry Context & Filter Bar */}
                <section className="w-full bg-surface-container-low/70 backdrop-blur-sm">
                  <div className="max-w-7xl mx-auto px-margin py-space-lg flex flex-col gap-space-md">
                    {/* Main Query Title & Analysis Tag */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                      <div className="space-y-space-xs">
                        <div className="flex items-center gap-space-sm">
                          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Search: {query} {cityOrState && `in ${cityOrState}`}</h1>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">Live semantic comparison against candidate baseline dossier and real-time enterprise listings.</p>
                      </div>
                      {/* Pill Metas */}
                      <div className="flex flex-wrap items-center gap-space-xs">
                        <span className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm">
                          {jobs.length} Results
                        </span>
                        {resumes.length > 0 && (
                          <span className="px-space-md py-space-xs rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant font-label-md text-label-md shadow-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-label-sm">psychology</span> AI Scored
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2-Column Split Workspace */}
                <div className="max-w-7xl mx-auto px-margin py-space-xl w-full">
                  <div className="grid grid-cols-12 gap-gutter items-start">
                    
                    {/* LEFT COLUMN: Matched Opportunities */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-space-md">
                      <div className="flex items-center justify-between px-space-xs">
                        <div className="flex items-center gap-space-sm">
                          <span className="font-headline-md text-headline-md text-on-surface">Matched Opportunities</span>
                          <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">{jobs.length} Found</span>
                        </div>
                        <button className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md py-space-xs px-space-sm rounded-lg hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-body-md">sort</span>
                          <span>Sort: Match Score</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-space-md overflow-y-auto max-h-[800px] pr-2 scrollbar-thin">
                        {jobs.map((job, idx) => {
                          const jId = job.id || job.jobId || job._id;
                          const isSelected = selectedJobId === jId;
                          
                          // Format salary
                          const salary = (job.salary_min && job.salary_max) 
                            ? `$${Math.round(job.salary_max / 1000)}k/yr`
                            : job.salary_max ? `$${Math.round(job.salary_max / 1000)}k/yr` : 'Salary Unlisted';
                          
                          // Format date
                          const postedDate = job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : 'RECENT';

                          // Alternate tint colors just like the template
                          const tints = ['bg-tertiary-fixed/30', 'bg-secondary-fixed/30', 'bg-surface-container-high/60'];
                          const tintClass = tints[idx % 3];
                          
                          return (
                            <div 
                              key={jId} 
                              onClick={() => setSelectedJobId(jId)}
                              className={`w-full bg-surface-container-lowest rounded-3xl p-space-md transition-all cursor-pointer relative overflow-hidden ${isSelected ? 'shadow-md border border-surface-variant' : 'shadow-sm hover:shadow-md border border-transparent'}`}
                            >
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-container"></div>
                              )}
                              
                              <div className={`${tintClass} rounded-2xl p-space-md flex flex-col gap-space-md`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-label-sm text-label-sm px-space-sm py-space-xs rounded-full bg-surface-container-lowest/80 text-on-surface font-semibold tracking-wide">
                                    {postedDate}
                                  </span>
                                </div>
                                <div className="flex items-start justify-between gap-space-sm">
                                  <div className="space-y-space-xs">
                                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                                      {job.company?.display_name || job.company}
                                    </span>
                                    <h2 className="font-headline-md text-headline-md text-on-surface leading-snug line-clamp-2">
                                      {job.title}
                                    </h2>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-space-xs">
                                  {job.category?.label && (
                                    <span className="px-space-sm py-space-xs rounded-full bg-surface-container-lowest/90 text-on-surface font-label-sm text-label-sm truncate max-w-[120px]">
                                      {job.category.label}
                                    </span>
                                  )}
                                  {job.contract_time && (
                                    <span className="px-space-sm py-space-xs rounded-full bg-surface-container-lowest/90 text-on-surface font-label-sm text-label-sm">
                                      {job.contract_time.replace('_', ' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="pt-space-md flex items-center justify-between gap-space-sm px-space-xs">
                                <div>
                                  <div className="font-numeric-stat text-numeric-stat text-on-surface">{salary}</div>
                                  <div className="font-body-sm text-body-sm text-outline truncate max-w-[150px]">
                                    {job.location?.display_name || job.location}
                                  </div>
                                </div>
                                <div className="flex items-center gap-space-sm shrink-0">
                                  {job.matchScore ? (
                                    <span className={`px-space-sm py-1 rounded-full ${isSelected ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container text-on-surface-variant'} font-label-sm text-label-sm font-bold`}>
                                      {Math.round(job.matchScore * 100)}% Match
                                    </span>
                                  ) : null}
                                  
                                  <button className={`h-9 px-space-md font-label-md text-label-md rounded-full flex items-center gap-space-xs transition-colors ${isSelected ? 'bg-primary hover:bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-high hover:bg-surface-variant text-on-surface'}`}>
                                    <span>{isSelected ? 'Selected' : 'Details'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Detailed Deep Dive Inspector */}
                    {selectedJob ? (
                      <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm flex flex-col gap-space-lg sticky top-28">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-space-sm">
                            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-bold">TARGET ROLE BREAKDOWN</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm border-b border-surface-container">
                          <div className="space-y-space-xs">
                            <h2 className="font-headline-lg text-headline-lg text-on-surface">{selectedJob.title}</h2>
                            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                              <span className="font-semibold text-on-surface">{selectedJob.company?.display_name || selectedJob.company}</span>
                              <span className="">•</span>
                              <span className="">{selectedJob.location?.display_name || selectedJob.location}</span>
                              <span className="">•</span>
                              <span className="text-secondary font-semibold">
                                {(selectedJob.salary_min && selectedJob.salary_max) 
                                  ? `$${Math.round(selectedJob.salary_min / 1000)}k - $${Math.round(selectedJob.salary_max / 1000)}k / Year`
                                  : selectedJob.salary_max ? `Up to $${Math.round(selectedJob.salary_max / 1000)}k / Year` : 'Salary Unlisted'}
                              </span>
                            </div>
                          </div>
                          <a href={selectedJob.redirectUrl} target="_blank" rel="noopener noreferrer" className="h-10 px-space-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md rounded-full flex items-center justify-center gap-space-xs transition-colors self-start md:self-auto flex-shrink-0">
                            <span>View Original Job Post</span>
                            <span className="material-symbols-outlined text-body-md">north_east</span>
                          </a>
                        </div>

                        {selectedJob.matchScore ? (
                          <>
                            <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col sm:flex-row items-center gap-space-lg">
                              <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                  <circle className="text-surface-container-high" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="8"></circle>
                                  <circle className="text-secondary" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - selectedJob.matchScore)} strokeLinecap="round" strokeWidth="8" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                  <span className="font-headline-lg text-headline-lg text-on-surface font-bold leading-none">{Math.round(selectedJob.matchScore * 100)}%</span>
                                  <span className="font-label-sm text-label-sm text-secondary font-bold tracking-wider mt-1">FIT SCORE</span>
                                </div>
                              </div>
                              <div className="flex-1 space-y-space-xs text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-space-xs text-on-surface">
                                  <span className="material-symbols-outlined text-secondary text-body-lg">auto_awesome</span>
                                  <span className="font-headline-sm text-headline-sm">High Role Alignment for {firstName}</span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                  {selectedJob.fitExplanation || "This role is a strong match based on your extracted resume profile and core skills."}
                                </p>
                              </div>
                            </div>

                            {selectedJob.evidence && selectedJob.evidence.length > 0 && (
                              <div className="space-y-space-sm">
                                <div className="flex items-center gap-space-xs">
                                  <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">WHY IT FITS (KEY STRENGTHS)</span>
                                  <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                                </div>
                                <div className="grid grid-cols-1 gap-space-xs">
                                  {selectedJob.evidence.map((ev, i) => (
                                    <div key={i} className="bg-secondary-fixed/20 rounded-xl p-space-md flex gap-space-md items-center">
                                      <div className="w-6 h-6 rounded-full bg-secondary-container/40 text-on-secondary-container flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-body-md">check</span>
                                      </div>
                                      <p className="font-body-md text-body-md text-on-surface">{ev}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(selectedJob.gaps?.skillGaps?.length > 0 || selectedJob.gaps?.experienceGaps?.length > 0) && (
                              <div className="space-y-space-sm">
                                <div className="flex items-center gap-space-xs">
                                  <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">WHAT'S MISSING (IDENTIFIED GAPS)</span>
                                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                                </div>
                                <div className="grid grid-cols-1 gap-space-xs">
                                  {selectedJob.gaps.skillGaps.map((gap, i) => (
                                    <div key={`skill-${i}`} className="bg-tertiary-fixed/20 rounded-xl p-space-md flex gap-space-md items-center">
                                      <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-body-md">info</span>
                                      </div>
                                      <p className="font-body-md text-body-md text-on-surface">
                                        <strong className="font-semibold">{gap.gap || gap}:</strong> Missing this requested skill.
                                      </p>
                                    </div>
                                  ))}
                                  {selectedJob.gaps.experienceGaps.map((gap, i) => (
                                    <div key={`exp-${i}`} className="bg-tertiary-fixed/20 rounded-xl p-space-md flex gap-space-md items-center">
                                      <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-body-md">info</span>
                                      </div>
                                      <p className="font-body-md text-body-md text-on-surface">{gap}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-48 bg-surface-container-low rounded-2xl text-on-surface-variant font-body-md">
                            Upload a resume to receive AI-powered fit scoring and gap analysis.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm flex flex-col items-center justify-center min-h-[500px]">
                        <span className="material-symbols-outlined text-display-hero text-outline mb-space-md">touch_app</span>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Select an opportunity</h2>
                        <p className="font-body-md text-body-md text-outline">Click a job on the left to view detailed analysis and match score.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="w-full bg-surface-container-lowest mt-space-xl py-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-auto">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface">CareerSync Platform</span>
          </div>
          <div className="flex items-center gap-space-lg font-body-sm text-body-sm text-outline">
            <Link to="/privacy" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-on-surface transition-colors">Terms of Service</Link>
            <Link to="/support" className="hover:text-on-surface transition-colors">Support Desk</Link>
          </div>
          <div className="font-body-sm text-body-sm text-outline">© 2026 CareerSync Technologies Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default SearchAnalyzer;
