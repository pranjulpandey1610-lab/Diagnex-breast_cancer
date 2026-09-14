import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
      <Link href="/" className="flex items-center gap-3 group">
        <img src="/logo.png" alt="Diagnex Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(30,136,229,0.2)] transition-transform group-hover:scale-105" />
        <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-primary-500 uppercase">Diagnex</span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-slate-100/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/50 shadow-sm z-50">
        <Link href="/" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-300">
          Home
        </Link>
        <a href="/#how" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-300">
          Features
        </a>
        <Link href="/dashboard" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-300">
          Secure Portal
        </Link>
        <Link href="/dashboard/specialists" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-300">
          Find Specialist
        </Link>
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
  );
}
