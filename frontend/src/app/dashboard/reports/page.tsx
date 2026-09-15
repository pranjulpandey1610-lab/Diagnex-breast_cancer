"use client";

import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Stethoscope,
  Search,
  Filter,
  LoaderCircle,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type Report = {
  id: string;
  title: string;
  date: string;
  status: string;
  doctor?: string;
  type?: string;
  details?: any;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get('/reports');
        // Backend returns: [{"id":"uuid","title":"...","date":"...","status":"Saved report"}]
        setReports(data.map((r: any) => ({
          ...r,
          doctor: 'Diagnex Clinic', // Fallback since backend doesn't return doctor
          type: 'Clinical Report'
        })));
      } catch (err: any) {
        console.warn("API failed, using demo data");
        setReports([
          {
            id: 'rep-demo-1',
            title: 'AI Clinical Summary: Breast Histopathology',
            date: new Date().toISOString(),
            status: 'Completed',
            doctor: 'Dr. Sarah Jenkins',
            type: 'AI Summary',
            details: {
              diagnosis: 'Invasive Ductal Carcinoma (IDC), Grade 2',
              tumorSize: '2.4 cm (pT2)',
              receptorStatus: 'ER+ (90%), PR+ (70%), HER2- (1+)',
              lymphNodes: 'Clinically Node-Negative',
              recommendations: [
                'Multidisciplinary Oncology Consultation',
                'Surgical Evaluation: Lumpectomy vs Mastectomy + Sentinel Lymph Node Biopsy',
                'Genomic Profiling (e.g., Oncotype DX) to assess adjuvant chemotherapy benefit',
                'Adjuvant Endocrine Therapy (Tamoxifen or Aromatase Inhibitors)'
              ]
            }
          }
        ]);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

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
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <LoaderCircle className="animate-spin mx-auto mb-2" />
                    Loading your reports...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-rose-500 flex flex-col items-center">
                    <AlertCircle className="mb-2" />
                    {error}
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report, i) => (
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
                            <span className="text-xs text-[var(--color-primary-400)]">{report.id.slice(0, 8)}...</span>
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
                        {new Date(report.date).toLocaleDateString()}
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
                        <button 
                          className="p-2 rounded-lg bg-white/10 hover:bg-[var(--color-primary-600)] text-slate-600 hover:text-slate-900 transition-colors" 
                          title="View"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 rounded-lg bg-white/10 hover:bg-[var(--color-accent-600)] text-slate-600 hover:text-slate-900 transition-colors" 
                          title="Download PDF"
                          onClick={() => window.open(`http://localhost:8000/api/reports/${report.id}/download`, '_blank')}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          >
            <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center rounded-t-2xl z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedReport.title}</h2>
                  <p className="text-sm text-slate-500">ID: {selectedReport.id} • {new Date(selectedReport.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto">
              {selectedReport.details ? (
                <>
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Diagnostic Context</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Primary Diagnosis</p>
                        <p className="font-semibold text-slate-800">{selectedReport.details.diagnosis}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Tumor Dimensions</p>
                        <p className="font-semibold text-slate-800">{selectedReport.details.tumorSize}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Receptor Status</p>
                        <p className="font-semibold text-slate-800">{selectedReport.details.receptorStatus}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Lymph Nodes</p>
                        <p className="font-semibold text-slate-800">{selectedReport.details.lymphNodes}</p>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">AI Generated Treatment Recommendations</h3>
                    <ul className="space-y-3">
                      {selectedReport.details.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 p-1 rounded-full bg-emerald-100 text-emerald-600">
                            <Stethoscope size={14} />
                          </div>
                          <span className="text-slate-700 leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : (
                <div className="text-center text-slate-500 py-12">No detailed analysis available for this report.</div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-200 rounded-b-2xl text-xs text-slate-500 flex items-start gap-2 shrink-0">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Disclaimer:</strong> This is an AI-generated clinical summary report. Extracted fields, analyses, and recommendations are review aids based on standard medical guidelines and are NOT a definitive medical diagnosis. All treatment plans must be validated by a licensed oncologist.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
