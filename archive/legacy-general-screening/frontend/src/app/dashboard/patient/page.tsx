'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Stethoscope, HeartPulse, Clock, AlertTriangle } from 'lucide-react';

interface ScreeningSession {
  id: number;
  screening_type: string;
  created_at: string;
  result?: {
    risk_score: number;
    risk_category: string;
    clinician_reviewed: boolean;
  };
}

export default function PatientDashboard() {
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/api/screening/sessions?limit=10');
        setSessions(response.data);
      } catch {
        console.error('Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Patient Dashboard</h1>
        <p>Access your screening modules and view past results</p>
      </div>

      {/* Screening Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard/patient/screening/diabetes" style={{ textDecoration: 'none' }}>
          <div className="glass-card glass-card-interactive" style={{ height: '100%' }}>
            <div className="stat-icon" style={{ background: 'hsla(172, 66%, 40%, 0.15)', color: 'var(--primary-light)' }}>
              <Stethoscope size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Diabetes Screening</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Assess your diabetes risk based on clinical measurements using our
              research-grade screening model.
            </p>
            <span className="badge badge-info" style={{ marginTop: '0.75rem' }}>Start Screening →</span>
          </div>
        </Link>

        <Link href="/dashboard/patient/screening/breast-cancer" style={{ textDecoration: 'none' }}>
          <div className="glass-card glass-card-interactive" style={{ height: '100%' }}>
            <div className="stat-icon" style={{ background: 'hsla(330, 60%, 50%, 0.15)', color: 'hsl(330, 60%, 65%)' }}>
              <HeartPulse size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Breast Cancer Screening</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Evaluate breast cancer risk factors using cell-nuclei analysis
              with our research-only AI model.
            </p>
            <span className="badge badge-info" style={{ marginTop: '0.75rem' }}>Start Screening →</span>
          </div>
        </Link>
      </div>

      {/* Medical Disclaimer */}
      <div className="disclaimer-banner" style={{ marginBottom: '2rem' }}>
        <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
        <strong>Important:</strong> All screening results are research-only estimates and require clinician review.
        They do NOT constitute a medical diagnosis. Consult your healthcare provider for clinical decisions.
      </div>

      {/* Recent Sessions */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} />
          Recent Screenings
        </h3>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-muted)' }}>Loading...</span>
          </div>
        ) : sessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
            No screening sessions yet. Start your first screening above!
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Risk Score</th>
                <th>Category</th>
                <th>Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td style={{ textTransform: 'capitalize' }}>
                    {session.screening_type.replace('_', ' ')}
                  </td>
                  <td>{new Date(session.created_at).toLocaleDateString()}</td>
                  <td>
                    {session.result
                      ? `${(session.result.risk_score * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                  <td>
                    {session.result ? (
                      <span className={`badge badge-${session.result.risk_category}`}>
                        {session.result.risk_category.replace('_', ' ')}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {session.result?.clinician_reviewed ? (
                      <span className="badge badge-low">✓ Reviewed</span>
                    ) : (
                      <span className="badge badge-moderate">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
