'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Stethoscope, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
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

export default function DiabetesScreeningPage() {
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    blood_pressure: '',
    skin_thickness: '',
    insulin: '',
    bmi: '',
    diabetes_pedigree: '',
    age: '',
  });
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fields = [
    { key: 'pregnancies', label: 'Number of Pregnancies', hint: '0–20', type: 'number', step: '1' },
    { key: 'glucose', label: 'Plasma Glucose (mg/dL)', hint: '0–300', type: 'number', step: '0.1' },
    { key: 'blood_pressure', label: 'Blood Pressure (mm Hg)', hint: 'Diastolic, 0–200', type: 'number', step: '0.1' },
    { key: 'skin_thickness', label: 'Skin Thickness (mm)', hint: 'Triceps fold, 0–100', type: 'number', step: '0.1' },
    { key: 'insulin', label: 'Insulin (mu U/ml)', hint: '2-hour serum, 0–900', type: 'number', step: '0.1' },
    { key: 'bmi', label: 'BMI (kg/m²)', hint: '0–70', type: 'number', step: '0.1' },
    { key: 'diabetes_pedigree', label: 'Diabetes Pedigree Function', hint: '0–3.0', type: 'number', step: '0.001' },
    { key: 'age', label: 'Age (years)', hint: '1–120', type: 'number', step: '1' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        pregnancies: parseInt(formData.pregnancies),
        glucose: parseFloat(formData.glucose),
        blood_pressure: parseFloat(formData.blood_pressure),
        skin_thickness: parseFloat(formData.skin_thickness),
        insulin: parseFloat(formData.insulin),
        bmi: parseFloat(formData.bmi),
        diabetes_pedigree: parseFloat(formData.diabetes_pedigree),
        age: parseInt(formData.age),
      };

      const response = await api.post('/api/screening/diabetes', payload);
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
    try {
      const parsed = JSON.parse(result.explanation);
      return parsed;
    } catch {
      return null;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <Link href="/dashboard/patient" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Stethoscope size={28} />
          Diabetes Risk Screening
        </h1>
        <p>Enter your clinical measurements for a research-only risk assessment</p>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-banner" style={{ marginBottom: '1.5rem' }}>
        <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
        <strong>Screening Estimate Only:</strong> This form uses a research-only AI model. Results are NOT
        a medical diagnosis and require clinician review before any clinical decisions.
      </div>

      {!result ? (
        /* ── Screening Form ── */
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
                  <label htmlFor={`diabetes-${field.key}`} className="form-label">{field.label}</label>
                  <input
                    id={`diabetes-${field.key}`}
                    type={field.type}
                    step={field.step}
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
              <button type="reset" className="btn btn-secondary" onClick={() => setFormData({
                pregnancies: '', glucose: '', blood_pressure: '', skin_thickness: '',
                insulin: '', bmi: '', diabetes_pedigree: '', age: '',
              })}>
                Clear Form
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── Result Display ── */
        <div className="screening-result">
          {/* Risk Gauge */}
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div className="risk-gauge">
              <div
                className="risk-gauge-circle"
                style={{
                  '--gauge-value': result.risk_score,
                  '--gauge-color': getRiskColor(result.risk_category),
                } as React.CSSProperties}
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
          <div className="disclaimer-banner disclaimer-banner-danger">
            {result.ai_disclaimer}
          </div>

          {/* Escalation Guidance for High Risk */}
          {(result.risk_category === 'high' || result.risk_category === 'very_high') && (
            <div className="disclaimer-banner disclaimer-banner-danger" style={{ borderColor: 'hsla(0, 72%, 55%, 0.5)' }}>
              🚨 <strong>ELEVATED RISK DETECTED — CLINICAL FOLLOW-UP RECOMMENDED</strong>
              <br /><br />
              Your screening results indicate a potentially elevated risk level. This is a
              preliminary screening estimate and does NOT mean you have been diagnosed.
              <br /><br />
              <strong>Recommended next steps:</strong>
              <ol style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li>Schedule an appointment with your primary care physician.</li>
                <li>Bring these screening results to your clinician for review.</li>
                <li>Your clinician may order additional diagnostic tests.</li>
                <li>Do not self-diagnose or self-treat based on these results alone.</li>
              </ol>
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
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {name.replace(/_/g, ' ')}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${value * 100}%`,
                      background: `linear-gradient(90deg, var(--primary), var(--accent))`,
                      borderRadius: 3,
                      transition: 'width 0.6s ease-out',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Screening Button */}
          <button
            onClick={() => {
              setResult(null);
              setFormData({
                pregnancies: '', glucose: '', blood_pressure: '', skin_thickness: '',
                insulin: '', bmi: '', diabetes_pedigree: '', age: '',
              });
            }}
            className="btn btn-secondary"
          >
            Run Another Screening
          </button>
        </div>
      )}
    </div>
  );
}
