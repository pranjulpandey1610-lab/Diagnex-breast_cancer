'use client';

import Link from 'next/link';
import {
  Shield,
  Activity,
  Brain,
  Lock,
  ClipboardCheck,
  FileSearch,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav">
        <span className="landing-nav-logo">🔬 Diagnex</span>
        <div className="landing-nav-links">
          <Link href="/auth/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <h1>
          Intelligent Medical
          <br />
          Screening Platform
        </h1>
        <p className="subtitle">
          Secure, AI-powered risk screening for diabetes and breast cancer.
          Research-grade models with clinician review workflows, encrypted data storage,
          and full audit trails.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/register" className="btn btn-primary btn-lg">
            Start Screening
          </Link>
          <Link href="/auth/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Medical Disclaimer */}
        <div className="landing-disclaimer" style={{ marginTop: '3rem' }}>
          <div className="disclaimer-banner">
            ⚠️ <strong>Medical Disclaimer:</strong> Diagnex provides screening estimates
            for research and informational purposes only. It is NOT a medical diagnostic
            device. All AI results are labeled as &ldquo;Research-Only AI Flag&rdquo; and require
            clinician review. Consult a qualified healthcare provider for medical advice.
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" style={{ paddingBottom: '4rem' }}>
        <div className="feature-card animate-fadeIn">
          <div className="feature-icon">
            <Brain size={24} />
          </div>
          <h3>AI Risk Screening</h3>
          <p>
            Self-hosted machine learning models for diabetes and breast cancer risk
            assessment. No paid APIs — fully open-source inference.
          </p>
        </div>

        <div className="feature-card animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="feature-icon" style={{ background: 'hsla(220, 70%, 50%, 0.15)', color: 'var(--accent-light)' }}>
            <Shield size={24} />
          </div>
          <h3>Secure by Design</h3>
          <p>
            End-to-end encryption, role-based access control, and audit logging.
            Patient data is encrypted at rest and never exposed publicly.
          </p>
        </div>

        <div className="feature-card animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="feature-icon" style={{ background: 'hsla(152, 60%, 45%, 0.15)', color: 'var(--success)' }}>
            <ClipboardCheck size={24} />
          </div>
          <h3>Clinician Review</h3>
          <p>
            Every AI screening result requires clinician review before clinical use.
            Doctors can add notes, approve, or flag results for follow-up.
          </p>
        </div>

        <div className="feature-card animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <div className="feature-icon" style={{ background: 'hsla(0, 72%, 55%, 0.15)', color: 'var(--danger)' }}>
            <Lock size={24} />
          </div>
          <h3>Role-Based Access</h3>
          <p>
            Four distinct roles — Patient, Doctor, Admin, Researcher — each with
            precisely scoped permissions. No unauthorized data access.
          </p>
        </div>

        <div className="feature-card animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <div className="feature-icon" style={{ background: 'hsla(38, 92%, 50%, 0.15)', color: 'var(--warning)' }}>
            <Activity size={24} />
          </div>
          <h3>Full Audit Trail</h3>
          <p>
            Every action is logged immutably — logins, screenings, file access,
            reviews. Complete traceability for compliance and accountability.
          </p>
        </div>

        <div className="feature-card animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <div className="feature-icon" style={{ background: 'hsla(200, 80%, 50%, 0.15)', color: 'var(--info)' }}>
            <FileSearch size={24} />
          </div>
          <h3>Model Versioning</h3>
          <p>
            Every prediction is linked to a specific model version and dataset.
            Full reproducibility and traceability for research integrity.
          </p>
        </div>
      </section>
    </div>
  );
}
