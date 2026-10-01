import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import './ResumeManager.css';
import { Link, useNavigate } from 'react-router-dom';

export const ResumeManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/api/resumes');
      if (data && data.resumes) {
        setResumes(data.resumes);
      }
    } catch (err) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadResume(file);
    e.target.value = null; // Reset input
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadResume(file);
  };

  const uploadResume = async (file) => {
    if (resumes.length >= 3) {
      setError('You have reached the maximum limit of 3 active resumes. Please delete an older resume before uploading a new one.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const data = await apiClient('/api/resumes', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData; fetch sets it automatically with the boundary
        headers: {
          // Keep other headers if needed, but remove Content-Type
        }
      });
      
      if (data && data.resume) {
        setResumes(prev => [data.resume, ...prev]);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await apiClient(`/api/resumes/${id}`, { method: 'DELETE' });
      setResumes(prev => prev.filter(r => (r._id || r.id) !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete resume');
    }
  };

  return (
    <div className="cs-resume-page">
      <Navbar rightAction={rightAction} />
      
      <main className="cs-resume-main">
        <div className="cs-resume-container">
          
          <div className="cs-resume-header-group">
            <div>
              <div className="cs-resume-title-box">
                <h1 className="cs-resume-title">Resume Manager</h1>
                <span className="cs-route-badge">/resumes</span>
              </div>
              <p className="cs-resume-subtitle">Upload and manage your CVs for tailored AI job matching and skill extraction.</p>
            </div>
            
            <div className="cs-resume-quota">
              <span className="material-symbols-outlined cs-quota-icon">description</span>
              <span className="cs-quota-text">{resumes.length} of 3 Resumes Active <span className="cs-quota-sub">(PDF max 5MB)</span></span>
            </div>
          </div>

          <section>
            <div 
              className={`cs-upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <div className="cs-upload-icon-box">
                <span className="material-symbols-outlined cs-upload-icon">
                  {isUploading ? 'hourglass_empty' : 'cloud_upload'}
                </span>
              </div>
              <h2 className="cs-upload-title">
                {isUploading ? 'Uploading & Analyzing...' : 'Drop Resume Here or Click to Browse'}
              </h2>
              <p className="cs-upload-desc">
                Supports PDF and DOCX up to 5MB. Text parsing and AI indexing are instant.
              </p>
              <button 
                className="cs-btn-upload" 
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span className="material-symbols-outlined">folder_open</span>
                Browse Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="cs-hidden-input" 
                accept=".pdf,.docx" 
                onChange={handleFileChange} 
                disabled={isUploading}
              />
            </div>
          </section>

          {error && (
            <div className="cs-resume-error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <div className="cs-resume-grid">
            <section className="cs-resume-list-col">
              <div className="cs-resume-list-header">
                <h2 className="cs-resume-list-title">Uploaded Documents</h2>
                <span className="cs-resume-count-badge">{resumes.length}</span>
              </div>
              
              <div className="cs-resume-list">
                {isLoading ? (
                  <div className="cs-resume-loading">Loading resumes...</div>
                ) : resumes.length === 0 ? (
                  <div className="cs-resume-empty">No resumes uploaded yet.</div>
                ) : (
                  resumes.map(resume => (
                    <div key={resume._id || resume.id} className="cs-resume-card">
                      <div className="cs-resume-card-top">
                        <div className="cs-resume-info-group">
                          <div className={`cs-resume-file-icon ${resume.mimeType === 'application/pdf' ? 'pdf' : 'docx'}`}>
                            <span className="material-symbols-outlined">
                              {resume.mimeType === 'application/pdf' ? 'picture_as_pdf' : 'description'}
                            </span>
                          </div>
                          <div className="cs-resume-meta">
                            <h3 className="cs-resume-filename">{resume.originalFilename}</h3>
                            <p className="cs-resume-date">
                              Uploaded {new Date(resume.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="cs-resume-actions">
                          <button className="cs-btn-details">
                            <span className="material-symbols-outlined">visibility</span>
                            View Details
                          </button>
                          <button className="cs-btn-delete" onClick={() => deleteResume(resume._id || resume.id)} title="Delete Resume">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {resume.parsed && resume.parsed.derivedTargetTitle && (
                        <div className="cs-resume-card-bottom">
                          <div className="cs-resume-parsed-role">
                            <span className="material-symbols-outlined cs-role-icon">psychology</span>
                            <span className="cs-role-label">Parsed Role:</span>
                            <span className="cs-role-value">{resume.parsed.derivedTargetTitle}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
            
            <aside className="cs-resume-sidebar">
              <div className="cs-sidebar-header">
                <span className="cs-sidebar-title">AI Profile Extraction</span>
              </div>
              
              {resumes.length > 0 && resumes[0].parsed ? (
                <div className="cs-sidebar-card">
                  <div className="cs-profile-header">
                    <div className="cs-profile-avatar">
                      <span className="material-symbols-outlined">badge</span>
                    </div>
                    <div>
                      <p className="cs-profile-name">{resumes[0].parsed.candidateName || 'Unknown Candidate'}</p>
                    </div>
                  </div>
                  <div className="cs-profile-details">
                    <div className="cs-profile-row">
                      <span className="cs-profile-label">Total Experience</span>
                      <span className="cs-profile-value">{resumes[0].parsed.totalYearsExperience || 0}+ yrs</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cs-sidebar-empty">
                  Upload a resume to see AI extraction details.
                </div>
              )}
              
              <div className="cs-next-step-card">
                <div className="cs-next-step-header">
                  <span className="material-symbols-outlined">hub</span>
                  Recommended Next Step
                </div>
                <button className="cs-btn-matched-jobs" onClick={() => navigate('/search', { viewTransition: true })}>
                  View Matched Jobs
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              
              <div className="cs-sidebar-info">
                <span className="material-symbols-outlined">info</span>
                <span>You can toggle between resumes at any time to recalibrate your recommendations dashboard.</span>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
