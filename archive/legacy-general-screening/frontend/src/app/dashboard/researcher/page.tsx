'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FlaskConical, Database, BarChart3 } from 'lucide-react';

interface ModelItem {
  id: number;
  name: string;
  version: string;
  dataset_version: string;
  description: string | null;
  metrics_json: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ResearcherDashboard() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.get('/api/admin/models');
        setModels(response.data);
      } catch (err) {
        console.error('Failed to load models', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const parseMetrics = (json: string | null) => {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={28} /> Researcher Dashboard
        </h1>
        <p>View model registry, versions, and performance metrics</p>
      </div>

      <div className="disclaimer-banner disclaimer-banner-info" style={{ marginBottom: '1.5rem' }}>
        🔬 <strong>Research Access:</strong> You have read-only access to the model registry and
        aggregated statistics. Individual patient data is not accessible from this view.
      </div>

      {/* Model Cards */}
      {loading ? (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="spinner" /> Loading models...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {models.map((model) => {
            const metrics = parseMetrics(model.metrics_json);
            return (
              <div key={model.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Database size={18} style={{ color: 'var(--primary-light)' }} />
                      {model.name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {model.description}
                    </p>
                  </div>
                  <span className={`badge ${model.is_active ? 'badge-low' : 'badge-high'}`}>
                    {model.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</div>
                    <div style={{ fontWeight: 600 }}>v{model.version}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dataset</div>
                    <div style={{ fontWeight: 600 }}>{model.dataset_version}</div>
                  </div>
                </div>

                {metrics && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <BarChart3 size={12} /> Performance Metrics
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {Object.entries(metrics).map(([key, value]) => (
                        <div key={key} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                            {typeof value === 'number' ? (value * 100).toFixed(1) : value}%
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Registered: {new Date(model.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
