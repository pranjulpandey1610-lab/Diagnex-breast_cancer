"use client";
import Link from 'next/link';
import { 
  Activity, ArrowRight, FileLock2, MapPin, ScanLine, 
  ShieldCheck, ChevronRight, Ribbon, ClipboardList,
  HeartPulse, BadgeCheck, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const stats = [
  { value: '94%', label: 'Early detection survival rate', icon: HeartPulse },
  { value: 'HIPAA', label: 'Compliant & secure', icon: BadgeCheck },
];


const steps = [
  {
    step: '01',
    title: 'Describe What You Notice',
    body: 'Log a new breast-health concern in a calm, structured way — no medical jargon needed.',
    Icon: ClipboardList,
    color: 'from-blue-500 to-sky-400',
  },
  {
    step: '02',
    title: 'AI-Powered Risk Analysis',
    body: 'Our ML model analyzes your clinical inputs and flags risk patterns that need attention.',
    Icon: Brain,
    color: 'from-violet-500 to-purple-400',
  },
  {
    step: '03',
    title: 'Organize Your Records',
    body: 'Securely archive scan results, PDFs, and imaging reports in one private space.',
    Icon: FileLock2,
    color: 'from-emerald-500 to-teal-400',
  },
  {
    step: '04',
    title: 'Connect to a Specialist',
    body: 'Book an appointment or request a call with a verified specialist near you.',
    Icon: MapPin,
    color: 'from-pink-500 to-rose-400',
  },
];

const features = [
  { title: 'Describe a Change', body: 'A calm, structured way to record a new breast-health concern.', Icon: Activity, color: 'text-sky-500', bg: 'bg-sky-50 border-sky-100' },
  { title: 'Secure Report Archive', body: 'Keep PDF and image records together in one private space.', Icon: FileLock2, color: 'text-cyan-500', bg: 'bg-cyan-50 border-cyan-100' },
  { title: 'Breast Scan Support', body: 'Organize scan records without making image diagnoses.', Icon: ScanLine, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
  { title: 'Find a Specialist', body: 'Access clearly marked contact details when follow-up is needed.', Icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
];

const testimonials = [
  { name: 'Priya S.', role: 'Patient', quote: 'Diagnex helped me organize all my scan records before my appointment. I felt so much more prepared.' },
  { name: 'Dr. Meena R.', role: 'Oncologist', quote: 'A great tool for patients to self-monitor and arrive at consultations with structured information.' },
  { name: 'Anita K.', role: 'Survivor', quote: 'It gave me the clarity I needed to take early action. I wish I had this 5 years ago.' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[url('/bg-xray.jpg')] bg-cover bg-center bg-fixed opacity-[0.03] mix-blend-multiply pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Header />

      <main className="flex-1 flex flex-col items-center z-10">

        {/* ── HERO ── */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-16 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 space-y-6 text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-200 rounded-full px-4 py-1.5 text-sm font-semibold"
            >
              <Ribbon size={14} /> Breast Cancer Awareness Platform
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Breast health support,{' '}
              <span className="relative inline-block text-[#1E88E5]">
                organized
                <motion.span
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                  className="absolute -bottom-1 left-0 h-1.5 bg-gradient-to-r from-[#1E88E5] to-[#FF8A3D] rounded-full opacity-60"
                />
              </span>{' '}
              around <span className="text-[#FF8A3D]">safer next steps.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Clearer breast-health information. Diagnex helps you document changes, organize records, and connect to specialists — without replacing clinical care.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/auth/login"
                className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center justify-center gap-2"
              >
                Start Breast Awareness Check <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how"
                className="btn-secondary py-3.5 px-8 text-base hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center"
              >
                Explore How It Works
              </a>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 pt-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span><b className="text-slate-700">Private by design.</b> Secure prototype — not a diagnostic device.</span>
            </div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex justify-center relative"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-400/20 rounded-full blur-[80px] -z-10"
            />
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-primary-500/10 p-10 border border-slate-100 flex flex-col items-center gap-4">
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: 12, scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                className="absolute -top-4 -right-4 bg-pink-500 text-white p-2.5 rounded-full shadow-lg shadow-pink-500/30"
              >
                <Ribbon size={22} />
              </motion.div>
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                src="/logo.png"
                alt="Diagnex Logo"
                className="w-40 h-40 object-contain drop-shadow-xl"
              />
              <div className="text-center">
                <p className="font-black text-xl tracking-widest text-slate-800 uppercase">DIAGNEX</p>
                <p className="text-xs text-slate-400 tracking-wider uppercase">Intelligent Diagnostics</p>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full px-3 py-1 font-semibold">AI-Powered</span>
                <span className="text-xs bg-blue-50 text-[#1E88E5] border border-blue-200 rounded-full px-3 py-1 font-semibold">HIPAA Safe</span>
              </div>
            </div>
            <motion.img
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 0.07, x: 0 }}
              transition={{ delay: 1.5, duration: 2 }}
              src="/lady-sticker.jpg"
              alt=""
              className="absolute -right-16 top-0 w-40 h-auto pointer-events-none select-none mix-blend-multiply"
            />
          </motion.div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="w-full bg-white border-y border-slate-100 shadow-sm py-10 px-6 relative overflow-hidden">
          <img src="/lady-sticker.jpg" alt="" className="absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-auto pointer-events-none select-none mix-blend-multiply opacity-[0.05]" />
          <img src="/lady-sticker.jpg" alt="" className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-auto pointer-events-none select-none mix-blend-multiply opacity-[0.05] scale-x-[-1]" />
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                  <stat.icon size={20} className="text-[#1E88E5]" />
                </div>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="w-full max-w-6xl mx-auto px-6 py-24 relative">
          <img src="/lady-sticker.jpg" alt="" className="absolute right-0 top-10 w-52 h-auto pointer-events-none select-none mix-blend-multiply opacity-[0.06]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-[#1E88E5] font-bold tracking-wider text-sm uppercase">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Four simple steps to clarity</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">From noticing a change to connecting with a specialist — Diagnex guides you every step of the way.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                whileHover={{ y: -6 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                  <step.Icon size={24} className="text-white" />
                </div>
                <span className="text-5xl font-black text-slate-100 leading-none">{step.step}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="w-full bg-white border-t border-slate-100 py-24 px-6 relative overflow-hidden">
          <img src="/lady-sticker.jpg" alt="" className="absolute left-4 bottom-8 w-44 h-auto pointer-events-none select-none mix-blend-multiply opacity-[0.06] -rotate-6" />
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-[#1E88E5] font-bold tracking-wider text-sm uppercase">Platform Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Everything you need in one place</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(30,136,229,0.12)' }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-slate-50 rounded-3xl p-8 border border-slate-200 group transition-all duration-300 flex items-start gap-6 relative overflow-hidden"
                >
                  <div className={`shrink-0 w-14 h-14 rounded-2xl border ${feature.bg} flex items-center justify-center`}>
                    <feature.Icon className={feature.color} size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.body}</p>
                  </div>
                  <span className="absolute bottom-4 right-6 text-5xl font-black text-slate-200 group-hover:text-slate-300 transition-colors leading-none">0{i+1}</span>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24 relative">
          <img src="/lady-sticker.jpg" alt="" className="absolute left-0 top-0 w-40 h-auto pointer-events-none select-none mix-blend-multiply opacity-[0.07] rotate-12" />
          <img src="/lady-sticker.jpg" alt="" className="absolute right-0 bottom-0 w-40 h-auto pointer-events-none select-none mix-blend-multiply opacity-[0.07] -rotate-6 scale-x-[-1]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-[#1E88E5] font-bold tracking-wider text-sm uppercase">Real Voices</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Trusted by patients & doctors</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#FF8A3D" className="text-[#FF8A3D]" />)}
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E88E5] to-sky-400 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#1E88E5] to-sky-500 rounded-[2.5rem] p-12 md:p-16 text-center text-white overflow-hidden shadow-2xl shadow-[#1E88E5]/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <img src="/lady-sticker.jpg" alt="" className="absolute right-8 bottom-0 w-48 h-auto pointer-events-none select-none mix-blend-soft-light opacity-[0.12]" />
            <img src="/lady-sticker.jpg" alt="" className="absolute left-0 top-0 w-36 h-auto pointer-events-none select-none mix-blend-soft-light opacity-[0.10] scale-x-[-1] rotate-12" />
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold border border-white/20">
                <Ribbon size={14} /> Join the movement for early detection
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Take the first step<br />toward clarity today.
              </h2>
              <p className="text-white/80 max-w-xl mx-auto text-lg">
                Create your secure account, run the ML-powered assessment, and connect with specialists — all in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#1E88E5] font-bold py-3.5 px-8 rounded-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-base"
                >
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-semibold py-3.5 px-8 rounded-full border border-white/30 hover:bg-white/30 hover:-translate-y-1 transition-all duration-300 text-base"
                >
                  Sign In <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
