import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import './Legal.css';

export const TermsOfService = () => {
  return (
    <div className="cs-legal-page">
      <Navbar />
      
      <main className="cs-legal-main">
        <div className="cs-legal-container">
          <h1 className="cs-legal-title">Terms & Conditions</h1>
          <span className="cs-legal-last-updated">Last Updated: October 2026</span>
          
          <div className="cs-legal-content">
            <p>Welcome to CareerSync. By accessing or using our platform, you agree to comply with and be bound by the following Terms and Conditions.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By registering for an account and using the CareerSync Discovery Engine, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you may not use our service.</p>

            <h2>2. User Responsibilities</h2>
            <p>You agree to provide accurate information and to only upload resumes or documents that belong to you. You are responsible for maintaining the confidentiality of your account credentials.</p>

            <div className="cs-quota-card">
              <h3>Platform Usage Limits</h3>
              <p>CareerSync offers AI-powered semantic matching, which requires significant computational resources. To maintain service availability for all users, the following limits apply:</p>
              <ul>
                <li><strong>Total Searches:</strong> Users are strictly limited to <strong>10 searches per 24 hours</strong>. The global platform is also capped at 100 searches daily.</li>
                <li><strong>Space for Resumes:</strong> You are granted space for a maximum of <strong>3 active resumes</strong>. Uploading additional resumes requires deleting an existing one.</li>
              </ul>
            </div>

            <h2>3. Service Availability</h2>
            <p>We strive to provide continuous access to CareerSync, but we do not guarantee that the service will be available 100% of the time. The AI parsing service and Discovery Engine may be temporarily unavailable during periods of high demand.</p>

            <h2>4. Intellectual Property</h2>
            <p>The CareerSync platform, including its original content, features, algorithms, and design, are owned by CareerSync Technologies Inc. and are protected by international copyright and intellectual property laws.</p>

            <h2>5. Limitation of Liability</h2>
            <p>CareerSync provides job matches based on AI semantic analysis. We do not guarantee employment, nor do we guarantee the absolute accuracy of the fit explanations or skill gaps. You use the service at your own discretion.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
