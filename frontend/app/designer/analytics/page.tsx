'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Star, Target, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import api from '@/lib/api';

const MONTHLY_DATA = [
  { month: 'Nov', leads: 3, revenue: 85000, spend: 15 },
  { month: 'Dec', leads: 5, revenue: 140000, spend: 25 },
  { month: 'Jan', leads: 4, revenue: 110000, spend: 20 },
  { month: 'Feb', leads: 7, revenue: 210000, spend: 35 },
  { month: 'Mar', leads: 6, revenue: 185000, spend: 30 },
  { month: 'Apr', leads: 9, revenue: 320000, spend: 45 },
];

const CAT_DATA = [
  { name: 'Interior Design', leads: 11, converted: 7, color: '#7c5cfc' },
  { name: 'UI/UX Design', leads: 5, converted: 2, color: '#f472b6' },
  { name: 'Brand Identity', leads: 2, converted: 1, color: '#fbbf24' },
];

export default function AnalyticsPage() {
  const maxLeads = Math.max(...MONTHLY_DATA.map((d) => d.leads));
  const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

  const formatINR = (val: number) => val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val / 1000).toFixed(0)}K`;

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="analytics" />
      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">Analytics</h1>
        <p className="text-gray-400 text-sm mb-6">Your performance and ROI overview.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard label="Revenue Closed" value="₹5.7L" color="text-green-400" change="↑ 23% this month" up />
          <StatCard label="Leads Purchased" value="18" color="text-purple-400" change="↑ 5 vs last month" up />
          <StatCard label="Conversion Rate" value="39%" color="text-yellow-400" change="Industry avg: 22%" up />
          <StatCard label="Cost Per Lead" value="₹1,940" color="text-pink-400" change="↓ Improving" />
        </div>

        {/* Monthly leads chart */}
        <div className="card p-6 mb-5">
          <div className="font-head text-base font-bold mb-1">Leads Purchased — Monthly</div>
          <p className="text-xs text-gray-500 mb-5">Last 6 months activity</p>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold text-purple-300">{d.leads}</span>
                <div className="w-full rounded-t-lg bg-purple-500/20 relative overflow-hidden transition-all duration-700" style={{ height: `${(d.leads / maxLeads) * 100}%`, minHeight: 8 }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500 to-purple-400/60 rounded-t-lg" />
                </div>
                <span className="text-xs text-gray-600">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card p-6 mb-5">
          <div className="font-head text-base font-bold mb-1">Revenue Closed — Monthly</div>
          <p className="text-xs text-gray-500 mb-5">Estimated revenue from purchased leads</p>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold text-green-400">{formatINR(d.revenue)}</span>
                <div className="w-full rounded-t-lg relative overflow-hidden transition-all duration-700" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 8 }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-green-400/50 rounded-t-lg" />
                </div>
                <span className="text-xs text-gray-600">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-6">
          <div className="font-head text-base font-bold mb-4">Category Performance</div>
          <div className="space-y-5">
            {CAT_DATA.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{c.leads} bought</span>
                    <span className="text-green-400">{c.converted} converted</span>
                    <span className="font-semibold" style={{ color: c.color }}>
                      {Math.round((c.converted / c.leads) * 100)}% CR
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(c.converted / c.leads) * 100}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-purple-500/8 border border-purple-500/20 rounded-xl">
            <div className="text-xs font-semibold text-purple-300 mb-2">💡 Insight</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your Interior Design conversion rate (64%) is 3× the platform average. Consider buying more leads in this category to maximize ROI.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
