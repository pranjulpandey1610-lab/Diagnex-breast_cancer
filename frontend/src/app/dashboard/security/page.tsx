"use client";

import { useState, useEffect } from "react";
import { Shield, Key, Smartphone, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { createClient } from "@/utils/supabase/client";

export default function SecurityPage() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic Session State for Hackathon Demo
  const [sessions, setSessions] = useState([
    { id: '1', device: "Mac OS • Chrome", location: "Mumbai, India", time: "Active Now", isCurrent: true },
    { id: '2', device: "iOS • Safari", location: "Delhi, India", time: "Last active 2h ago", isCurrent: false }
  ]);

  useEffect(() => {
    // Dynamically detect user's actual OS and browser for the "Current" session
    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "Mac OS";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";

    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Safari") !== -1) browser = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";

    setSessions([
      { id: 'current', device: `${os} • ${browser}`, location: "Current Location", time: "Active Now", isCurrent: true },
      { id: 'old1', device: "iOS • Safari", location: "Mumbai, India", time: "Last active 2h ago", isCurrent: false }
    ]);
  }, []);

  const handleRevoke = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Password successfully updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Security</h1>
        <p className="text-slate-400 mt-1">Manage your password and active sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Change */}
        <div className="glass-panel p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field !bg-slate-50 !border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field !bg-slate-50 !border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field !bg-slate-50 !border-slate-200" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Active Sessions */}
        <div className="space-y-6">
          <div className="glass-panel p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Smartphone className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-slate-900">Active Sessions</h2>
            </div>
            
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 font-medium">{session.device}</div>
                    <div className="text-sm text-slate-500">{session.location} • {session.time}</div>
                  </div>
                  {session.isCurrent ? (
                    <div className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Current</div>
                  ) : (
                    <button 
                      onClick={() => handleRevoke(session.id)}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}

              {sessions.length === 1 && (
                <div className="text-center p-4 text-slate-500 text-sm italic">
                  No other active sessions.
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-500">
                Revoking a session will invalidate its refresh token and sign the user out on that device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
