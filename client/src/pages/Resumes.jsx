import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const Resumes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, resumesRes] = await Promise.all([
          apiClient('/api/account/me'),
          apiClient('/api/resumes')
        ]);
        setUser(profileRes.user);
        setResumes(resumesRes.resumes);
      } catch (err) {
        if (err.status === 401) {
          navigate('/login');
        } else {
          console.error('Failed to load data:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input so the same file can be uploaded again if it failed
    e.target.value = '';

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await apiClient('/api/resumes', {
        method: 'POST',
        body: formData, // apiClient will automatically omit Content-Type so browser sets it with boundary
      });
      // Add the new resume to the top of the list
      setResumes([response.resume, ...resumes]);
    } catch (err) {
      console.error('Failed to upload resume:', err);
      alert(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await apiClient(`/api/resumes/${id}`, { method: 'DELETE' });
      setResumes(resumes.filter(r => (r.id || r._id) !== id));
    } catch (err) {
      console.error('Failed to delete resume:', err);
      alert(err.message || 'Failed to delete resume.');
    }
  };

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
              <Link to="/resumes" aria-current="page" className="transition-colors bg-surface-container-lowest text-on-surface shadow-sm rounded-full font-label-md text-label-md px-space-md py-space-xs">
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

      <main className="w-full pt-44 bg-background text-slate-800 flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
          </div>
        ) : (
        <div className="max-w-7xl mx-auto px-margin py-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Resume Manager</h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  /resumes
                </span>
              </div>
              <p className="text-sm md:text-base text-slate-500">
                Upload and manage your CVs for tailored AI job matching and skill extraction.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="material-symbols-outlined text-amber-600 text-lg">description</span>
                <span className="text-xs md:text-sm font-semibold">{resumes.length} of 3 Resumes Active <span className="font-normal opacity-75">(PDF max 5MB)</span></span>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <div 
              className={`relative group cursor-pointer border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-3xl p-8 md:p-12 transition-all duration-200 bg-slate-50/50 hover:bg-slate-50 text-center flex flex-col items-center justify-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-[#111317] text-white flex items-center justify-center shadow-lg shadow-slate-900/10 mb-4 transition-transform group-hover:scale-105">
                {uploading ? (
                  <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-3xl md:text-4xl text-indigo-300">cloud_upload</span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-1.5">
                {uploading ? 'Processing AI Extraction...' : 'Drop Resume Here or Click to Browse'}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 max-w-md mb-5 leading-relaxed">
                Supports PDF documents up to 5MB. Text parsing and AI indexing are instant.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-black text-white font-semibold text-xs md:text-sm px-6 py-3 rounded-full shadow-md flex items-center gap-2 transition-all"
                disabled={uploading}
              >
                <span className="material-symbols-outlined text-base">folder_open</span>
                Browse Files
              </button>
              <input 
                ref={fileInputRef}
                accept=".pdf" 
                aria-label="Upload resume file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">Uploaded Documents</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{resumes.length}</span>
                </div>
              </div>
              
              <div className="space-y-3.5">
                {resumes.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500">You haven't uploaded any resumes yet.</p>
                  </div>
                )}
                {resumes.map((resume, index) => {
                  const resumeId = resume.id || resume._id;
                  const uploadDate = new Date(resume.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  // We'll alternate border colors for visual flair based on index
                  const borderClass = index % 2 === 0 ? 'border-emerald-500/40' : 'border-slate-200 hover:border-slate-300';
                  const iconColorClass = index % 2 === 0 ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-slate-100 border-slate-200 text-slate-500';
                  
                  return (
                    <div key={resumeId} className={`p-5 md:p-6 rounded-2xl bg-white border-2 ${borderClass} shadow-sm hover:shadow-md transition-all`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-12 h-12 rounded-xl border flex-shrink-0 flex items-center justify-center ${iconColorClass}`}>
                            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm md:text-base text-slate-900 truncate">
                                {resume.originalFilename}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Uploaded {uploadDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                          <button className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View Details
                          </button>
                          <button onClick={() => handleDelete(resumeId)} className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Delete Resume">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {resume.parsed && (
                        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <span className={`material-symbols-outlined text-sm ${index % 2 === 0 ? 'text-indigo-500' : 'text-emerald-500'}`}>
                              {index % 2 === 0 ? 'psychology' : 'architecture'}
                            </span>
                            <span>Parsed Role:</span>
                            <span className="text-slate-900 font-bold">{resume.parsed.basics?.label || 'Professional'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {/* Skills pills could go here if we extracted them */}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="lg:col-span-4 bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Profile Extraction</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user?.name || 'User'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Resumes</span>
                    <span className="font-semibold text-slate-800">{resumes.length} / 3</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#daf4ed]/40 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">hub</span> Recommended Next Step
                  </span>
                </div>
                <Link to="/search-analyzer" className="w-full mt-2 bg-primary text-white hover:opacity-90 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm">
                  <span>View Matched Jobs</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
              
              <div className="px-2 flex items-start gap-2.5 text-slate-400 text-xs leading-relaxed">
                <span className="material-symbols-outlined text-slate-400 text-base">info</span>
                <span>You can toggle between resumes at any time to recalibrate your recommendations dashboard.</span>
              </div>
            </aside>
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

export default Resumes;
