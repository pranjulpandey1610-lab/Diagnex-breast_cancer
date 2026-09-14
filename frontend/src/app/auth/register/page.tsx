"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "patient"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentStorage, setConsentStorage] = useState(false);
  const [consentResearch, setConsentResearch] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentStorage) {
      setError("You must consent to data storage to use the platform.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        setAuth({ id: 1, email: formData.email, is_active: true, email_verified: true, roles: [{ id: 1, name: "patient" }] }, data.session.access_token, data.session.refresh_token);
      } else {
        // Fallback for hackathon demo: If Supabase requires email confirmation, just let them in instantly
        document.cookie = "demo_mode=true; path=/";
        setAuth({ id: 1, email: formData.email, is_active: true, email_verified: true, roles: [{ id: 1, name: "patient" }] }, "demo-access-token", "demo-refresh-token");
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="w-full max-w-xl relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gradient-to-br from-sky-500/10 to-teal-500/10 border border-slate-200 rounded-2xl mb-4 shadow-sm backdrop-blur-md">
            <Activity className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-gradient">Join Diagnex</span>
          </h1>
          <p className="text-slate-500 font-medium">Secure Breast Health Screening</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 sm:p-10">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 ml-1">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-[var(--color-primary-500)] group-focus-within:-translate-y-0.5 group-focus-within:scale-110 text-slate-400">
                    <User className="h-5 w-5 drop-shadow-sm" />
                  </div>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="Jane" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 ml-1">Last Name</label>
                <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="input-field" placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-[var(--color-primary-500)] group-focus-within:-translate-y-0.5 group-focus-within:scale-110 text-slate-400">
                  <Mail className="h-5 w-5 drop-shadow-sm" />
                </div>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="name@example.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-[var(--color-primary-500)] group-focus-within:-translate-y-0.5 group-focus-within:scale-110 text-slate-400">
                  <Lock className="h-5 w-5 drop-shadow-sm" />
                </div>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-field" style={{ paddingLeft: '2.75rem' }} placeholder="••••••••" />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-2 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-sm">Data Privacy Consents</span>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" checked={consentStorage} onChange={e => setConsentStorage(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                    {consentStorage && <svg className="w-3.5 h-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors leading-snug">
                  I consent to the encrypted storage of my medical data on Diagnex servers. <span className="text-red-400">*</span>
                </span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" checked={consentResearch} onChange={e => setConsentResearch(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                    {consentResearch && <svg className="w-3.5 h-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors leading-snug">
                  I optionally consent to share my de-identified data for medical research purposes.
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 group">
              <span className="flex items-center gap-2 justify-center">
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign In here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
      </div>
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}
