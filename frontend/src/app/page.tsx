"use client";
import Link from 'next/link';
import { Activity, ArrowRight, FileLock2, MapPin, ScanLine, ShieldCheck, Sparkles, ChevronRight, Ribbon } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

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
      <div className="absolute inset-0 bg-[url('/bg-xray.jpg')] bg-cover bg-center bg-fixed opacity-[0.03] mix-blend-multiply pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="Diagnex Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(30,136,229,0.2)] transition-transform group-hover:scale-105" />
          <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-primary-500 uppercase">Diagnex</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 bg-slate-100/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-200/50 shadow-sm z-50">
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

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-20 px-4 z-10">
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="max-w-4xl text-center space-y-8 mb-32 relative"
        >
          {/* Floating Slogans - Left Space */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.04, x: 0 }}
            transition={{ delay: 1, duration: 2 }}
            className="absolute top-10 -left-64 -rotate-12 text-5xl font-black whitespace-nowrap pointer-events-none select-none text-slate-900"
          >
            EARLY DETECTION SAVES LIVES
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.04, x: 0 }}
            transition={{ delay: 1.5, duration: 2 }}
            className="absolute top-64 -left-80 rotate-6 text-4xl font-black whitespace-nowrap pointer-events-none select-none text-slate-900"
          >
            SUPPORT & EMPOWERMENT
          </motion.div>

          {/* Floating Slogan and Lady Sticker - Right Space */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.03, x: 0 }}
            transition={{ delay: 1.2, duration: 2 }}
            className="absolute top-20 -right-60 rotate-12 text-5xl font-black whitespace-nowrap pointer-events-none select-none text-slate-900"
          >
            KNOWLEDGE IS POWER
          </motion.div>

          <motion.img 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 0.08, scale: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 2 }}
            src="/lady-sticker.jpg"
            alt=""
            className="absolute top-40 -right-72 w-80 h-auto pointer-events-none select-none mix-blend-multiply"
          />

          {/* Pulsing glow behind logo */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-400/20 rounded-full blur-[80px] -z-10"
          />

          {/* HUGE LOGO HIGHLIGHT */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center mb-8 mt-4 relative"
          >
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 12, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
              className="absolute -top-4 -right-4 z-20 bg-pink-500 text-white p-2 rounded-full shadow-lg shadow-pink-500/30 flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all cursor-default"
              title="Dedicated to Breast Cancer Awareness"
            >
              <Ribbon size={24} />
            </motion.div>
            <motion.img 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              src="/logo.png" 
              alt="Diagnex Logo" 
              className="w-48 h-48 md:w-72 md:h-72 object-contain drop-shadow-2xl" 
            />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mt-6"
          >
            Breast health support,<br />
            <span className="text-gradient font-black relative inline-block">
              organized around safer next steps.
              <motion.span 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full opacity-50"
              />
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Clearer breast-health information. Safer next steps. Diagnex helps you document changes and organize records—without replacing clinical care.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Link className="btn-primary py-3.5 px-8 text-lg w-full sm:w-auto shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group" href="/auth/login">
              <span className="relative z-10 flex items-center">Start Breast Awareness Check <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <a className="btn-secondary py-3.5 px-8 text-lg w-full sm:w-auto hover:-translate-y-1 transition-transform duration-300" href="#how">
              Explore How It Works
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex items-center justify-center gap-3 pt-12 text-sm text-slate-500"
          >
            <ShieldCheck size={20} className="text-emerald-500" />
            <span><b className="text-slate-700">Private by design.</b> Diagnex is a secure prototype. It is not a diagnosis.</span>
          </motion.div>
        </motion.section>

        {/* Features Grid */}
        <section id="how" className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
          {features.map((feature, i) => (
            <motion.article 
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(30,136,229,0.15)" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="glass-panel p-8 relative overflow-hidden group border-slate-200 transition-all duration-300"
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

      <Footer />
    </div>
  );
}
