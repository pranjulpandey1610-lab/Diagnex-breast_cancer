import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-auto bg-white py-16 px-6 relative z-10 shadow-inner w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-8 mb-12">
        <div className="md:w-1/3 space-y-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Diagnex Logo" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
            <span className="text-xl font-black tracking-widest text-slate-800 uppercase">Diagnex</span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
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
            <li><Link href="/#how" className="hover:text-primary-600 transition-colors">How it Works</Link></li>
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
  );
}
