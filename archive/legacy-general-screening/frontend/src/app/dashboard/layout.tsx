'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, getDashboardPath } from '@/lib/auth';
import {
  LayoutDashboard,
  Stethoscope,
  HeartPulse,
  Upload,
  LogOut,
  Shield,
  Users,
  FileSearch,
  ClipboardCheck,
  Activity,
  FlaskConical,
} from 'lucide-react';

const roleNavItems: Record<string, Array<{ label: string; href: string; icon: React.ReactNode; section?: string }>> = {
  patient: [
    { label: 'Dashboard', href: '/dashboard/patient', icon: <LayoutDashboard size={18} /> },
    { section: 'Screening', label: '', href: '', icon: null },
    { label: 'Diabetes Screening', href: '/dashboard/patient/screening/diabetes', icon: <Stethoscope size={18} /> },
    { label: 'Breast Cancer', href: '/dashboard/patient/screening/breast-cancer', icon: <HeartPulse size={18} /> },
    { section: 'Files', label: '', href: '', icon: null },
    { label: 'My Uploads', href: '/dashboard/patient/uploads', icon: <Upload size={18} /> },
  ],
  doctor: [
    { label: 'Dashboard', href: '/dashboard/doctor', icon: <LayoutDashboard size={18} /> },
    { section: 'Review', label: '', href: '', icon: null },
    { label: 'Pending Reviews', href: '/dashboard/doctor', icon: <ClipboardCheck size={18} /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { section: 'Management', label: '', href: '', icon: null },
    { label: 'Users', href: '/dashboard/admin', icon: <Users size={18} /> },
    { label: 'Audit Logs', href: '/dashboard/admin', icon: <Activity size={18} /> },
    { label: 'Models', href: '/dashboard/admin', icon: <FileSearch size={18} /> },
  ],
  researcher: [
    { label: 'Dashboard', href: '/dashboard/researcher', icon: <LayoutDashboard size={18} /> },
    { section: 'Research', label: '', href: '', icon: null },
    { label: 'Model Registry', href: '/dashboard/researcher', icon: <FlaskConical size={18} /> },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, fetchUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span style={{ color: 'var(--text-muted)' }}>Loading...</span>
      </div>
    );
  }

  if (!user) return null;

  const navItems = roleNavItems[user.role] || roleNavItems.patient;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Shield size={24} style={{ color: 'var(--primary-light)' }} />
          <h2>Diagnex</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={`section-${i}`} className="sidebar-section">
                  {item.section}
                </div>
              );
            }
            return (
              <Link
                key={item.href + i}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user.email}
            </div>
            <span className="badge badge-role" style={{ marginTop: '0.375rem' }}>
              {user.role}
            </span>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
