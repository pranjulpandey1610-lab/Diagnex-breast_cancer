"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle, FileText, LoaderCircle, X } from "lucide-react";
import api from "@/lib/api";

type State = { side: string | null; location: string[]; symptoms: string[]; context: string[] };
const blank: State = { side: null, location: [], symptoms: [], context: [] };

function SummaryContent() {
  const router = useRouter(); const params = useSearchParams(); const sessionId = params.get("session_id");
  const [state, setState] = useState<State>(blank); const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const [result, setResult] = useState<{ category: string; level: string; completion: number; action: string; assessmentOptions: string[]; disclaimer: string } | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    api.get(`/assistant/session/${sessionId}`).then(({ data }) => active && setState(data.cumulative_state || blank))
      .catch(() => active && setError("This private session could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [sessionId]);
  const remove = (key: keyof State, value: string) => setState((current) => key === "side" ? { ...current, side: null } : { ...current, [key]: current[key].filter((item) => item !== value) });
  const finalize = async () => {
    if (!sessionId || saving) return;
    setSaving(true); setError("");
    try { const { data } = await api.put(`/assistant/session/${sessionId}/summary`, { finalized_entities: state }); setResult({ category: data.triage_category, level: data.guidance_level, completion: data.information_completion_percent, action: data.recommended_action, assessmentOptions: data.assessment_options || [], disclaimer: data.disclaimer }); }
    catch { setError("We could not save this summary. Please review your session and try again."); }
    finally { setSaving(false); }
  };
<<<<<<< HEAD
  if (!sessionId) return <div className="glass-panel p-7 text-slate-700">No assistant session was selected.</div>;
  if (loading) return <div className="p-10 text-slate-500 flex gap-2"><LoaderCircle className="animate-spin" /> Loading your private summary…</div>;
  if (error && !state.symptoms.length) return <div className="glass-panel p-7 text-slate-700">{error}</div>;
  const groups: [keyof State, string, string][] = [["side", "Affected side", "bg-indigo-50 text-indigo-700 border-indigo-200"], ["symptoms", "Reported changes", "bg-rose-50 text-rose-700 border-rose-200"], ["location", "Location", "bg-sky-50 text-sky-700 border-sky-200"], ["context", "Timeline and context", "bg-amber-50 text-amber-700 border-amber-200"]];
  return <div className="max-w-4xl mx-auto space-y-8"><button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Back to assistant</button><section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"><div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6"><span className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></span><div><h1 className="text-2xl font-bold text-slate-800">Summary review</h1><p className="text-slate-500">Edit what you entered before saving it.</p></div></div><div className="space-y-6">{groups.map(([key, label, colors]) => { const values = key === "side" ? (state.side ? [state.side] : []) : state[key] as string[]; return <div key={key}><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</h2><div className="flex flex-wrap gap-3">{values.length ? values.map((value) => <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border shadow-sm ${colors}`} key={value}>{value}<button aria-label={`Remove ${value}`} disabled={Boolean(result)} onClick={() => remove(key, value)}><X size={14} /></button></span>) : <p className="text-sm text-slate-400 italic">Not specified</p>}</div></div>; })}</div>{error && <p role="alert" className="text-sm text-rose-700 mt-6">{error}</p>}{!result ? <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end"><button onClick={finalize} disabled={saving || !state.symptoms.length} className="btn-primary py-3 px-8 text-base">{saving ? "Saving…" : "Save summary and view next steps"}</button></div> : <div className="mt-10 pt-8 border-t border-slate-100"><div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white"><span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm mb-4"><CheckCircle size={16} className="text-emerald-400" /> Saved report</span><p className="text-teal-200 text-sm font-semibold">{result.level}</p><h2 className="text-3xl font-bold mb-2">{result.category}</h2><p className="text-slate-200 text-lg mb-5">{result.action}</p><div className="bg-white/10 rounded-xl p-4 mb-5"><p className="text-sm font-semibold">Information completeness: {result.completion}%</p><p className="text-xs text-slate-300 mt-1">This percentage shows how much of the guided summary was completed. It is not a medical-risk, cancer-risk, or diagnostic percentage.</p></div>{result.assessmentOptions.length > 0 && <div className="bg-white/10 rounded-xl p-4 mb-5"><p className="font-semibold text-sm">A qualified clinician may consider</p><ul className="list-disc pl-5 mt-2 text-sm text-slate-200 space-y-1">{result.assessmentOptions.map((option) => <li key={option}>{option}</li>)}</ul></div>}<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3"><AlertTriangle className="text-amber-300 shrink-0" /><p className="text-amber-100 text-sm">{result.disclaimer} New or persistent breast changes should be assessed by a qualified clinician.</p></div><Link className="inline-flex mt-6 bg-white text-slate-900 font-semibold py-3 px-5 rounded-xl" href="/dashboard/specialists">Find a specialist</Link></div></div>}</section></div>;
=======

  const renderChip = (type: keyof StateType, value: string, colorClass: string) => (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ scale: 0.9, opacity: 0 }}
      layout
      key={value}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border shadow-sm ${colorClass}`}
    >
      <span className="capitalize">{value}</span>
      <button 
        onClick={() => removeSymptom(type, value)}
        disabled={!!triageResult}
        className="p-0.5 rounded-md hover:bg-black/10 transition-colors disabled:opacity-50"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Chat
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Summary Review</h1>
            <p className="text-slate-500">Review and edit your reported symptoms before finalizing.</p>
          </div>
        </div>

        <div className="space-y-6">
          
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Affected Side</h3>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {state.side && renderChip("side", state.side, "bg-sky-50 text-sky-700 border-sky-200")}
                {!state.side && <p className="text-sm text-slate-400 italic">None specified</p>}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Symptoms</h3>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {state.symptoms.map(s => renderChip("symptoms", s, "bg-rose-50 text-rose-700 border-rose-200"))}
                {state.symptoms.length === 0 && <p className="text-sm text-slate-400 italic">None specified</p>}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Locations</h3>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {state.location.map(s => renderChip("location", s, "bg-sky-50 text-sky-700 border-sky-200"))}
                {state.location.length === 0 && <p className="text-sm text-slate-400 italic">None specified</p>}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Context</h3>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {state.context.map(s => renderChip("context", s, "bg-amber-50 text-amber-700 border-amber-200"))}
                {state.context.length === 0 && <p className="text-sm text-slate-400 italic">None specified</p>}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {!triageResult ? (
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleFinalize}
              disabled={loading}
              className="btn-primary py-3 px-8 text-base shadow-lg shadow-blue-500/20"
            >
              {loading ? "Analyzing..." : "Finalize & Get Recommendation"}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 pt-8 border-t border-slate-100"
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-slate-900 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <AlertTriangle className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-md border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Analysis Complete
                </div>
                
                <h2 className="text-3xl font-bold mb-2">{triageResult.category}</h2>
                <p className="text-slate-300 text-lg mb-8 max-w-2xl">
                  Based on the structured symptoms you provided, this is the recommended next step.
                </p>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4 mb-8 backdrop-blur-sm">
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-200/90 text-sm leading-relaxed">
                    <strong>Medical Disclaimer:</strong> {triageResult.disclaimer} Always consult with a qualified healthcare provider for a proper diagnosis.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button className="bg-white text-slate-900 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Find a Specialist
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
>>>>>>> bcc08286bf2bb7aa73724fd69d45e537e6fea233
}

export default function SummaryPage() { return <Suspense fallback={<div className="p-10 text-slate-500">Loading summary…</div>}><SummaryContent /></Suspense>; }
