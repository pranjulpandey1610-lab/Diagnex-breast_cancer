'use client';

import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#how' },
  { label: 'Secure Portal', href: '/dashboard' },
  { label: 'Find Specialist', href: '/dashboard/specialists' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('#')[0]) && href.split('#')[0] !== '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        {pathname !== '/' && (
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-slate-100 bg-white border border-slate-200 text-slate-600 transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Diagnex Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(30,136,229,0.2)] transition-transform group-hover:scale-105" />
          <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-primary-500 uppercase">Diagnex</span>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-slate-100/80 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-slate-200/70 shadow-sm z-50">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${isActive(link.href)
                ? 'bg-white text-[#1E88E5] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            {link.label}
          </Link>
        ))}
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
