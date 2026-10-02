import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import './Legal.css';

export const PrivacyPolicy = () => {
  return (
    <div className="cs-legal-page">
      <Navbar />
      
      <main className="cs-legal-main">
        <div className="cs-legal-container">
          <h1 className="cs-legal-title">Privacy Policy</h1>
          <span className="cs-legal-last-updated">Last Updated: October 2026</span>
          
          <div className="cs-legal-content">
            <p>At CareerSync, we take your privacy and data security seriously. This Privacy Policy explains how we collect, use, process, and protect your personal data when you use the CareerSync platform.</p>

            <h2>1. Information We Collect</h2>
            <p>When you use CareerSync, we collect the following types of data:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and authentication data.</li>
              <li><strong>Resume Data:</strong> PDF documents you upload, and the structured text parsed from them by our AI systems.</li>
              <li><strong>Search History:</strong> The queries, filters, and matched jobs generated during your usage of the Discovery Engine.</li>
            </ul>

            <h2>2. How We Use Your Data</h2>
            <p>Your data is exclusively used to provide and improve the CareerSync service. Specifically, we use your data to:</p>
            <ul>
              <li>Power our AI Discovery Engine to find jobs that semantically match your profile.</li>
              <li>Generate skill gap analysis and fit explanations.</li>
              <li>Maintain your search history so you can review past opportunities.</li>
            </ul>

            <div className="cs-quota-card">
              <h3>Data Retention & Quotas</h3>
              <p>To ensure system performance and fairness, we strictly enforce data retention and usage quotas:</p>
              <ul>
                <li><strong>Resume Storage:</strong> Users are granted space for a maximum of <strong>3 active resumes</strong> at any time. Resumes automatically expire and are purged after 7 days.</li>
                <li><strong>Search Limits:</strong> You are allotted a maximum of <strong>10 AI-powered searches per 24-hour period</strong>.</li>
                <li><strong>History Retention:</strong> Search history and associated metadata are automatically deleted when the linked resume expires.</li>
              </ul>
            </div>

            <h2>3. Third-Party Data Sharing</h2>
            <p>We do not sell your personal data. We only share necessary data with trusted third parties to provide the service:</p>
            <ul>
              <li><strong>Job Data Providers:</strong> We integrate with Adzuna to fetch real-time enterprise listings. Your raw resume is never sent to them; only derived query parameters.</li>
              <li><strong>AI Processing:</strong> We use Google Gemini to parse your resumes and generate semantic embeddings. These systems do not use your data to train public models.</li>
            </ul>

            <h2>4. Your Rights</h2>
            <p>You have the right to access, modify, or delete your personal data at any time. Deleting a resume immediately removes its associated file and parsed data from our servers.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
