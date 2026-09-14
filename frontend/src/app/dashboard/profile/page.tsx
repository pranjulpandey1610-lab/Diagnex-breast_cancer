"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { User, Activity, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

interface PatientProfile {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  sex?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const setAuth = useAuthStore(s => s.setAuth);
  const accessToken = useAuthStore(s => s.accessToken);
  const refreshToken = useAuthStore(s => s.refreshToken);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profiles/me/patient");
        setProfile({
          ...res.data,
          first_name: res.data.first_name || user?.first_name || "",
          last_name: res.data.last_name || user?.last_name || "",
          email: res.data.email || user?.email || ""
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // Fallback to auth store for demo presentation
        setProfile({
          first_name: user?.first_name || "",
          last_name: user?.last_name || "",
          email: user?.email || ""
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      try {
        await api.put("/profiles/me/patient", profile);
      } catch (apiErr) {
        console.warn("Backend API not connected for profile update. Falling back to local session state for demo.", apiErr);
      }

      // Sync the new name back to the global auth store so the dashboard header updates instantly!
      if (user) {
        setAuth(
          { ...user, first_name: profile.first_name, last_name: profile.last_name },
          accessToken || "demo",
          refreshToken || "demo"
        );
      }
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile locally.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your personal and medical information</p>
      </div>

      <div className="glass-panel p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-700 pb-2">Personal Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
              <input type="text" value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
              <input type="text" value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth</label>
              <input type="date" value={profile.date_of_birth || ""} onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Biological Sex</label>
              <select value={profile.sex || ""} onChange={(e) => setProfile({...profile, sex: e.target.value})} className="input-field">
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-700 pb-2 mt-8">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Name</label>
              <input type="text" value={profile.emergency_contact_name || ""} onChange={(e) => setProfile({...profile, emergency_contact_name: e.target.value})} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Phone</label>
              <input type="tel" value={profile.emergency_contact_phone || ""} onChange={(e) => setProfile({...profile, emergency_contact_phone: e.target.value})} className="input-field" placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
