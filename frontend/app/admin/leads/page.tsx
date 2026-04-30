'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatCard';
import api from '@/lib/api';

const QUALITY_OPTS = ['high', 'medium', 'low'];
const STATUS_OPTS = ['all', 'pending', 'open', 'locked', 'sold', 'rejected'];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchLeads(); }, [statusFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/admin/leads', { params });
      setLeads(data.leads);
    } catch {
      setLeads(MOCK_LEADS);
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async (id: string, quality: string) => {
    try {
      await api.patch(`/admin/leads/${id}/verify`, { quality });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status: 'open', quality } : l));
      flash(`Lead approved (${quality})`);
    } catch { flash('Failed — check API'); }
  };

  const reject = async (id: string) => {
    try {
      await api.patch(`/admin/leads/${id}/reject`, { reason: 'Does not meet quality standards' });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status: 'rejected' } : l));
      flash('Lead rejected');
    } catch { flash('Failed — check API'); }
  };

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.service?.toLowerCase().includes(q) || l.location?.toLowerCase().includes(q);
  });

  const formatBudget = (b: number) => b >= 100000 ? `₹${(b / 100000).toFixed(1)}L` : `₹${(b / 1000).toFixed(0)}K`;

  return (
    <div className="p-7">
      <h1 className="font-head text-2xl font-extrabold mb-1">Lead Management</h1>
      <p className="text-gray-400 text-sm mb-5">Review, verify, and quality-mark all leads.</p>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/25 rounded-xl text-sm text-green-400">{msg}</div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center mb-5">
        {STATUS_OPTS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all capitalize ${statusFilter === s ? 'bg-purple-500/15 border-purple-500 text-purple-300' : 'border-white/10 text-gray-500 hover:text-white'}`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="input pl-8 py-1.5 text-xs w-44"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-3 border-b border-white/[0.07]">
                {['Lead ID', 'Client', 'Service', 'Budget', 'Intent', 'Status', 'Quality', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t border-white/[0.05]">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-3 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No leads found.</td></tr>
              ) : filtered.map((lead) => (
                <tr key={lead._id} className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-xs text-gray-400">#{lead._id?.slice(-6) || 'LF0001'}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium">{lead.clientName || 'Client'}</div>
                    <div className="text-xs text-gray-500">{lead.location}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-300">{lead.service}</td>
                  <td className="px-4 py-3.5 text-yellow-400 font-semibold">{lead.budgetDisplay || formatBudget(lead.budget || 0)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400" style={{ width: `${(lead.intentScore || 0) * 100}%` }} />
                      </div>
                      <span className="text-xs text-purple-300">{lead.intentScore?.toFixed(2) || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><StatusPill status={lead.status} /></td>
                  <td className="px-4 py-3.5">
                    {lead.quality ? (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${lead.quality === 'high' ? 'bg-green-500/15 text-green-400' : lead.quality === 'medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-white/8 text-gray-400'}`}>
                        {lead.quality.charAt(0).toUpperCase() + lead.quality.slice(1)}
                      </span>
                    ) : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      {lead.status === 'pending' && (
                        <>
                          <button onClick={() => verify(lead._id, 'high')} title="Approve High" className="btn-success p-1.5"><CheckCircle size={12} /></button>
                          <button onClick={() => verify(lead._id, 'medium')} title="Approve Medium" className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 p-1.5 rounded-lg hover:bg-yellow-500/20 transition-all text-xs">M</button>
                          <button onClick={() => reject(lead._id)} title="Reject" className="btn-danger p-1.5"><XCircle size={12} /></button>
                        </>
                      )}
                      <button title="View" className="bg-white/5 text-gray-400 border border-white/10 p-1.5 rounded-lg hover:bg-white/10 transition-all"><Eye size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const MOCK_LEADS = [
  { _id: 'lead001', clientName: 'Rahul G.', service: 'Interior Design', location: 'Whitefield, Bangalore', budget: 450000, budgetDisplay: '₹4.5L', intentScore: 0.89, status: 'pending', quality: null },
  { _id: 'lead002', clientName: 'Ananya S.', service: 'UI/UX Design', location: 'Andheri, Mumbai', budget: 120000, budgetDisplay: '₹1.2L', intentScore: 0.84, status: 'open', quality: 'high' },
  { _id: 'lead003', clientName: 'Kiran R.', service: 'Logo Design', location: 'Connaught Place, Delhi', budget: 18000, budgetDisplay: '₹18K', intentScore: 0.71, status: 'sold', quality: 'medium' },
  { _id: 'lead004', clientName: 'Meena P.', service: 'Brand Identity', location: 'Koramangala, Bangalore', budget: 75000, budgetDisplay: '₹75K', intentScore: 0.68, status: 'pending', quality: null },
  { _id: 'lead005', clientName: 'Suresh V.', service: '3D Visualization', location: 'Anna Nagar, Chennai', budget: 35000, budgetDisplay: '₹35K', intentScore: 0.54, status: 'rejected', quality: 'low' },
  { _id: 'lead006', clientName: 'Pooja M.', service: 'Interior Design', location: 'Koregaon Park, Pune', budget: 280000, budgetDisplay: '₹2.8L', intentScore: 0.76, status: 'open', quality: 'high' },
];
