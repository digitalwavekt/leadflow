'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Star, TrendingUp, ShoppingCart, Bell, Filter } from 'lucide-react';
import { LeadCard } from '@/components/leads/LeadCard';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { useSocket } from '@/hooks/useSocket';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';

const SERVICES = ['All', 'Interior Design', 'Logo Design', 'UI/UX Design', 'Brand Identity', '3D Visualization'];

export default function DesignerDashboard() {
  const { user } = useAuthStore();
  const { on, off } = useSocket();

  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [newLeadAlert, setNewLeadAlert] = useState<any>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (activeFilter !== 'All') params.service = activeFilter;
      const { data } = await api.get('/leads', { params });
      setLeads(data.leads);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Real-time socket events
  useEffect(() => {
    const removeNew = on('lead:new', (lead) => {
      setLeads((prev) => [lead, ...prev]);
      setNewLeadAlert(lead);
      setTimeout(() => setNewLeadAlert(null), 5000);
    });

    const removeLocked = on('lead:locked', ({ leadId, lockExpiry }) => {
      setLeads((prev) =>
        prev.map((l) => l._id === leadId ? { ...l, status: 'locked', lockExpiry } : l)
      );
    });

    const removeUnlocked = on('lead:unlocked', ({ leadId }) => {
      setLeads((prev) =>
        prev.map((l) => l._id === leadId ? { ...l, status: 'open', lockExpiry: null } : l)
      );
    });

    const removeSold = on('lead:sold', ({ leadId }) => {
      setLeads((prev) =>
        prev.map((l) => l._id === leadId ? { ...l, status: 'sold' } : l)
      );
    });

    return () => {
      removeNew?.();
      removeLocked?.();
      removeUnlocked?.();
      removeSold?.();
    };
  }, [on]);

  const filteredLeads = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.service?.toLowerCase().includes(q) ||
      l.location?.toLowerCase().includes(q) ||
      l.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  });

  const stats = {
    available: leads.filter((l) => l.status === 'open').length,
    locked: leads.filter((l) => l.status === 'locked').length,
    highIntent: leads.filter((l) => (l.intentScore || 0) >= 0.8).length,
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="leads" />

      <main className="flex-1 p-7 overflow-y-auto">
        {/* New Lead Alert Banner */}
        {newLeadAlert && (
          <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-3 animate-fade-in">
            <Zap size={16} className="text-purple-400" />
            <span className="text-sm font-medium">
              New lead: <strong>{newLeadAlert.service}</strong> · {newLeadAlert.location} · {newLeadAlert.budget}
            </span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-head text-2xl font-extrabold">Live Leads</h1>
            <p className="text-gray-400 text-sm mt-0.5">New verified leads. Buy before they're gone.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Real-time
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-5">
          <StatCard label="Available" value={stats.available} color="text-purple-400" change="+3 today" up />
          <StatCard label="Locked Now" value={stats.locked} color="text-yellow-400" change="by others" />
          <StatCard label="High Intent" value={stats.highIntent} color="text-green-400" change="Score ≥ 0.8" up />
          <StatCard label="Your Credits" value={user?.credits ?? 0} color="text-yellow-400" change="Available" up />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center mb-5">
          {SERVICES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                activeFilter === s
                  ? 'bg-purple-500/15 border-purple-500 text-purple-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search leads..."
            className="ml-auto input w-48 py-1.5 text-xs"
          />
        </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded mb-3 w-3/4" />
                <div className="h-8 bg-white/5 rounded mb-2" />
                <div className="h-3 bg-white/5 rounded mb-4 w-1/2" />
                <div className="flex gap-2 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-5 w-16 bg-white/5 rounded-full" />
                  ))}
                </div>
                <div className="h-1 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p>No leads match your filters.</p>
            <button onClick={() => { setActiveFilter('All'); setSearch(''); }} className="btn-ghost mt-4 text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead._id}
                lead={lead}
                onPurchased={(id) => setLeads((prev) => prev.filter((l) => l._id !== id))}
                onLocked={(id, expiry) =>
                  setLeads((prev) =>
                    prev.map((l) => l._id === id ? { ...l, status: 'locked', lockExpiry: expiry } : l)
                  )
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
