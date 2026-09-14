"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ClipboardCheck, 
  FileText, 
  MapPin, 
  Upload, 
  HeartPulse, 
  Clock3, 
  ShieldCheck,
  Activity,
  Database
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Hero Welcome Section */}
      <motion.section variants={item} className="glass-panel relative overflow-hidden rounded-3xl border border-[var(--color-surface-border)] p-10 md:p-14 bg-white shadow-lg shadow-primary-500/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] to-transparent z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[var(--color-accent-500)]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <span className="badge badge-neon">YOUR BREAST-HEALTH HUB</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              A clearer way to <br />
              <span className="text-gradient">keep track of your health.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Document changes, keep reports together, and find the right next step—at your own pace.
            </p>
            <div className="pt-4 flex gap-4 flex-wrap">
              <Link className="btn-primary" href="/dashboard/awareness">
                Start Breast Awareness Check <ArrowRight size={18} />
              </Link>
              <Link className="btn-secondary" href="/dashboard/imaging">
                Upload Scans
              </Link>
            </div>
          </div>
          
          {/* Orbital animation graphic */}
          <div className="hidden md:flex relative w-64 h-64 items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[280px] h-[280px] rounded-full border border-slate-200 border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-[200px] h-[200px] rounded-full border border-[var(--color-primary-500)]/30 border-t-transparent"
            />
            <div className="relative z-10 w-24 h-24 bg-[var(--color-primary-500)] rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-12">
              <HeartPulse size={48} className="text-white" />
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-0 glass-panel bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg border border-slate-200"
            >
              Private
            </motion.div>
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-8 left-0 glass-panel bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg border border-slate-200"
            >
              Organized
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Quick Stats Row */}
      <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "BREAST AWARENESS", stat: "Ready to begin", desc: "A guided check takes about 3 minutes.", href: "/dashboard/awareness", icon: ClipboardCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "SAVED REPORTS", stat: "2 records", desc: "Your latest record was saved today.", href: "/dashboard/reports", icon: FileText, color: "text-[var(--color-primary-600)]", bg: "bg-[var(--color-primary-50)]" },
          { title: "IMAGING & SCANS", stat: "3 files", desc: "Mammograms and MRIs secured.", href: "/dashboard/imaging", icon: Upload, color: "text-[var(--color-accent-600)]", bg: "bg-[var(--color-accent-50)]" }
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="group">
            <article className="glass-panel bg-white p-6 flex flex-col h-full border border-slate-200 hover:border-[var(--color-primary-500)]/50 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={16} className="text-slate-600" />
                </div>
              </div>
              <small className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">{stat.title}</small>
              <b className="text-xl text-slate-900 mb-2">{stat.stat}</b>
              <p className="text-sm text-slate-500 mt-auto">{stat.desc}</p>
            </article>
          </Link>
        ))}
      </motion.section>

      {/* Main Grid Content */}
      <motion.section variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions List */}
        <div className="lg:col-span-2 glass-panel bg-white border border-slate-200 p-8 rounded-3xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[var(--color-primary-600)] tracking-widest uppercase mb-2 block">START HERE</span>
              <h2 className="text-2xl font-bold text-slate-900">What would you like to do?</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { num: "01", icon: ClipboardCheck, title: "Describe a breast change", desc: "Use guided questions to organize what you have noticed.", href: "/dashboard/awareness" },
              { num: "02", icon: Upload, title: "Upload a medical scan", desc: "Add PDF, JPG, DICOM, or PNG records to your archive.", href: "/dashboard/imaging" },
              { num: "03", icon: MapPin, title: "Find a specialist", desc: "Browse public contact information for local support.", href: "/dashboard/specialists" },
              { num: "04", icon: Database, title: "Research & Models", desc: "Access the machine learning insights dashboard.", href: "/dashboard/research" }
            ].map((action, i) => (
              <Link key={i} href={action.href} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-[var(--color-primary-500)]/30 hover:shadow-md transition-all group">
                <div className="text-2xl font-bold text-slate-300 group-hover:text-[var(--color-primary-500)] transition-colors w-8">{action.num}</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:bg-[var(--color-primary-50)] group-hover:border-[var(--color-primary-200)] transition-colors">
                  <action.icon size={20} className="text-slate-500 group-hover:text-[var(--color-primary-600)]" />
                </div>
                <div className="flex-1">
                  <b className="text-slate-800 text-lg block mb-1 group-hover:text-[var(--color-primary-700)]">{action.title}</b>
                  <p className="text-sm text-slate-500">{action.desc}</p>
                </div>
                <div className="text-slate-400 group-hover:text-[var(--color-primary-500)] transform group-hover:translate-x-1 transition-all">
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <aside className="glass-panel bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)]" />
          
          <span className="text-xs font-bold text-[var(--color-accent-600)] tracking-widest uppercase mb-3 mt-2 block">A GENTLE REMINDER</span>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your experience matters.</h2>
          <p className="text-slate-600 leading-relaxed mb-8 flex-1">
            If you notice a new or persistent breast change, a qualified clinician can help assess it. Our tools are here to help you organize your thoughts and records before your visit.
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
            <div className="flex items-start gap-3">
              <Clock3 size={20} className="text-[var(--color-primary-600)] mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Take your time.</strong> You can save your progress and return to your information anytime.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck size={16} className="text-[var(--color-accent-500)]" />
            Diagnex is not a diagnosis.
          </div>
        </aside>

      </motion.section>
    </motion.div>
  );
}
