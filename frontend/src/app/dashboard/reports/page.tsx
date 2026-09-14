"use client";

import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Stethoscope,
  Search,
  Filter
} from 'lucide-react';

const reports = [
  { id: 'REP-1042', date: 'Oct 24, 2026', title: 'Annual Mammography Summary', doctor: 'Dr. Sarah Chen', type: 'Clinical Report' },
  { id: 'REP-1041', date: 'Jun 15, 2026', title: 'Breast MRI Analysis', doctor: 'Dr. Michael Roberts', type: 'Radiology Report' },
  { id: 'REP-1038', date: 'Jan 10, 2026', title: 'Symptom Triage Assessment', doctor: 'Diagnex AI', type: 'System Generated' }
];

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Saved Reports</h1>
          <p className="text-slate-500">Access your clinical summaries and radiology reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="input-field pl-10 w-64"
            />
          </div>
          <button className="btn-secondary px-3">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, i) => (
                <motion.tr 
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-slate-200 hover:bg-white transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 text-blue-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">{report.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[var(--color-primary-400)]">{report.id}</span>
                          <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full border border-gray-600/50">
                            {report.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Calendar size={14} className="text-gray-500" />
                      {report.date}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Stethoscope size={14} className="text-gray-500" />
                      {report.doctor}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg bg-white/10 hover:bg-[var(--color-primary-600)] text-slate-600 hover:text-slate-900 transition-colors" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 rounded-lg bg-white/10 hover:bg-[var(--color-accent-600)] text-slate-600 hover:text-slate-900 transition-colors" title="Download PDF">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
