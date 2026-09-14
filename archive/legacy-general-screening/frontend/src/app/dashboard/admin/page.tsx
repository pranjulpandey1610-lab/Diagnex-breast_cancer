'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Shield, Users, Activity, FileSearch, BarChart3 } from 'lucide-react';

interface SystemStats {
  total_users: number;
  active_users: number;
  total_screenings: number;
  pending_reviews: number;
  total_uploads: number;
  screenings_by_type: Record<string, number>;
  users_by_role: Record<string, number>;
}

interface UserItem {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuditLogItem {
  id: number;
  user_id: number | null;
  role: string;
  action: string;
  resource: string;
  resource_id: string | null;
  ip_address: string | null;
  timestamp: string;
}

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'models'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, auditRes, modelsRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/users/'),
          api.get('/api/admin/audit-logs?limit=50'),
          api.get('/api/admin/models'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setAuditLogs(auditRes.data);
        setModels(modelsRes.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to change role', err);
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      await api.patch(`/api/users/${userId}/active`, { is_active: !isActive });
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
    } catch (err) {
      console.error('Failed to toggle active', err);
    }
  };

  if (loading) {
    return <div className="loading-page"><div className="spinner" /> Loading...</div>;
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { key: 'users', label: 'Users', icon: <Users size={16} /> },
    { key: 'audit', label: 'Audit Logs', icon: <Activity size={16} /> },
    { key: 'models', label: 'Models', icon: <FileSearch size={16} /> },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={28} /> Admin Dashboard
        </h1>
        <p>System management, user administration, and audit oversight</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.total_users}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">{stats.active_users}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Screenings</div>
              <div className="stat-value">{stats.total_screenings}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Reviews</div>
              <div className="stat-value" style={{ color: stats.pending_reviews > 0 ? 'var(--warning)' : undefined }}>
                {stats.pending_reviews}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Uploads</div>
              <div className="stat-value">{stats.total_uploads}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: '0.75rem' }}>Screenings by Type</h3>
              {Object.entries(stats.screenings_by_type).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{type.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
              {Object.keys(stats.screenings_by_type).length === 0 && (
                <p style={{ color: 'var(--text-muted)' }}>No screenings yet.</p>
              )}
            </div>
            <div className="glass-card">
              <h3 style={{ marginBottom: '0.75rem' }}>Users by Role</h3>
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="badge badge-role">{role}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="form-input"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', width: 'auto' }}
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                      <option value="researcher">Researcher</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-low' : 'badge-high'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>{log.user_id || 'system'}</td>
                  <td><span className="badge badge-role">{log.role}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{log.action}</td>
                  <td>{log.resource}{log.resource_id ? ` #${log.resource_id}` : ''}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Version</th>
                <th>Dataset</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id}>
                  <td style={{ fontWeight: 600 }}>{model.name}</td>
                  <td><span className="badge badge-info">v{model.version}</span></td>
                  <td>{model.dataset_version}</td>
                  <td><span className={`badge ${model.is_active ? 'badge-low' : 'badge-high'}`}>{model.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>{new Date(model.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
