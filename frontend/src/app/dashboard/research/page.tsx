"use client";
<<<<<<< HEAD
import {useState} from 'react'; import {Database,FileCheck2,ShieldCheck,Upload,AlertTriangle} from 'lucide-react';
export default function ResearchDatasets(){const [file,setFile]=useState('');const [validated,setValidated]=useState(false);return <section className="max-w-5xl mx-auto"><span className="eyebrow">RESEARCH DATA GOVERNANCE</span><h1 className="text-4xl font-bold text-slate-800 mt-3">Approved dataset registry</h1><p className="text-slate-500 mt-2 max-w-2xl">For approved, de-identified breast-cancer research datasets only. Patient reports, chats, and scans are never imported here.</p><div className="grid md:grid-cols-3 gap-4 my-7"><div className="glass-panel p-5"><Database className="text-sky-600 mb-3"/><b>0 approved datasets</b><p className="text-sm text-slate-500 mt-1">Ready for documented registration</p></div><div className="glass-panel p-5"><FileCheck2 className="text-teal-600 mb-3"/><b>Validation required</b><p className="text-sm text-slate-500 mt-1">No model training in this phase</p></div><div className="glass-panel p-5"><ShieldCheck className="text-teal-600 mb-3"/><b>Research-only guardrail</b><p className="text-sm text-slate-500 mt-1">Patient data is excluded</p></div></div><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5"><article className="glass-panel p-6"><h2 className="text-xl font-semibold">Register and validate a dataset</h2><p className="text-sm text-slate-500 mt-1">CSV import stays local. A manifest and quality report are created after validation.</p><div className="mt-5 grid gap-3"><input className="input-field" placeholder="Dataset ID (e.g. wisconsin-diagnostic-v1)"/><input className="input-field" placeholder="Dataset name"/><input className="input-field" placeholder="Source institution and license"/><input className="input-field" placeholder="Label definition (e.g. outcome column)"/><label className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer text-sm text-slate-500"><Upload className="mx-auto text-sky-600 mb-2"/> {file||'Choose an approved CSV dataset'}<input className="hidden" type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]?.name||'')}/></label><button className="btn-primary" onClick={()=>setValidated(true)} disabled={!file}>Validate research dataset</button></div></article><article className="glass-panel p-6"><h2 className="text-xl font-semibold">Data dictionary</h2><dl className="mt-4 text-sm divide-y divide-slate-100">{[['Dataset ID','Stable registry identifier'],['Features','Documented columns only'],['Label definition','Required outcome field'],['Class balance','Calculated on validation'],['De-identification','Must be verified'],['Limitations','Required before approval']].map(([a,b])=><div className="py-3" key={a}><dt className="font-semibold text-slate-700">{a}</dt><dd className="text-slate-500 mt-1">{b}</dd></div>)}</dl></article></div>{validated&&<article className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-6"><div className="flex gap-3"><FileCheck2 className="text-teal-700"/><div><h2 className="font-semibold text-teal-950">Local validation report created</h2><p className="text-sm text-teal-800 mt-1">Demo preview: schema, missing values, duplicates, identifier leakage, label availability, class balance, invalid ranges, and train/test contamination risk will be recorded in the dataset manifest.</p></div></div></article>}<div className="mt-5 flex gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-4"><AlertTriangle size={18}/><span>Approval is a governance decision. Validation does not authorize model training.</span></div></section>}
=======

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
>>>>>>> bcc08286bf2bb7aa73724fd69d45e537e6fea233
