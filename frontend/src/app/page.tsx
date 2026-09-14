"use client";
import Link from 'next/link';
import { Activity, ArrowRight, FileLock2, MapPin, ScanLine, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Describe a Change',
    body: 'A calm, structured way to record a new breast-health concern.',
    Icon: Activity,
    color: 'text-sky-400'
  },
  {
    title: 'Secure Report Archive',
    body: 'Keep PDF and image records together in one private space.',
    Icon: FileLock2,
    color: 'text-cyan-400'
  },
  {
    title: 'Breast Scan Record Support',
    body: 'Organize scan records without making image diagnoses.',
    Icon: ScanLine,
    color: 'text-blue-400'
  },
  {
    title: 'Find a Specialist',
    body: 'Access clearly marked contact details when follow-up is needed.',
    Icon: MapPin,
    color: 'text-emerald-400'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-slate-50">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Diagnex Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(30,136,229,0.2)] transition-transform group-hover:scale-105" />
          <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-primary-500 uppercase">Diagnex</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <a href="#how" className="hover:text-primary-600 transition-colors">How it Works</a>
          <Link href="/dashboard" className="hover:text-primary-600 transition-colors">Portal</Link>
          <Link href="/dashboard/specialists" className="hover:text-primary-600 transition-colors">Directory</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium hidden sm:block" href="/auth/login">
            Sign In
          </Link>
          <Link className="btn-primary text-sm px-5 py-2.5 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all" href="/auth/login">
            Start a Check <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-4 z-10">
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl text-center space-y-8 mb-32"
          {/* HUGE LOGO HIGHLIGHT */}
          <div className="flex flex-col items-center justify-center mb-10 mt-4">
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              src="/logo.png" 
              alt="Diagnex Logo Big" 
              className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl mb-6" 
            />
            <h1 className="text-6xl md:text-8xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-primary-600 to-blue-900 uppercase">
              DIAGNEX
            </h1>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/20 bg-primary-500/5 backdrop-blur-md text-sm text-primary-600 mx-auto">
            <Sparkles size={16} className="text-accent-500" /> 
            Intelligent Diagnostics
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mt-6">
            Breast health support,<br />
            <span className="text-gradient font-black">organized around safer next steps.</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Clearer breast-health information. Safer next steps. Diagnex helps you document changes and organize records—without replacing clinical care.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link className="btn-primary py-3.5 px-8 text-lg w-full sm:w-auto shadow-lg shadow-primary-500/20" href="/auth/login">
              Start Breast Awareness Check <ArrowRight size={20} className="ml-2" />
            </Link>
            <a className="btn-secondary py-3.5 px-8 text-lg w-full sm:w-auto" href="#how">
              Explore How It Works
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 pt-12 text-sm text-slate-500">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span><b className="text-slate-700">Private by design.</b> Diagnex is a secure prototype. It is not a diagnosis.</span>
          </div>
        </motion.section>

        {/* Features Grid */}
        <section id="how" className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
          {features.map((feature, i) => (
            <motion.article 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel p-8 relative overflow-hidden group border-slate-200"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl">
                  <feature.Icon className={feature.color} size={28} />
                </div>
                <span className="text-5xl font-black text-slate-100 tracking-tighter">0{i+1}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h2>
              <p className="text-slate-600 leading-relaxed">{feature.body}</p>
            </motion.article>
          ))}
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-4xl mx-auto glass-panel p-12 text-center rounded-[2.5rem] border-primary-500/20 relative overflow-hidden bg-white shadow-xl shadow-primary-500/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5 opacity-50" />
          
          <div className="relative z-10 space-y-6">
            <span className="text-primary-600 font-bold tracking-wider text-sm uppercase">A more grounded experience</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Information you can understand, <br/>in a space that feels safe.
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              New or persistent breast changes should be assessed by a qualified clinician. Diagnex provides information organization and contact guidance only.
            </p>
            
            <div className="pt-6">
              <Link className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-500 transition-colors" href="/auth/register">
                Create your secure account <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 mt-auto bg-white py-16 px-6 relative z-10 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Diagnex Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-black tracking-widest text-slate-800 uppercase">Diagnex</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Clearer breast-health information. Safer next steps. Diagnex helps you document changes and organize records.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Platform</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/dashboard" className="hover:text-primary-600 transition-colors">Patient Portal</Link></li>
              <li><Link href="/dashboard/awareness" className="hover:text-primary-600 transition-colors">Symptom Checker</Link></li>
              <li><Link href="/dashboard/upload" className="hover:text-primary-600 transition-colors">Secure Uploads</Link></li>
              <li><Link href="/dashboard/specialists" className="hover:text-primary-600 transition-colors">Provider Directory</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Resources</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#how" className="hover:text-primary-600 transition-colors">How it Works</a></li>
              <li><Link href="/dashboard/research" className="hover:text-primary-600 transition-colors">ML Research Data</Link></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy & Security</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Company</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Team</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Contact</a></li>
              <li><a href="https://github.com/pranjulpandey1610-lab/Diagnex-breast_cancer" target="_blank" className="hover:text-primary-600 transition-colors">GitHub Repository</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-primary-500" /> © 2026 Diagnex. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Cookies</a>
          </div>
          <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-200 text-xs font-bold uppercase tracking-widest">
            Prototype Demo Mode
          </div>
        </div>
      </footer>
    </div>
  );
}
