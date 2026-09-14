"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Demo mode deliberately keeps authentication local until Supabase is configured.
      setAuth({ id: 1, email: email || "demo@diagnex.local", is_active: true, email_verified: true, roles: [{ id: 1, name: "patient" }] }, "demo-access-token", "demo-refresh-token");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
      setLoading(false);
    }
  };

  const useDemoAccount = () => {
    setEmail("demo@diagnex.local");
    setAuth({ id: 1, email: "demo@diagnex.local", is_active: true, email_verified: true, roles: [{ id: 1, name: "patient" }] }, "demo-access-token", "demo-refresh-token");
    router.push("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-x-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <div className="p-4 bg-gradient-to-br from-sky-500/10 to-teal-500/10 border border-slate-200 rounded-2xl mb-5 shadow-sm backdrop-blur-md">
            <Activity className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-gradient">Diagnex</span>
          </h1>
          <p className="text-slate-500 font-medium">Secure Breast Health Screening</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to your account to continue</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-center gap-2"
            >
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 group">
              <span className="flex items-center gap-2 justify-center">
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>
          <button type="button" onClick={useDemoAccount} className="w-full mt-4 py-3 rounded-xl border border-sky-200 text-sky-700 font-semibold hover:bg-sky-50 transition-colors">
            Use Demo Account
          </button>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              New to Diagnex?{" "}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
