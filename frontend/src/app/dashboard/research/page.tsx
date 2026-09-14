"use client";

import { motion } from 'framer-motion';
import { 
  Database,
  Activity,
  Cpu,
  LineChart,
  Server
} from 'lucide-react';

export default function ResearchPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Research & ML Models</h1>
          <p className="text-[var(--color-primary-400)]">Admin & Researcher Portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Dataset V2.4</h3>
              <p className="text-sm text-slate-500">14,204 validated records</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[var(--color-primary-500)]/20 text-[var(--color-primary-400)]">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Vision Model</h3>
              <p className="text-sm text-slate-500">Accuracy: 94.2%</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Server size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Celery Workers</h3>
              <p className="text-sm text-slate-500">3 Active Nodes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center min-h-[400px] border border-slate-200">
        <LineChart size={64} className="text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Metrics Dashboard</h2>
        <p className="text-slate-500 text-center max-w-md">
          Live model training metrics and dataset validation runs will appear here once background workers are initialized.
        </p>
      </div>
    </div>
  );
}
