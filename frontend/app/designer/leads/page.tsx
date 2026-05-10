'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Tag, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import { StatusPill } from '@/components/ui/StatCard';
import api from '@/lib/api';

const MOCK_PURCHASED = [
  { _id: 'p1', service: 'Interior Design', budgetDisplay: '₹4,50,000', location: 'Whitefield, Bangalore', description: 'Complete 3BHK interior with modern minimalist theme. Needs smart storage and premium materials. Owner wants to move in within 3 months.', tags: ['Modern', 'Minimalist', '3BHK', 'Luxury'], clientName: 'Ananya Sharma', clientPhone: '+91 98201 34567', clientEmail: 'ananya@gmail.com', intentScore: 0.89, purchasedAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'open' },
  { _id: 'p2', service: 'Logo Design', budgetDisplay: '₹25,000', location: 'Connaught Place, Delhi', description: 'Fresh brand identity for a new specialty coffee cafe. Need a modern, memorable logo that works well on cups, bags, and signage.', tags: ['Cafe', 'Minimal', 'Playful'], clientName: 'Kiran Rao', clientPhone: '+91 97455 88821', clientEmail: 'kiran@coffeecraft.in', intentScore: 0.71, purchasedAt: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'sold' },
  { _id: 'p3', service: 'UI/UX Design', budgetDisplay: '₹1,20,000', location: 'Andheri, Mumbai', description: 'Mobile app redesign for a fintech startup. Need modern, clean UI with excellent UX flow, onboarding screens, and design system.', tags: ['Mobile App', 'Fintech', 'Modern', 'Design System'], clientName: 'Meena Pillai', clientPhone: '+91 90214 77643', clientEmail: 'meena@fintechco.com', intentScore: 0.84, purchasedAt: new Date(Date.now() - 8 * 86400000).toISOString(), status: 'open' },
];

export default function PurchasedLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchased();
  }, []);

  const fetchPurchased = async () => {
    try {
      const { data } = await api.get('/users/purchased-leads');
      const leadsData =
        data?.leads ||
        data?.data?.leads ||
        data?.data ||
        data ||
        [];

      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch {
      setLeads(MOCK_PURCHASED);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="purchased" />
      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">My Purchases</h1>
        <p className="text-gray-400 text-sm mb-6">Leads you've bought — with full client contact details.</p>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-28 animate-pulse" />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-head text-lg font-bold mb-2">No purchases yet</h3>
            <p className="text-gray-400 text-sm mb-4">Browse the live leads and buy your first one.</p>
            <a href="/designer/dashboard" className="btn-primary px-6 py-2.5 inline-block">Browse Leads →</a>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead._id} className="card overflow-hidden">
                {/* Header */}
                <div
                  className="p-5 cursor-pointer flex items-start gap-4"
                  onClick={() => setExpanded(expanded === lead._id ? null : lead._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="bg-purple-500/15 text-purple-300 text-xs px-2.5 py-1 rounded-full">{lead.service}</span>
                      <StatusPill status={lead.status} />
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(lead.purchasedAt)}
                      </span>
                    </div>
                    <div className="font-head text-xl font-bold mb-1">{lead.budgetDisplay}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={10} /> {lead.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-0.5">Intent</div>
                      <div className="text-sm font-bold text-purple-300">{lead.intentScore}</div>
                    </div>
                    {expanded === lead._id ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === lead._id && (
                  <div className="border-t border-white/[0.07] p-5 bg-bg-3/50 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Client Contact */}
                      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                        <div className="text-xs font-semibold text-green-400 mb-3">📞 Client Contact</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-sm">
                            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
                              {lead.clientName?.charAt(0)}
                            </div>
                            <span className="font-medium">{lead.clientName}</span>
                          </div>
                          <a href={`tel:${lead.clientPhone}`} className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300">
                            <Phone size={13} /> {lead.clientPhone}
                          </a>
                          {lead.clientEmail && (
                            <a href={`mailto:${lead.clientEmail}`} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                              <Mail size={13} /> {lead.clientEmail}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* AI Tags */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2">AI Tags</div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {lead.tags?.map((t: string) => (
                            <span key={t} className="badge-purple text-xs">{t}</span>
                          ))}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5">Intent Score</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400" style={{ width: `${lead.intentScore * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-purple-300">{lead.intentScore}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full description */}
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">Full Requirement</div>
                      <p className="text-sm text-gray-300 leading-relaxed">{lead.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <a href={`tel:${lead.clientPhone}`} className="btn-success text-xs px-4 py-2 flex items-center gap-1.5">
                        <Phone size={12} /> Call Now
                      </a>
                      <a href={`mailto:${lead.clientEmail}`} className="btn-ghost text-xs px-4 py-2 flex items-center gap-1.5">
                        <Mail size={12} /> Send Email
                      </a>
                      <button className="btn-ghost text-xs px-4 py-2 flex items-center gap-1.5 ml-auto text-red-400 border-red-500/20 hover:border-red-500/40">
                        Report Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
