'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Zap, Shield, Bell, Lock, BarChart2, RefreshCw, ArrowRight, Star, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Shield, color: 'bg-green-500/10 text-green-400', title: 'Verified Leads', desc: 'Every lead is manually reviewed by our team before going live. No fake inquiries, ever.' },
  { icon: Zap, color: 'bg-purple-500/10 text-purple-400', title: 'Real-Time Notifications', desc: 'Get instant alerts the moment a new lead matching your skills is verified and available.' },
  { icon: BarChart2, color: 'bg-yellow-500/10 text-yellow-400', title: 'AI Intent Scoring', desc: 'Our AI analyzes each lead and gives you an intent score so you know who\'s serious.' },
  { icon: Lock, color: 'bg-pink-500/10 text-pink-400', title: 'Lead Lock System', desc: 'Lock a lead for 2 minutes while you decide. No one else can buy it while you\'re reviewing.' },
  { icon: RefreshCw, color: 'bg-orange-500/10 text-orange-400', title: 'Credit Refunds', desc: 'If a lead turns out to be invalid, we refund your credits. No questions asked.' },
  { icon: Bell, color: 'bg-blue-500/10 text-blue-400', title: 'Rich Analytics', desc: 'Track ROI, conversion rates, and best-performing lead categories in your dashboard.' },
];

const STEPS = [
  { num: '01', title: 'Client Posts', desc: 'A client submits their design requirement — budget, location, style preference. Our AI analyzes intent instantly.' },
  { num: '02', title: 'We Verify', desc: 'Our team reviews and verifies the lead within hours. Only genuine, high-intent leads go live.' },
  { num: '03', title: 'You Close', desc: 'You get notified, lock the lead, buy it with credits, and contact the client directly. Done.' },
];

const TESTIMONIALS = [
  { name: 'Rajiv Kumar', role: 'Interior Designer, Bangalore', initials: 'RK', color: 'bg-purple-500/20 text-purple-300', quote: 'I closed ₹4.5L of work in my first month just from LeadFlow. The leads are actually serious — not time-wasters.', stars: 5 },
  { name: 'Priya Sharma', role: 'UI/UX Designer, Mumbai', initials: 'PS', color: 'bg-pink-500/20 text-pink-300', quote: 'Finally a platform that understands designers. The AI scoring tells me instantly whether a lead is worth pursuing.', stars: 5 },
  { name: 'Arjun Mehta', role: 'Logo Designer, Delhi', initials: 'AM', color: 'bg-green-500/20 text-green-300', quote: 'The credit refund system is a game-changer. I buy leads confidently knowing I won\'t lose money on bad ones.', stars: 4 },
];

const BLOG_POSTS = [
  { emoji: '🎨', cat: 'Growth', title: 'How to Close Interior Design Clients in 2025', excerpt: 'The scripts, follow-up sequences, and pricing strategies top designers use to win projects consistently.', read: '5 min', date: 'Apr 2025', bg: 'bg-purple-500/8' },
  { emoji: '💼', cat: 'Business', title: 'Setting Your Design Rates in Tier 2 Cities', excerpt: 'A data-driven guide to pricing your services based on market demand and lead quality signals.', read: '7 min', date: 'Mar 2025', bg: 'bg-green-500/8' },
  { emoji: '🤖', cat: 'AI & Tools', title: 'How AI Intent Scoring Works at LeadFlow', excerpt: 'A behind-the-scenes look at how we analyze lead descriptions to predict conversion probability.', read: '4 min', date: 'Feb 2025', bg: 'bg-yellow-500/8' },
];

