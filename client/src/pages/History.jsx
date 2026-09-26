import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useUser } from '../contexts/UserContext';

const History = () => {
  const navigate = useNavigate();
  const { user, loadingUser } = useUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyRes = await apiClient('/api/search/history');
        setHistory(historyRes || []);
      } catch (err) {
        if (err.status === 401) {
          navigate('/login');
        } else {
          console.error('Failed to load history:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  // Helper to format salary
  const formatSalary = (min, max) => {
    if (min && max) return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`;
    if (max) return `Up to $${Math.round(max / 1000)}k`;
    return 'Salary Unlisted';
  };

  // Group history by relative time
  const groupHistory = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: { label: 'Today', date: today, items: [] },
      yesterday: { label: 'Yesterday', date: yesterday, items: [] },
      lastWeek: { label: 'Last Week', date: lastWeek, items: [] },
      older: { label: 'Older', date: null, items: [] }
    };

    history.forEach(item => {
      // Apply filter
      const searchTerms = [item.query, item.derivedQuery, item.cityOrState, item.country].filter(Boolean).join(' ').toLowerCase();
      if (filterQuery && !searchTerms.includes(filterQuery.toLowerCase())) {
        return;
      }

      const itemDate = new Date(item.searchedAt);
      const itemDay = new Date(itemDate);
      itemDay.setHours(0, 0, 0, 0);

      if (itemDay.getTime() === today.getTime()) {
        groups.today.items.push(item);
      } else if (itemDay.getTime() === yesterday.getTime()) {
        groups.yesterday.items.push(item);
      } else if (itemDay.getTime() > lastWeek.getTime()) {
        groups.lastWeek.items.push(item);
      } else {
        groups.older.items.push(item);
      }
    });

    return Object.entries(groups).filter(([_, group]) => group.items.length > 0);
  };

  const groupedHistory = groupHistory();

  // Metrics for Right Column
  const totalSearchesThisCycle = history.length;
  const allMatchScores = history.map(h => h.topMatchScore).filter(s => s != null);
  const avgMatchScore = allMatchScores.length > 0 
    ? (allMatchScores.reduce((a, b) => a + b, 0) / allMatchScores.length) * 100 
    : 0;
  
  const allMaxSalaries = history.map(h => h.maxSalary).filter(s => s != null);
  const highestSalary = allMaxSalaries.length > 0 ? Math.max(...allMaxSalaries) : null;
  const highestSalaryLocation = highestSalary 
    ? history.find(h => h.maxSalary === highestSalary)?.cityOrState || history.find(h => h.maxSalary === highestSalary)?.country
    : 'Unknown';
    
  const totalJobsAnalyzed = history.reduce((sum, h) => sum + (h.jobsAnalyzed || 0), 0);

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
              <Link to="/search-analyzer" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                Search Analyzer
              </Link>
              <Link to="/history" aria-current="page" className="transition-colors bg-surface-container-lowest text-on-surface shadow-sm rounded-full font-label-md text-label-md px-space-md py-space-xs">
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
            <div className="bg-inverse-surface rounded-2xl p-space-xs flex flex-wrap lg:flex-nowrap items-center gap-space-sm shadow-inner">
              <div className="flex-1 min-w-[200px] flex items-center gap-space-sm px-space-md py-space-xs bg-primary-container/80 rounded-xl text-on-primary">
                <span className="material-symbols-outlined text-outline-variant">search</span>
                <span className="font-body-sm text-body-sm text-outline-variant select-none">Role, skills, or title...</span>
              </div>
              <div className="flex-1 min-w-[160px] flex items-center justify-between px-space-md py-space-xs bg-primary-container/80 rounded-xl text-on-primary">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-outline-variant">work_history</span>
                  <span className="font-body-sm text-body-sm text-on-primary">3-5 yrs Exp</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-body-sm font-body-sm">expand_more</span>
              </div>
              <Link to="/search-analyzer" className="h-10 px-space-xl bg-secondary-container hover:bg-secondary-fixed text-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-space-xs transition-colors">
                <span className="material-symbols-outlined text-headline-sm font-headline-sm">tune</span>
                <span className="">Explore</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-44 bg-background flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-margin py-space-xl">
            <div className="flex flex-col w-full">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
                <div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Search History</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Review and reopen your previous AI-powered match searches.</p>
                </div>
                <div className="flex items-center gap-space-sm w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-body-lg pointer-events-none">search</span>
                    <input 
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="w-full pl-10 pr-space-md py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all" 
                      placeholder="Filter past queries, roles, locations..." 
                      type="text" 
                    />
                  </div>
                  <button 
                    onClick={() => setFilterQuery('')}
                    className="h-10 px-space-md rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors font-label-md text-label-md flex items-center gap-space-xs shrink-0"
                  >
                    <span className="material-symbols-outlined text-body-md font-body-md">tune</span>
                    <span className="">Filter</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                
                {/* LEFT COLUMN: History Groups */}
                <div className="lg:col-span-8 flex flex-col gap-space-xl">
                  {groupedHistory.length === 0 ? (
                    <div className="text-center py-12 bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container">
                      <span className="material-symbols-outlined text-display-hero text-outline mb-4">history_off</span>
                      <h2 className="font-headline-md text-on-surface">No search history found</h2>
                      <p className="text-on-surface-variant mt-2">Try running a new query to see your results here.</p>
                    </div>
                  ) : (
                    groupedHistory.map(([key, group]) => (
                      <div key={key} className="flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between px-space-xs">
                          <div className="flex items-center gap-space-sm">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{group.label}</h2>
                            <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{group.items.length} {group.items.length === 1 ? 'search' : 'searches'}</span>
                          </div>
                          {group.date && (
                            <span className="font-body-sm text-body-sm text-outline">
                              {group.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-space-sm">
                          {group.items.map((item, idx) => {
                            const timeStr = new Date(item.searchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            
                            // Cycle icon styles for visual flair
                            const iconStyles = [
                              { bg: 'bg-surface-container-low text-secondary group-hover:bg-secondary-container/30', icon: 'architecture' },
                              { bg: 'bg-surface-container-low text-secondary group-hover:bg-secondary-container/30', icon: 'desktop_windows' },
                              { bg: 'bg-surface-container-low text-secondary group-hover:bg-secondary-container/30', icon: 'hub' },
                              { bg: 'bg-surface-container-low text-secondary group-hover:bg-secondary-container/30', icon: 'psychology' },
                            ];
                            const iconStyle = iconStyles[idx % iconStyles.length];

                            return (
                              <div key={item._id} className="group p-space-md md:p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                                  <div className="flex items-start gap-space-md min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${iconStyle.bg}`}>
                                      <span className="material-symbols-outlined text-headline-sm">{iconStyle.icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-space-xs flex-wrap mb-1">
                                        <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors font-medium">
                                          {item.derivedQuery || item.query || 'General Search'}
                                        </span>
                                        <span className="text-outline-variant font-body-sm">•</span>
                                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                                          {item.cityOrState ? `${item.cityOrState}, ${item.country.toUpperCase()}` : item.country.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-space-sm flex-wrap text-outline font-body-sm text-body-sm">
                                        <span className="font-numeric-stat text-body-sm text-on-surface font-semibold">
                                          {formatSalary(item.minSalary, item.maxSalary)}
                                        </span>
                                        <span className="">•</span>
                                        <span className="flex items-center gap-1">
                                          <span className="material-symbols-outlined text-label-sm font-label-sm">analytics</span>
                                          {item.jobsAnalyzed} jobs analyzed
                                        </span>
                                        <span className="">•</span>
                                        <span className="text-outline">{timeStr}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between md:justify-end gap-space-md shrink-0 pt-space-xs md:pt-0 border-t md:border-t-0 border-surface-container">
                                    {item.topMatchScore != null ? (
                                      <span className="px-space-md py-1 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                                        Top Match: <strong className="font-numeric-stat text-label-md text-on-surface">{Math.round(item.topMatchScore * 100)}%</strong>
                                      </span>
                                    ) : (
                                      <span className="px-space-md py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                                        No matches
                                      </span>
                                    )}
                                    <div className="flex items-center gap-space-xs">
                                      <Link to={`/results/${item._id}`} className="px-space-md py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center gap-space-xs shadow-sm">
                                        <span className="">Reopen</span>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* RIGHT COLUMN: Metrics Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-space-lg sticky top-28">
                  <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Telemetry & Match Index</h3>
                      <span className="material-symbols-outlined text-outline text-headline-sm">monitoring</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      CareerSync calculates match vectors based on your active resume portfolio and real-time market data across 140+ boards.
                    </p>
                    
                    <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm" style={{ borderRadius: '10px' }}>
                      <div className="flex justify-between items-center text-body-sm font-body-sm">
                        <span className="text-on-surface-variant font-medium">Average Match Confidence</span>
                        <span className="font-numeric-stat text-body-md text-secondary font-bold">{Math.round(avgMatchScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                        <div className="h-full bg-secondary-container rounded-full transition-all duration-1000" style={{ width: `${avgMatchScore}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-label-sm font-label-sm text-outline pt-1">
                        <span className="">Aggregated {totalJobsAnalyzed} postings</span>
                        <span className="font-medium text-secondary">Overall view</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-space-sm">
                      <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between h-28" style={{ borderRadius: '10px' }}>
                        <span className="font-label-sm text-label-sm text-outline block">Searches Conducted</span>
                        <span className="font-numeric-stat text-headline-lg text-on-surface leading-tight">{totalSearchesThisCycle}</span>
                        <div className="flex items-center">
                          <span className="px-space-xs py-0.5 rounded-md bg-surface-container-highest text-label-sm font-label-sm text-on-surface-variant">This cycle</span>
                        </div>
                      </div>
                      <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between h-28" style={{ borderRadius: '10px' }}>
                        <span className="font-label-sm text-label-sm text-outline block">Max Compensation</span>
                        <span className="font-numeric-stat text-headline-lg text-on-surface leading-tight truncate">
                          {highestSalary ? `$${Math.round(highestSalary / 1000)}k` : 'N/A'}
                        </span>
                        <div className="flex items-center">
                          <span className="px-space-xs py-0.5 rounded-md bg-surface-container-highest text-label-sm font-label-sm text-on-surface-variant truncate" title={highestSalaryLocation}>
                            {highestSalaryLocation}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-space-xs">
                      <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-secondary-fixed/40 text-on-secondary-fixed-variant font-body-sm text-body-sm" style={{ borderRadius: '10px' }}>
                        <span className="material-symbols-outlined text-secondary text-body-lg">auto_awesome</span>
                        <span className="">Tip: Re-running queries automatically refreshes latest company job postings.</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
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

export default History;
