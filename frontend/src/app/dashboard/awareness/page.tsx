"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldAlert,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

const symptomsList = [
  { id: 'lump', label: 'New lump or thickening in the breast or underarm' },
  { id: 'size', label: 'Change in size, shape, or curve of the breast' },
  { id: 'skin', label: 'Skin changes (dimpling, puckering, redness, or scaling)' },
  { id: 'nipple', label: 'Nipple changes (inversion, discharge, or pain)' },
  { id: 'pain', label: 'Persistent breast pain not related to menstrual cycle' }
];

export default function AwarenessPage() {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (step === 1) {
      setIsAnalyzing(true);
      try {
        const { data } = await api.post("/screenings/breast_cancer", { 
          payload: { symptoms: selectedSymptoms } 
        });
        setResult(data.result);
        setStep(2);
      } catch (err) {
        console.error("Failed to submit screening", err);
        // Fallback for demo purposes if backend fails
        setResult({
          outcome_category: selectedSymptoms.length > 0 ? 'needs_review' : 'normal',
          safe_result_text: selectedSymptoms.length > 0 
            ? 'Based on your reported symptoms, we advise consulting a specialist.' 
            : 'It is great that you are monitoring your breast health.'
        });
        setStep(2);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl flex items-center gap-6 relative overflow-hidden border-b-4 border-[var(--color-primary-500)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--color-primary-500)]/20 to-transparent blur-3xl" />
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-500)]/20 flex items-center justify-center border border-[var(--color-primary-500)]/30 shrink-0">
          <ClipboardCheck size={32} className="text-[var(--color-primary-400)]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Breast Awareness Session</h1>
          <p className="text-slate-500">Regular self-checks help you understand what is normal for your body.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Have you noticed any of the following?</h2>
                <p className="text-sm text-slate-500">Select all that apply to your current situation.</p>
              </div>

              <div className="grid gap-3">
                {symptomsList.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left
                      ${selectedSymptoms.includes(symptom.id) 
                        ? 'bg-[var(--color-primary-500)]/20 border-[var(--color-primary-500)]/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                        : 'bg-white border-slate-200 hover:bg-white/10'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${selectedSymptoms.includes(symptom.id)
                        ? 'border-[var(--color-primary-400)] bg-[var(--color-primary-500)]/30 text-[var(--color-primary-400)]'
                        : 'border-gray-500'}`}
                    >
                      {selectedSymptoms.includes(symptom.id) && <CheckCircle2 size={16} />}
                    </div>
                    <span className={`font-medium ${selectedSymptoms.includes(symptom.id) ? 'text-slate-900' : 'text-slate-600'}`}>
                      {symptom.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest">Step 1 of 2</span>
                <button 
                  onClick={handleNext}
                  disabled={isAnalyzing}
                  className="btn-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Continue to Results <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
              {result?.outcome_category !== 'normal' && result?.outcome_category !== 'routine' ? (
                // Symptoms Reported View
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/20 to-transparent blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 text-amber-500 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                      <ShieldAlert size={28} />
                      <div>
                        <h3 className="text-lg font-bold">Clinical Assessment Recommended</h3>
                        <p className="text-sm text-amber-600">{result?.safe_result_text || 'Based on your reported symptoms, we advise consulting a specialist.'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Report Summary</h4>
                      <ul className="space-y-3">
                        {selectedSymptoms.map(id => {
                          const s = symptomsList.find(x => x.id === id);
                          return (
                            <li key={id} className="flex items-start gap-3 text-slate-700">
                              <AlertCircleIcon size={18} className="text-amber-500 mt-0.5 shrink-0" />
                              <span>{s?.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
                      <Link href="/dashboard/specialists" className="btn-primary flex-1 text-center justify-center flex items-center gap-2">
                        Find a Specialist <ArrowRight size={18} />
                      </Link>
                      <button onClick={() => setStep(1)} className="btn-secondary">
                        Edit Responses
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // No Symptoms View
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 to-transparent blur-3xl" />
                  <div className="relative z-10 space-y-6 text-center py-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-4 border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">No Concerns Reported</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        {result?.safe_result_text || 'It is great that you are monitoring your breast health. Remember to perform regular checks and schedule routine screenings as recommended by your doctor.'}
                      </p>
                    </div>
                    <div className="pt-8">
                      <Link href="/dashboard" className="btn-secondary">
                        Return to Dashboard
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
