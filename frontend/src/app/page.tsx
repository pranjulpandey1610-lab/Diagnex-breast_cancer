"use client";
import Link from 'next/link';
import { 
  Ribbon, CheckCircle2, ChevronRight, Activity, ScanLine, FileText, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-primary-50 font-sans">
      {/* Abstract Background Waves (CSS based approximation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="absolute w-full h-full text-primary-100/50" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="currentColor">
           <path d="M0,0 C300,200 600,-100 1440,300 L1440,800 L0,800 Z" />
           <path d="M0,800 C400,600 800,900 1440,500 L1440,800 L0,800 Z" fill="var(--color-primary-300)" opacity="0.1"/>
        </svg>
      </div>

      <Header />

      <main className="flex-1 flex flex-col justify-center px-6 lg:px-12 xl:px-20 z-10 relative">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          
          {/* Left Column - Copy & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold border border-primary-300/30">
              <Ribbon size={16} className="text-primary-500" />
              Breast Cancer Awareness Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-[4rem] xl:text-[5rem] font-bold text-primary-900 leading-[1.1] tracking-tight">
              Clarity for your <br/> breast health. <br/>
              Confidence for what <br/> comes next.
            </h1>

            {/* Subtext */}
            <p className="text-lg text-primary-700 max-w-lg leading-relaxed">
              Clearer breast-health information. Diagnex helps you document changes, organize records, and connect to specialists — without replacing clinical care.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-900 text-white rounded-xl font-semibold hover:bg-primary-900/90 transition-colors gap-2 group"
              >
                Start Breast Awareness Check
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#how"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border border-primary-900 text-primary-900 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
              >
                Explore How It Works
              </Link>
            </div>

            {/* Diagnostic Options */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               {[
                  { icon: FileText, label: "Mammogram" },
                  { icon: ScanLine, label: "Ultrasound" },
                  { icon: Activity, label: "MRI" }
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-white border border-primary-100 shadow-sm hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
                      <item.icon size={18} />
                    </div>
                    <span className="font-semibold text-primary-900">{item.label}</span>
                    <ChevronRight size={16} className="ml-auto text-primary-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                ))}
            </div>

            {/* Mini Features List */}
            <div className="flex flex-wrap gap-8 pt-8 border-b border-primary-100/50 pb-16">
              {[
                { icon: CheckCircle2, text: "Organize", sub: "Your records" },
                { icon: Activity, text: "Connect", sub: "With specialists" },
                { icon: ScanLine, text: "Make informed", sub: "Next steps" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-full text-primary-500">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary-900">{f.text}</div>
                    <div className="text-xs text-primary-700">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer Text Left */}
            <div className="flex gap-4 text-[10px] font-bold tracking-widest text-primary-700 uppercase">
              <span>Earlier Awareness</span>
              <span className="text-primary-300">|</span>
              <span>Clearer Insights</span>
              <span className="text-primary-300">|</span>
              <span>Brighter Tomorrows</span>
            </div>
          </motion.div>

          {/* Right Column - Illustration & Floating Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] flex items-center justify-center hidden lg:flex"
          >
            {/* Handwriting Text (Top Right) */}
            <div className="absolute top-0 right-10 rotate-[-5deg] font-['Caveat',cursive,serif] text-4xl text-primary-500/60 leading-tight z-10 italic">
              Stronger<br/>
              Healthier<br/>
              Brighter<br/>
              You ♡
            </div>

            {/* The Lady Illustration mapped to blue tint */}
            <img 
              src="/lady-sticker.jpg" 
              alt="Illustration" 
              className="absolute right-0 top-10 h-[100%] w-auto object-contain mix-blend-multiply opacity-50 grayscale contrast-125"
              style={{ filter: "sepia(1) hue-rotate(180deg) saturate(200%) opacity(0.4)" }} 
            />
            {/* Added a blue overlay to force the color palette on the existing sticker */}
            <div className="absolute inset-0 bg-primary-300 mix-blend-color opacity-30 pointer-events-none"></div>



            {/* Small Floating Quote Card */}
            <div className="absolute right-0 top-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-primary-900/5 p-5 w-40 border border-white z-20">
              <Heart size={16} fill="currentColor" className="text-primary-500 mb-3" />
              <p className="text-[11px] text-primary-900 font-semibold leading-relaxed">
                Awareness<br/>today for<br/>brighter<br/>tomorrows.
              </p>
            </div>
            
            {/* Bottom Right Text */}
            <div className="absolute bottom-10 right-0 text-right z-20">
              <div className="text-[10px] font-bold tracking-widest text-primary-700 uppercase">Care Today</div>
              <div className="text-[10px] font-bold tracking-widest text-primary-900 uppercase flex items-center justify-end gap-2 mt-1">
                Brighter Tomorrows <span className="w-8 h-px bg-primary-500 inline-block"></span>
              </div>
            </div>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
