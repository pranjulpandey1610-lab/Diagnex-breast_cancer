'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ClipboardCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface PendingReview {
  id: number;
  session_id: number;
  model_name: string;
  risk_score: number;
  risk_category: string;
  clinician_reviewed: boolean;
  reviewed_by: number | null;
  clinical_notes: string | null;
  reviewed_at: string | null;
  patient_name: string | null;
  screening_type: string | null;
}

export default function DoctorDashboard() {
  const [pending, setPending] = useState<PendingReview[]>([]);
  const [reviewed, setReviewed] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        api.get('/api/review/pending'),
        api.get('/api/review/all'),
      ]);
      setPending(pendingRes.data);
      setReviewed(allRes.data.filter((r: PendingReview) => r.clinician_reviewed));
    } catch {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const submitReview = async (resultId: number, approved: boolean) => {
    if (!notes.trim()) {
      setError('Clinical notes are required.');
      return;
    }

    try {
      await api.patch(`/api/review/${resultId}`, {
        clinical_notes: notes,
        clinician_approved: approved,
      });
      setReviewingId(null);
      setNotes('');
      setError('');
      await fetchReviews();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || 'Review submission failed.');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardCheck size={28} /> Doctor Dashboard
        </h1>
        <p>Review AI screening results and provide clinical assessments</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-label">Pending Reviews</div>
          <div className="stat-value">{pending.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-label">Completed Reviews</div>
          <div className="stat-value">{reviewed.length}</div>
        </div>
      </div>

      {error && <div className="disclaimer-banner disclaimer-banner-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Pending Reviews */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>⏳ Pending Clinician Review</h3>
        {loading ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><div className="spinner" /> Loading...</div>
        ) : pending.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending reviews. All caught up!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.map((review) => (
              <div key={review.id} className="glass-card" style={{ background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Patient: <strong style={{ color: 'var(--text-primary)' }}>{review.patient_name || 'Unknown'}</strong></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Type: <span style={{ textTransform: 'capitalize' }}>{review.screening_type?.replace('_', ' ')}</span>
                      {' '} | Model: {review.model_name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {(review.risk_score * 100).toFixed(1)}%
                    </span>
                    <span className={`badge badge-${review.risk_category}`}>
                      {review.risk_category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {reviewingId === review.id ? (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor={`notes-${review.id}`} className="form-label">Clinical Notes</label>
                      <textarea
                        id={`notes-${review.id}`}
                        className="form-input"
                        rows={3}
                        placeholder="Enter your clinical assessment..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => submitReview(review.id, true)}>
                        <CheckCircle size={14} /> Approve & Complete
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setReviewingId(null); setNotes(''); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '0.75rem' }}
                    onClick={() => { setReviewingId(review.id); setNotes(''); }}
                  >
                    Review This Result
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Reviews */}
      {reviewed.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>✓ Completed Reviews</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Risk</th>
                <th>Category</th>
                <th>Notes</th>
                <th>Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {reviewed.map((r) => (
                <tr key={r.id}>
                  <td>{r.patient_name || 'Unknown'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.screening_type?.replace('_', ' ')}</td>
                  <td>{(r.risk_score * 100).toFixed(1)}%</td>
                  <td><span className={`badge badge-${r.risk_category}`}>{r.risk_category.replace('_', ' ')}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.clinical_notes || '—'}</td>
                  <td>{r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
