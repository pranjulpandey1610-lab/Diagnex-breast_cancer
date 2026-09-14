"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  LayoutDashboard, 
  ClipboardCheck, 
  Upload, 
  FileText, 
  MapPin, 
  User, 
  LogOut, 
  Menu, 
  ShieldCheck,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Clinical',
    items: [
      { href: '/dashboard/awareness', label: 'Breast Awareness', icon: ClipboardCheck },
      { href: '/dashboard/imaging', label: 'Imaging & Scans', icon: Upload },
      { href: '/dashboard/reports', label: 'Saved Reports', icon: FileText },
    ]
  },
  {
    label: 'Archives & Uploads',
    items: [
      { href: '/dashboard/upload', label: 'Upload Reports', icon: Upload },
      { href: '/dashboard/archive', label: 'Scan Archive', icon: Database },
    ]
  },
  {
    label: 'Directory',
    items: [
      { href: '/dashboard/specialists', label: 'Specialists', icon: MapPin },
    ]
  },
  {
    label: 'Research',
    items: [
      { href: '/dashboard/research', label: 'ML Models & Data', icon: Database },
    ]
  },
  {
    label: 'Settings',
    items: [
      { href: '/dashboard/profile', label: 'Profile', icon: User },
      { href: '/dashboard/security', label: 'Security', icon: Lock },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const logout = useAuthStore(s => s.logout);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col sticky top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-[var(--color-surface-border)] z-20 shadow-sm"
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Diagnex Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(30,136,229,0.2)] transition-transform group-hover:scale-105" />
            {isSidebarOpen && <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-primary-500 uppercase">Diagnex</span>}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-6">
              {isSidebarOpen && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  {group.label}
                </p>
              )}
              <nav className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const isActive = path === href;
                  return (
                    <Link key={href} href={href} className="block">
                      <div className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                        ${isActive 
                          ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-500)]/20 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                      `}>
                        <Icon size={20} className={isActive ? 'text-[var(--color-primary-500)]' : ''} />
                        {isSidebarOpen && (
                          <span className="font-medium text-sm">{label}</span>
                        )}
                        {isActive && isSidebarOpen && (
                          <motion.div layoutId="active-nav-indicator" className="ml-auto">
                            <ChevronRight size={16} />
                          </motion.div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--color-surface-border)]">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="sticky top-0 z-10 h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-[var(--color-surface-border)] shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hidden md:block"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-bold text-[var(--color-primary-500)] tracking-widest uppercase mb-1">Diagnex Portal</p>
              <h2 className="text-xl font-bold text-slate-900 capitalize">
                {path.split('/').pop()?.replace('-', ' ') || 'Overview'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">HIPAA Compliant</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Framer Motion Wrapper for Page Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-lg border-t border-[var(--color-surface-border)] flex items-center justify-around px-2 z-50">
        {navGroups.flatMap(g => g.items).slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-1 ${path === href ? 'text-[var(--color-primary-500)]' : 'text-slate-400'}`}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
