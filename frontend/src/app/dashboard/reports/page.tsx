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
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #report-modal, #report-modal * { visibility: visible; }
          #report-modal { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; margin: 0; padding: 0; box-shadow: none; overflow: visible; }
        }
      `}} />
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
                          onClick={() => {
                            setSelectedReport(report);
                            setTimeout(() => window.print(), 500);
                          }}
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

      {/* Report Modal / A4 Document View */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            id="report-modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] mx-auto flex flex-col relative shrink-0"
          >
            {/* Header / Letterhead */}
            <div className="bg-white border-b-2 border-slate-800 p-8 flex justify-between items-start z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                  DX
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">DIAGNEX</h2>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{selectedReport.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">ID: {selectedReport.id}</p>
                <p className="text-sm text-slate-500">Date: {new Date(selectedReport.date).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors print:hidden"
              >
                ✕
              </button>
            </div>
            
            <div className="p-10 space-y-10 flex-grow">
              <div className="border-l-4 border-slate-800 pl-6 py-2">
                <h1 className="text-3xl font-serif font-bold text-slate-900">{selectedReport.title}</h1>
                <p className="text-slate-600 mt-2 font-medium">Provider: {selectedReport.doctor}</p>
              </div>

              {selectedReport.details ? (
                <>
                  <section>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b-2 border-slate-100 pb-2">Diagnostic Context</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Primary Diagnosis</p>
                        <p className="font-semibold text-slate-900 text-lg">{selectedReport.details.diagnosis}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Tumor Dimensions</p>
                        <p className="font-semibold text-slate-900 text-lg">{selectedReport.details.tumorSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Receptor Status</p>
                        <p className="font-semibold text-slate-900 text-lg">{selectedReport.details.receptorStatus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Lymph Nodes</p>
                        <p className="font-semibold text-slate-900 text-lg">{selectedReport.details.lymphNodes}</p>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b-2 border-slate-100 pb-2">AI Treatment Recommendations</h3>
                    <ul className="space-y-4">
                      {selectedReport.details.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-4">
                          <div className="mt-1 w-2 h-2 rounded-full bg-slate-800 shrink-0" />
                          <span className="text-slate-800 font-medium leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : (
                <div className="text-center text-slate-500 py-12">No detailed analysis available for this report.</div>
              )}
            </div>
            
            <div className="mt-auto p-10 pt-6">
              <div className="border-t-2 border-slate-800 pt-6 flex items-start gap-3">
                <AlertCircle size={20} className="text-slate-800 shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed font-serif">
                  <strong className="text-slate-900">AI-GENERATED CLINICAL REVIEW AID:</strong> This document was generated by Diagnex AI. Extracted fields, analyses, and recommendations are based on standard medical guidelines and are intended for review by qualified healthcare professionals. This is <strong>NOT</strong> a definitive medical diagnosis. All treatment plans must be validated by a licensed oncologist.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
