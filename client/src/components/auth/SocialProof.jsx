import React from 'react';
import './SocialProof.css';

export const SocialProof = () => {
  return (
    <div className="cs-social-proof animate-fade-in" aria-label="Social Proof">
      <div className="cs-avatar-cluster">
        <span className="cs-avatar cs-avatar-ai">AI</span>
        <span className="cs-avatar cs-avatar-ux">UX</span>
        <span className="cs-avatar cs-avatar-count">+8k</span>
      </div>
      <span className="cs-social-proof-text">
        Matching with 8,400+ tech leaders this week
      </span>
    </div>
  );
};
