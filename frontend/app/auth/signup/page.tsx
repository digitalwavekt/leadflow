'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import useAuthStore from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'designer' as 'designer' | 'client',
  });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      await register(form);
      if (form.role === 'designer') router.push('/designer/dashboard');
      else router.push('/client');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(124,92,252,0.1),transparent_70%)] pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="font-head text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            LeadFlow
          </Link>
          <h1 className="font-head text-2xl font-bold mt-4 mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm">Get 3 free credits on signup</p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-bg-3 rounded-xl mb-5">
            {(['designer', 'client'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => update('role', r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  form.role === r ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {r === 'designer' ? '🎨 Designer' : '🏠 I Need a Designer'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210" required />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          {form.role === 'designer' && (
            <div className="mt-5 space-y-1.5">
              {['3 free credits on signup', 'Access to all verified leads', 'Real-time notifications'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle size={11} className="text-green-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
