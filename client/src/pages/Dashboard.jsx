import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const BookmarkButton = ({ initialActive = false }) => {
  const [active, setActive] = useState(initialActive);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setActive(!active);
      }}
      className={`w-9 h-9 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center transition-colors ${active ? 'text-secondary' : 'text-outline hover:text-on-surface'
        }`}
      title="Save query"
    >
      <span
        className="material-symbols-outlined text-headline-sm"
        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
    </button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient('/api/account/me');
        setUser(response.user);
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
    fetchProfile();
  }, [navigate]);

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
              <Link to="/dashboard" aria-current="page" className="transition-colors bg-surface-container-lowest text-on-surface shadow-sm rounded-full font-label-md text-label-md px-space-md py-space-xs">
                Dashboard
              </Link>
              <Link to="/resumes" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                Resumes
              </Link>
              <Link to="/search-analyzer" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                Search Analyzer
              </Link>
              <Link to="/history" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                History
              </Link>
              <Link to="/settings" className="text-outline-variant hover:text-on-primary font-label-md text-label-md px-space-md py-space-xs transition-colors rounded-full">
                Settings
              </Link>
            </nav>
            <div className="flex items-center gap-space-md">
              <button className="relative p-space-xs text-outline-variant hover:text-on-primary transition-colors flex items-center justify-center"></button>
              <div className="flex items-center gap-space-sm pl-space-xs">
                <div className="hidden md:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-on-primary leading-tight">{user?.name || 'Alex Rivers'}</span>
                  <span className="font-label-sm text-label-sm text-outline-variant leading-tight">Software Engineer</span>
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
              <button className="h-10 px-space-xl bg-secondary-container hover:bg-secondary-fixed text-primary font-headline-sm text-headline-sm rounded-xl flex items-center justify-center gap-space-xs transition-colors">
                <span className="material-symbols-outlined text-headline-sm font-headline-sm">tune</span>
                <span className="">Explore</span>
              </button>
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
          <div className="flex flex-col w-full gap-space-xl">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
                  Hello, {firstName}
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Welcome back! Ready to find your next career step?
                </p>
              </div>
              {/* Quick Status / Metric Capsule */}
              <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-xs pr-space-md rounded-full shadow-sm">
                <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-headline-sm">auto_awesome</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline leading-none">Sync Intelligence</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface leading-snug">98.4% Profile Index</span>
                </div>
              </div>
            </div>

            {/* Primary Action Bento: 2 Big Feature Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {/* Card 1: Upload & Parse Resume */}
              <div className="group relative bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                {/* Subtle Pastel Graphic Underlay */}
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex flex-col gap-space-lg relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shadow-sm">
                      <span className="material-symbols-outlined text-display-hero leading-none">description</span>
                    </div>
                    <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
                      <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">PDF, DOCX ready</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-md text-label-md text-secondary tracking-wide uppercase">AI Skill Ingestion</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      Upload &amp; Parse Resume
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Sync your latest PDF resume to update parsed skills and AI match algorithms across 1,200+ partner talent graphs.
                    </p>
                  </div>
                  {/* Inset parsed summary pill bar */}
                  <div className="bg-surface-container-low rounded-2xl p-space-md flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-outline text-headline-md">history</span>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">Current File</span>
                        <span className="font-label-md text-label-md text-on-surface font-medium truncate max-w-[200px]">Alex_Rivers_Senior_2025.pdf</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm bg-surface-container-lowest text-on-surface px-space-sm py-1 rounded-md font-semibold">Parsed 4d ago</span>
                  </div>
                </div>
                <div className="pt-space-xl flex items-center justify-between gap-space-md relative z-10">
                  <button className="h-12 px-space-xl bg-primary hover:bg-inverse-surface text-on-primary font-headline-sm text-headline-sm rounded-full flex items-center gap-space-sm transition-all transform active:scale-95 shadow-md">
                    <span>Upload Resume</span>
                  </button>
                  <span className="font-body-sm text-body-sm text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-body-md text-secondary">verified_user</span> Encrypted &amp; Private
                  </span>
                </div>
              </div>

              {/* Card 2: Launch New Job Search */}
              <div className="group relative bg-surface-container-lowest rounded-3xl p-space-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
                {/* Subtle Warm Pastel Graphic Underlay */}
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-tertiary-fixed/60 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex flex-col gap-space-lg relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-sm">
                      <span className="material-symbols-outlined text-display-hero leading-none">travel_explore</span>
                    </div>
                    <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">500+ Top Tech Cos</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-md text-label-md text-on-tertiary-container tracking-wide uppercase">Discovery Engine</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                      Launch New Job Search
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Explore live openings across leading product-driven tech companies matched directly to your verified career trajectory.
                    </p>
                  </div>
                  {/* Live Metrics Sparklet */}
                  <div className="bg-surface-container-low rounded-2xl p-space-md flex items-center justify-between">
                    <div className="flex items-center gap-space-md">
                      <div className="flex flex-col">
                        <span className="font-numeric-stat text-numeric-stat text-on-surface">386</span>
                        <span className="font-label-sm text-label-sm text-outline">Roles in NY/Remote</span>
                      </div>
                      <div className="w-px h-8 bg-surface-container-highest"></div>
                      <div className="flex flex-col">
                        <span className="font-numeric-stat text-numeric-stat text-secondary">$175k</span>
                        <span className="font-label-sm text-label-sm text-outline">Avg Median Base</span>
                      </div>
                    </div>
                    {/* Sparkline representation */}
                    <svg className="w-24 h-8 text-secondary overflow-visible" fill="none" viewBox="0 0 100 30">
                      <path d="M0 24 Q 25 15, 50 18 T 100 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                      <circle className="fill-secondary-container" cx="100" cy="4" r="3.5"></circle>
                    </svg>
                  </div>
                </div>
                <div className="pt-space-xl flex items-center justify-between gap-space-md relative z-10">
                  <button className="h-12 px-space-xl bg-primary hover:bg-inverse-surface text-on-primary font-headline-sm text-headline-sm rounded-full flex items-center gap-space-sm transition-all transform active:scale-95 shadow-md">
                    <span>Start Search</span>
                  </button>
                  <div className="flex items-center -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold ring-2 ring-surface-container-lowest">G</div>
                    <div className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-label-sm text-[10px] font-bold ring-2 ring-surface-container-lowest">A</div>
                    <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-sm text-[10px] font-bold ring-2 ring-surface-container-lowest">+80</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Searches Section */}
            <div className="flex flex-col gap-space-md mt-space-md">
              {/* Header row with capsule badge & historical link */}
              <div className="flex items-center justify-between flex-wrap gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Recent Searches</h2>
                  <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold tracking-wide">
                    3 Active Queries
                  </span>
                </div>
                <Link to="/history" className="group font-label-md text-label-md text-secondary hover:text-on-secondary-container flex items-center gap-space-xs transition-colors">
                  <span>View all history</span>
                  <span className="material-symbols-outlined text-headline-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
              </div>

              {/* 3 LuckyJob Style Job/Query Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {/* Query Card 1: Mint Accent */}
                <div className="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-space-md">
                  {/* Inner Pastel Container */}
                  <div className="rounded-2xl p-space-lg flex flex-col justify-between gap-space-md bg-secondary-fixed/30 min-h-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline-variant bg-surface-container-lowest/80 px-space-sm py-1 rounded-full font-medium">
                        Yesterday
                      </span>
                      <BookmarkButton initialActive={true} />
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-outline font-medium tracking-wide">San Francisco, CA • Hybrid</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                          <span className="font-headline-sm text-headline-sm font-bold text-secondary">P</span>
                        </div>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface leading-snug font-bold">
                        Senior Product Designer
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">Design Systems</span>
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">Figma</span>
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">Framer</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-space-xs pt-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                        <span className="font-numeric-stat text-numeric-stat text-on-surface">94% AI Match</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-outline">32 new roles found</span>
                    </div>
                    <button className="h-9 px-space-md bg-primary hover:bg-inverse-surface text-on-primary font-label-md text-label-md rounded-full transition-colors flex items-center justify-center">
                      Details
                    </button>
                  </div>
                </div>

                {/* Query Card 2: Soft Blue Accent */}
                <div className="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-space-md">
                  <div className="rounded-2xl p-space-lg flex flex-col justify-between gap-space-md bg-secondary-fixed/50 min-h-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline-variant bg-surface-container-lowest/80 px-space-sm py-1 rounded-full font-medium">
                        3 days ago
                      </span>
                      <BookmarkButton />
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-outline font-medium tracking-wide">New York, NY • Remote</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                          <span className="font-headline-sm text-headline-sm font-bold text-on-secondary-container">U</span>
                        </div>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface leading-snug font-bold">
                        Lead UX Architect
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">Information Arch</span>
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">User Research</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-space-xs pt-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                        <span className="font-numeric-stat text-numeric-stat text-on-surface">88% AI Match</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-outline">19 new roles found</span>
                    </div>
                    <button className="h-9 px-space-md bg-primary hover:bg-inverse-surface text-on-primary font-label-md text-label-md rounded-full transition-colors flex items-center justify-center">
                      Details
                    </button>
                  </div>
                </div>

                {/* Query Card 3: Peach / Lavender Accent */}
                <div className="bg-surface-container-lowest rounded-3xl p-space-md shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-space-md">
                  <div className="rounded-2xl p-space-lg flex flex-col justify-between gap-space-md bg-tertiary-fixed/50 min-h-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline-variant bg-surface-container-lowest/80 px-space-sm py-1 rounded-full font-medium">
                        Last week
                      </span>
                      <BookmarkButton />
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-outline font-medium tracking-wide">Austin, TX • On-site</span>
                        <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                          <span className="font-headline-sm text-headline-sm font-bold text-on-tertiary-fixed">I</span>
                        </div>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface leading-snug font-bold">
                        Principal Interaction Designer
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">Prototyping</span>
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container-lowest/90 text-on-surface font-semibold shadow-xs">Micro-animations</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-space-xs pt-space-xs">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                        <span className="font-numeric-stat text-numeric-stat text-on-surface">91% AI Match</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-outline">41 new roles found</span>
                    </div>
                    <button className="h-9 px-space-md bg-primary hover:bg-inverse-surface text-on-primary font-label-md text-label-md rounded-full transition-colors flex items-center justify-center">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      <footer className="w-full bg-surface-container-lowest mt-space-xl py-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
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

export default Dashboard;
