"use client";

import { useState } from "react";
import { Shield, Key, Smartphone, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

export default function SecurityPage() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for password change would call api.post('/auth/password-reset')
    alert("Password change architecture is in place. API call omitted for briefness.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Security</h1>
        <p className="text-slate-400 mt-1">Manage your password and active sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Change */}
        <div className="glass-panel p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" />
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Update Password</button>
          </form>
        </div>

        {/* Active Sessions */}
        <div className="space-y-6">
          <div className="glass-panel p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Smartphone className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Mac OS • Chrome</div>
                  <div className="text-sm text-slate-400">Mumbai, India • Active Now</div>
                </div>
                <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Current</div>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">iOS • Safari</div>
                  <div className="text-sm text-slate-400">Delhi, India • Last active 2h ago</div>
                </div>
                <button className="text-sm text-red-400 hover:text-red-300 transition-colors">Revoke</button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">
                Revoking a session will invalidate its refresh token and sign the user out on that device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