const STATS = [
  { num: '2,400+', label: 'Verified Leads' },
  { num: '840+', label: 'Active Designers' },
  { num: '₹18Cr', label: 'Revenue Generated' },
  { num: '92%', label: 'Satisfaction Rate' },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'designer' | 'client'>('designer');

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/85 backdrop-blur-xl border-b border-white/[0.07] flex items-center h-15 px-6">
        <div className="font-head text-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          LeadFlow
        </div>
        <div className="flex items-center gap-1 ml-8">
          {[
            { label: 'Home', href: '/' },
            { label: 'For Designers', href: '/designer/dashboard' },
            { label: 'Post Lead', href: '/client' },
            { label: 'Blog', href: '#blog' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/3">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
          <Link href="/auth/login"><button className="btn-ghost text-sm px-4 py-2">Login</button></Link>
          <Link href="/auth/signup"><button className="btn-primary text-sm px-4 py-2">Get Started</button></Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-5 pt-24 pb-16 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(124,92,252,0.14),transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/35 bg-purple-500/10 text-xs text-purple-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Now with AI Lead Scoring
        </div>

        <h1 className="font-head text-5xl md:text-7xl font-extrabold leading-[1.08] max-w-4xl mb-6">
          Stop chasing clients.{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Buy verified leads instantly.
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
          The only marketplace where designers get pre-qualified, AI-analyzed leads delivered in real-time. No more cold outreach.
        </p>

        {/* Role tabs */}
        <div className="flex gap-2 p-1 bg-surface rounded-xl border border-white/[0.07] mb-6">
          <button
            onClick={() => setActiveTab('designer')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'designer' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            I'm a Designer
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'client' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            I Need a Designer
          </button>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {activeTab === 'designer' ? (
            <>
              <Link href="/auth/signup">
                <button className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                  Get Free Credits <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/designer/dashboard">
                <button className="btn-ghost text-base px-8 py-3.5">Browse Leads</button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/client">
                <button className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                  Post Your Requirement <ArrowRight size={16} />
                </button>
              </Link>
              <button className="btn-ghost text-base px-8 py-3.5">See How It Works</button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-12 mt-20 flex-wrap justify-center">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-head text-3xl font-extrabold">{s.num}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="section-label">Why LeadFlow</div>
        <h2 className="section-title mb-3">Everything you need to grow<br />your design business</h2>
        <p className="text-gray-400 text-base mb-12 max-w-lg">Stop cold calling. Stop Instagram DMs. Get real clients who are actively looking for designers.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-200">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-head text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-5"><div className="border-t border-white/[0.07]" /></div>

      {/* ── How It Works ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="section-label">How It Works</div>
        <h2 className="section-title mb-12">From requirement to client in 3 steps</h2>
        <div className="card grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
          {STEPS.map((s, i) => (
            <div key={s.num} className="p-8">
              <div className="font-head text-5xl font-extrabold text-purple-500/20 mb-4">{s.num}</div>
              <h3 className="font-head text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="section-label">Testimonials</div>
        <h2 className="section-title mb-12">Designers love us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-0.5 mb-3 text-yellow-400 text-sm">
                {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-5 py-10 mb-10">
        <div className="card p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(124,92,252,0.08),transparent)] pointer-events-none" />
          <div className="section-label relative">Start Today</div>
          <h2 className="font-head text-4xl font-extrabold mb-4 relative">Ready to grow your design business?</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8 text-base">
            Join 840+ designers already closing deals. Get 3 free lead credits when you sign up today.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth/signup">
              <button className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                Get Free Credits <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/client">
              <button className="btn-ghost text-base px-8 py-3.5">Post a Requirement</button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
            {['No credit card required', '3 free credits', 'Cancel anytime'].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                <CheckCircle size={12} className="text-green-400" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog ── */}
      <section id="blog" className="max-w-6xl mx-auto px-5 py-10 pb-20">
        <div className="section-label">Resources</div>
        <h2 className="section-title mb-10">From the LeadFlow Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BLOG_POSTS.map((p) => (
            <div key={p.title} className="card overflow-hidden hover:-translate-y-1 hover:border-purple-500/30 transition-all duration-200 cursor-pointer">
              <div className={`h-28 flex items-center justify-center text-4xl ${p.bg}`}>{p.emoji}</div>
              <div className="p-5">
                <div className="text-xs font-medium text-purple-300 uppercase tracking-wide mb-2">{p.cat}</div>
                <h3 className="font-head text-sm font-bold leading-snug mb-2">{p.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{p.excerpt}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                  <span>{p.read} read</span>
                  <span>{p.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.07] py-8 text-center text-xs text-gray-600">
        <div className="font-head text-sm font-bold text-gray-400 mb-2">LeadFlow</div>
        © 2025 LeadFlow Technologies Pvt. Ltd. &nbsp;·&nbsp; Privacy &nbsp;·&nbsp; Terms &nbsp;·&nbsp; Support
      </footer>
    </div>
  );
}
