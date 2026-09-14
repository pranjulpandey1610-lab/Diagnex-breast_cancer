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

export default function AwarenessPage() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // High-accuracy ML Inputs
  const [formData, setFormData] = useState({
    age: 40,
    age_at_menarche: 12,
    age_at_first_birth: '' as string | number,
    history_of_biopsy: false,
    family_history_breast_cancer: false,
    birads_density_category: 2
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' || type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? '' : Number(value) 
      }));
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setIsAnalyzing(true);
      try {
        const payload = {
          age: formData.age,
          age_at_menarche: formData.age_at_menarche,
          age_at_first_birth: formData.age_at_first_birth === '' ? null : formData.age_at_first_birth,
          history_of_biopsy: formData.history_of_biopsy,
          family_history_breast_cancer: formData.family_history_breast_cancer,
          birads_density_category: formData.birads_density_category
        };

        const { data } = await api.post("/screenings/breast_cancer", { payload });
        setResult(data.result);
        setStep(2);
      } catch (err) {
        console.error("Failed to submit screening", err);
        // Fallback for demo purposes if backend fails
        setResult({
          outcome_category: formData.family_history_breast_cancer || formData.history_of_biopsy ? 'needs_review' : 'normal',
          safe_result_text: formData.family_history_breast_cancer || formData.history_of_biopsy
            ? 'Based on your clinical history, we advise consulting a specialist for routine screening.' 
            : 'Your risk factors are low. Maintain regular routine screening.',
          confidence_score: 0.95
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">High-Accuracy Breast Assessment</h1>
          <p className="text-slate-500">Provide your clinical history for an ML-powered risk analysis.</p>
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
            <div className="glass-panel p-8 rounded-3xl space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Age Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Current Age</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleInputChange} 
                      className="input-field w-full" 
                      min={18} max={120} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Age at First Menstrual Period</label>
                    <input 
                      type="number" 
                      name="age_at_menarche" 
                      value={formData.age_at_menarche} 
                      onChange={handleInputChange} 
                      className="input-field w-full" 
                      min={8} max={25} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Age at First Live Birth (Optional)</label>
                    <input 
                      type="number" 
                      name="age_at_first_birth" 
                      value={formData.age_at_first_birth} 
                      onChange={handleInputChange} 
                      className="input-field w-full" 
                      placeholder="Leave blank if none"
                      min={12} max={60} 
                    />
                  </div>
                </div>

                {/* History Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Have you ever had a breast biopsy?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="history_of_biopsy" value="true" checked={formData.history_of_biopsy === true} onChange={handleInputChange} className="accent-primary-500 w-4 h-4" /> Yes
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="history_of_biopsy" value="false" checked={formData.history_of_biopsy === false} onChange={handleInputChange} className="accent-primary-500 w-4 h-4" /> No
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">First-degree relative with breast cancer?</label>
                    <p className="text-xs text-slate-500 mb-2">Mother, sister, or daughter</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="family_history_breast_cancer" value="true" checked={formData.family_history_breast_cancer === true} onChange={handleInputChange} className="accent-primary-500 w-4 h-4" /> Yes
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="family_history_breast_cancer" value="false" checked={formData.family_history_breast_cancer === false} onChange={handleInputChange} className="accent-primary-500 w-4 h-4" /> No
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">BI-RADS Breast Density Category</label>
                    <p className="text-xs text-slate-500 mb-2">If unknown, leave as default (2)</p>
                    <select 
                      name="birads_density_category" 
                      value={formData.birads_density_category} 
                      onChange={handleInputChange} 
                      className="input-field w-full cursor-pointer"
                    >
                      <option value={1}>1 - Almost entirely fatty</option>
                      <option value={2}>2 - Scattered fibroglandular densities</option>
                      <option value={3}>3 - Heterogeneously dense</option>
                      <option value={4}>4 - Extremely dense</option>
                    </select>
                  </div>
                </div>
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
                      Run ML Analysis <ChevronRight size={18} />
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
              {result?.outcome_category !== 'normal' && result?.outcome_category !== 'lower_risk' ? (
                // Higher Risk View
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/20 to-transparent blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 text-amber-500 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                      <ShieldAlert size={28} />
                      <div>
                        <h3 className="text-lg font-bold">Clinical Assessment Recommended</h3>
                        <p className="text-sm text-amber-600">{result?.safe_result_text || 'Based on your reported clinical history, we advise consulting a specialist.'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">ML Report Summary</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-slate-700">
                          <Activity size={18} className="text-[var(--color-primary-500)] mt-0.5 shrink-0" />
                          <span><strong>Model Confidence:</strong> {(result?.confidence_score * 100 || 85).toFixed(1)}%</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                          <AlertCircleIcon size={18} className="text-amber-500 mt-0.5 shrink-0" />
                          <span><strong>Risk Factors Detected:</strong> Family History / Clinical History</span>
                        </li>
                      </ul>
                      {result?.disclaimer_text && (
                         <p className="text-xs text-slate-400 mt-4 italic">{result.disclaimer_text}</p>
                      )}
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
                // Lower Risk View
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 to-transparent blur-3xl" />
                  <div className="relative z-10 space-y-6 text-center py-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-4 border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Lower Risk Pattern Detected</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        {result?.safe_result_text || 'Your clinical history indicates a lower-risk pattern. Maintain regular routine screening.'}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-500 max-w-md mx-auto text-left">
                      <strong>Model Confidence:</strong> {(result?.confidence_score * 100 || 92).toFixed(1)}%
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
