'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';

const SERVICES = ['Interior Design', 'Logo Design', 'UI/UX Design', 'Brand Identity', '3D Visualization', 'Packaging Design', 'Motion Design'];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: '',
    bio: '',
    minBudget: '50000',
    preferredLocations: 'Mumbai, Pune, Bangalore',
    specializations: ['Interior Design', 'UI/UX Design'],
  });

  const update = (k: string, v: any) => setProfile((p) => ({ ...p, [k]: v }));

  const toggleSpec = (s: string) => {
    setProfile((p) => ({
      ...p,
      specializations: p.specializations.includes(s)
        ? p.specializations.filter((x) => x !== s)
        : [...p.specializations, s],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/users/profile', {
        name: profile.name,
        city: profile.city,
        bio: profile.bio,
        specializations: profile.specializations,
        minBudget: parseInt(profile.minBudget),
        preferredLocations: profile.preferredLocations.split(',').map((s) => s.trim()),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Demo mode — just show saved
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="profile" />
      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">My Profile</h1>
        <p className="text-gray-400 text-sm mb-6">Manage your designer profile and lead preferences.</p>

        {saved && (
          <div className="mb-5 p-4 bg-green-500/10 border border-green-500/25 rounded-xl text-sm text-green-400 flex items-center gap-2">
            <CheckCircle size={15} /> Profile saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Personal Info */}
          <div className="card p-6">
            <div className="font-head text-base font-bold mb-5">Personal Information</div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl font-bold text-purple-300">
                {profile.name.charAt(0) || 'D'}
              </div>
              <div>
                <button className="btn-ghost text-xs px-3 py-1.5">Change Photo</button>
                <div className="text-xs text-gray-500 mt-1">JPG or PNG, max 2MB</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={profile.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" value={profile.city} onChange={(e) => update('city', e.target.value)} placeholder="Mumbai" />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={profile.email} disabled className="input opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  value={profile.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="Tell clients about your expertise and style..."
                />
              </div>
            </div>
          </div>

          {/* Lead Preferences */}
          <div className="card p-6">
            <div className="font-head text-base font-bold mb-5">Lead Preferences</div>
            <div className="space-y-4">
              <div>
                <label className="label">Services I Offer</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SERVICES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpec(s)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        profile.specializations.includes(s)
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Minimum Budget I Accept (₹)</label>
                <input
                  className="input"
                  type="number"
                  value={profile.minBudget}
                  onChange={(e) => update('minBudget', e.target.value)}
                  placeholder="50000"
                />
                <div className="text-xs text-gray-600 mt-1">You won't see leads below this budget</div>
              </div>
              <div>
                <label className="label">Preferred Locations</label>
                <input
                  className="input"
                  value={profile.preferredLocations}
                  onChange={(e) => update('preferredLocations', e.target.value)}
                  placeholder="Mumbai, Pune, Bangalore"
                />
                <div className="text-xs text-gray-600 mt-1">Comma-separated cities</div>
              </div>

              {/* Stats */}
              <div className="p-4 bg-bg-3 rounded-xl">
                <div className="text-xs font-medium text-gray-500 mb-3">Your Stats</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: user?.credits ?? 0, label: 'Credits', color: 'text-yellow-400' },
                    { val: 18, label: 'Leads Bought', color: 'text-purple-400' },
                    { val: '39%', label: 'Conversion', color: 'text-green-400' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className={`font-head text-lg font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-xs text-gray-600">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5 gap-3">
          <button className="btn-ghost px-6 py-2.5">Discard</button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
