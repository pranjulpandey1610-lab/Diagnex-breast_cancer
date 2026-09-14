'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { HeartPulse, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ScreeningResult {
  risk_score: number;
  risk_category: string;
  explanation: string;
  ai_disclaimer: string;
  model_name: string;
  model_version: string;
  clinician_reviewed: boolean;
}

export default function BreastCancerScreeningPage() {
  const [formData, setFormData] = useState({
    mean_radius: '',
    mean_texture: '',
    mean_perimeter: '',
    mean_area: '',
    mean_smoothness: '',
    mean_compactness: '',
    mean_concavity: '',
    mean_concave_points: '',
    mean_symmetry: '',
    mean_fractal_dimension: '',
  });
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fields = [
    { key: 'mean_radius', label: 'Mean Radius', hint: 'Mean of distances from center to points on perimeter (0–50)', tooltip: 'Average radius of cell nuclei measured in the biopsy sample' },
    { key: 'mean_texture', label: 'Mean Texture', hint: 'Std deviation of gray-scale values (0–50)', tooltip: 'Texture uniformity of cell nuclei' },
    { key: 'mean_perimeter', label: 'Mean Perimeter', hint: 'Mean perimeter of cell nuclei (0–300)', tooltip: 'Average perimeter of cell nuclei boundary' },
    { key: 'mean_area', label: 'Mean Area', hint: 'Mean area of cell nuclei (0–3000)', tooltip: 'Average cross-sectional area of cell nuclei' },
    { key: 'mean_smoothness', label: 'Mean Smoothness', hint: 'Local variation in radius lengths (0–1)', tooltip: 'How smooth the cell boundary appears' },
    { key: 'mean_compactness', label: 'Mean Compactness', hint: 'perimeter² / area - 1 (0–1)', tooltip: 'Ratio of perimeter squared to area' },
    { key: 'mean_concavity', label: 'Mean Concavity', hint: 'Severity of concave portions (0–1)', tooltip: 'Depth of concave regions in the boundary' },
    { key: 'mean_concave_points', label: 'Mean Concave Points', hint: 'Number of concave portions (0–1)', tooltip: 'Count of concave indentations in boundary' },
    { key: 'mean_symmetry', label: 'Mean Symmetry', hint: 'Symmetry of cell nuclei (0–1)', tooltip: 'How symmetric the cell appears' },
    { key: 'mean_fractal_dimension', label: 'Mean Fractal Dimension', hint: 'Coastline approximation - 1 (0–1)', tooltip: 'Complexity of the cell boundary shape' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, number> = {};
      for (const field of fields) {
        payload[field.key] = parseFloat(formData[field.key as keyof typeof formData]);
      }

      const response = await api.post('/api/screening/breast-cancer', payload);
      setResult(response.data.result);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string | Array<{msg: string}> } } };
      const detail = axiosError.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join('. '));
      } else {
        setError(detail || 'Screening failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (category: string) => {
    const colors: Record<string, string> = {
      low: 'var(--risk-low)',
      moderate: 'var(--risk-moderate)',
      high: 'var(--risk-high)',
      very_high: 'var(--risk-very-high)',
    };
    return colors[category] || 'var(--text-muted)';
  };

  const getExplanation = () => {
    if (!result?.explanation) return null;
    try { return JSON.parse(result.explanation); } catch { return null; }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({
      mean_radius: '', mean_texture: '', mean_perimeter: '', mean_area: '',
      mean_smoothness: '', mean_compactness: '', mean_concavity: '',
      mean_concave_points: '', mean_symmetry: '', mean_fractal_dimension: '',
    });
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <Link href="/dashboard/patient" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartPulse size={28} />
          Breast Cancer Risk Screening
        </h1>
        <p>Enter cell-nuclei measurements for a research-only risk assessment</p>
      </div>

      {/* Research-Only Disclaimer */}
      <div className="disclaimer-banner disclaimer-banner-danger" style={{ marginBottom: '1.5rem' }}>
        <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
        <strong>🔬 Research-Only AI Flag:</strong> This screening uses a research-only model trained on the
        Wisconsin Breast Cancer dataset. It requires cell-nuclei measurements from a biopsy sample.
        Results are NOT a diagnosis — clinician review is required.
      </div>

      {!result ? (
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="disclaimer-banner disclaimer-banner-danger" style={{ marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <div className="screening-form">
              {fields.map((field) => (
                <div key={field.key} className="form-group">
                  <label htmlFor={`bc-${field.key}`} className="form-label">
                    {field.label}
                    <span title={field.tooltip} style={{ cursor: 'help', marginLeft: '0.25rem', color: 'var(--info)' }}>ℹ️</span>
                  </label>
                  <input
                    id={`bc-${field.key}`}
                    type="number"
                    step="0.0001"
                    className="form-input"
                    placeholder={field.hint}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    required
                  />
                  <span className="form-hint">{field.hint}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Run Screening'}
              </button>
              <button type="reset" className="btn btn-secondary" onClick={resetForm}>
                Clear Form
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="screening-result">
          {/* Risk Gauge */}
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div className="risk-gauge">
              <div
                className="risk-gauge-circle"
                style={{ '--gauge-value': result.risk_score, '--gauge-color': getRiskColor(result.risk_category) } as React.CSSProperties}
              >
                <div className="risk-gauge-inner">
                  <div className="risk-gauge-score" style={{ color: getRiskColor(result.risk_category) }}>
                    {(result.risk_score * 100).toFixed(1)}%
                  </div>
                  <div className="risk-gauge-label">Risk Score</div>
                </div>
              </div>
              <span className={`badge badge-${result.risk_category}`} style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>
                {result.risk_category.replace('_', ' ')} Risk
              </span>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Model: {result.model_name} v{result.model_version} | {result.clinician_reviewed ? '✓ Clinician Reviewed' : '⏳ Awaiting Clinician Review'}
            </div>
          </div>

          {/* AI Disclaimer */}
          <div className="disclaimer-banner disclaimer-banner-danger">{result.ai_disclaimer}</div>

          {/* Escalation */}
          {(result.risk_category === 'high' || result.risk_category === 'very_high') && (
            <div className="disclaimer-banner disclaimer-banner-danger" style={{ borderColor: 'hsla(0, 72%, 55%, 0.5)' }}>
              🚨 <strong>ELEVATED RISK DETECTED — CLINICAL FOLLOW-UP RECOMMENDED</strong><br /><br />
              This is a preliminary screening estimate. Do not self-diagnose.<br /><br />
              <strong>Recommended:</strong> Schedule with your physician, bring these results, and follow their guidance for diagnostic imaging or biopsy.
            </div>
          )}

          {/* Feature Importance */}
          {getExplanation()?.feature_importance && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem' }}>Feature Importance</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Factors that most influenced this screening estimate:
              </p>
              {Object.entries(getExplanation().feature_importance as Record<string, number>).map(([name, value]) => (
                <div key={name} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{name.replace(/_/g, ' ')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${value * 100}%`, background: 'linear-gradient(90deg, hsl(330, 60%, 50%), var(--danger))', borderRadius: 3, transition: 'width 0.6s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={resetForm} className="btn btn-secondary">Run Another Screening</button>
        </div>
      )}
    </div>
  );
}
