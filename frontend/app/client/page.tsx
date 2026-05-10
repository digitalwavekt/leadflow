'use client';

import { useState } from 'react';
import { CheckCircle, ChevronRight, Loader2, Upload } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';
import { useRouter } from 'next/navigation';

const SERVICES = [
  'Interior Design',
  'Logo Design',
  'UI/UX Design',
  'Brand Identity',
  '3D Visualization',
  'Packaging Design',
  'Motion Design',
  'Other',
];

const STYLES = [
  { label: 'Modern', icon: '🏠' },
  { label: 'Natural', icon: '🌿' },
  { label: 'Luxury', icon: '💎' },
  { label: 'Minimal', icon: '◻️' },
  { label: 'Rustic', icon: '🪵' },
  { label: 'Industrial', icon: '⚙️' },
];

export default function ClientForm() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<any>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    service: '',
    budget: 200000,
    location: '',
    description: '',
    preferredStyle: '',
    videoUrl: '',
  });

  const update = (key: string, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const formatBudget = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  const submitLead = async () => {
    setIsLoading(true);

    try {
      const { data } = await api.post('/leads/create', {
        clientName: form.name,
        clientPhone: form.phone,
        service: form.service,
        budget: form.budget,
        location: form.location,
        description: form.description,
        preferredStyle: form.preferredStyle,
        videoUrl: form.videoUrl,
      });

      const lead = data?.lead || data?.data?.lead || data?.data || data;

      setSubmittedLead(lead);
      setStep(4);
    } catch (err: any) {
      console.error('Lead submission failed:', err);
      alert(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-5">
        <div className="mb-8">
          <div className="section-label">Post a Requirement</div>
          <h1 className="font-head text-3xl font-extrabold mt-1">
            Tell us what you need
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Your requirement will be saved in database and sent for admin
            verification.
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${s < step
                  ? 'bg-green-400'
                  : s === step
                    ? 'bg-purple-500'
                    : 'bg-white/8'
                }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="card p-7 animate-fade-in">
            <h2 className="font-head text-lg font-bold mb-5">Basic Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Your Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Rahul Gupta"
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Service Type</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('service', s)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.service === s
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="label">City / Location</label>
                <input
                  className="input"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="Bangalore, Karnataka"
                />
              </div>

              <div>
                <label className="label">
                  Budget:{' '}
                  <span className="text-purple-300 font-semibold">
                    {formatBudget(form.budget)}
                  </span>
                </label>

                <input
                  type="range"
                  min={10000}
                  max={2000000}
                  step={10000}
                  value={form.budget}
                  onChange={(e) => update('budget', parseInt(e.target.value))}
                  className="w-full mt-2 accent-purple-500"
                />

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹10K</span>
                  <span>₹20L</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.name || !form.phone || !form.service || !form.location}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card p-7 animate-fade-in">
            <h2 className="font-head text-lg font-bold mb-5">
              Describe Your Requirement
            </h2>

            <div className="mb-4">
              <label className="label">Tell us exactly what you need</label>
              <textarea
                className="input min-h-[140px] resize-y"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="e.g. I need a complete interior design for my 3BHK flat in Whitefield..."
              />

              <div
                className={`text-xs mt-1 ${form.description.length >= 20
                    ? 'text-green-400'
                    : 'text-gray-500'
                  }`}
              >
                {form.description.length}/2000 —{' '}
                {form.description.length < 20
                  ? 'Minimum 20 characters'
                  : '✓ Looks good'}
              </div>
            </div>

            <div className="mb-6">
              <label className="label">Upload a Reference Video Optional</label>
              <div
                className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500/40 transition-all"
                onClick={() =>
                  alert('Video upload can be connected with Cloudinary later.')
                }
              >
                <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                <div className="text-sm text-gray-400">
                  Drop your video or click to browse
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  MP4, MOV — up to 100MB
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-ghost flex-1 py-3"
              >
                ← Back
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={form.description.length < 20}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card p-7 animate-fade-in">
            <h2 className="font-head text-lg font-bold mb-2">
              Confirm Your Requirement
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Choose your preferred style and submit. Backend will save this in
              MongoDB.
            </p>

            <div className="bg-purple-500/8 border border-purple-500/20 rounded-2xl p-5 mb-5">
              <div className="text-xs font-semibold text-purple-300 mb-3">
                Requirement Summary
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Service</span>
                  <span>{form.service}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Location</span>
                  <span>{form.location}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Budget</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatBudget(form.budget)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-sm font-medium mb-3">
                Choose Your Preferred Style
              </div>

              <div className="grid grid-cols-3 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => update('preferredStyle', s.label)}
                    className={`rounded-xl border-2 overflow-hidden text-center transition-all ${form.preferredStyle === s.label
                        ? 'border-purple-500'
                        : 'border-white/8 hover:border-white/20'
                      }`}
                  >
                    <div className="bg-white/3 py-4 text-2xl">{s.icon}</div>
                    <div className="py-2 px-1 bg-surface-2">
                      <div className="text-xs font-medium">{s.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="btn-ghost flex-1 py-3"
              >
                ← Back
              </button>

              <button
                onClick={submitLead}
                disabled={isLoading}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {isLoading ? 'Submitting...' : 'Submit Lead →'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card p-10 text-center animate-fade-in">
            <CheckCircle size={52} className="text-green-400 mx-auto mb-4" />

            <h2 className="font-head text-2xl font-extrabold mb-2">
              Lead Submitted!
            </h2>

            <p className="text-gray-400 mb-6">
              Your requirement has been saved. Admin will verify it before it
              becomes live.
            </p>

            <div className="bg-bg-3 rounded-2xl p-4 text-sm text-left mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Lead ID</span>
                <span className="font-semibold">
                  #{submittedLead?._id || submittedLead?.id || 'Created'}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Service</span>
                <span>{submittedLead?.service || form.service}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Budget</span>
                <span className="text-yellow-400 font-semibold">
                  {formatBudget(submittedLead?.budget || form.budget)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="badge-gray text-xs">
                  {submittedLead?.status || 'pending'}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="btn-primary px-8 py-3"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}