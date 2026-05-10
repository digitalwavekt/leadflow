'use client';

import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import api from '@/lib/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
  const [purchasedLeads, setPurchasedLeads] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);

    try {
      const [leadsRes, txRes] = await Promise.all([
        api.get('/users/purchased-leads'),
        api.get('/users/transactions'),
      ]);

      const leadsData =
        leadsRes.data?.leads ||
        leadsRes.data?.data?.leads ||
        leadsRes.data?.data ||
        leadsRes.data ||
        [];

      const txData =
        txRes.data?.transactions ||
        txRes.data?.data?.transactions ||
        txRes.data?.data ||
        txRes.data ||
        [];

      setPurchasedLeads(Array.isArray(leadsData) ? leadsData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setPurchasedLeads([]);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }).map((_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: MONTHS[d.getMonth()],
        leads: 0,
        spend: 0,
        revenue: 0,
      };
    });

    purchasedLeads.forEach((lead) => {
      const date = new Date(lead.purchasedAt || lead.createdAt || Date.now());
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = monthBuckets.find((m) => m.key === key);

      if (bucket) {
        bucket.leads += 1;

        const estimatedRevenue =
          lead.budget ||
          lead.amount ||
          lead.price ||
          0;

        bucket.revenue += Number(estimatedRevenue) || 0;
      }
    });

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt || Date.now());
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const bucket = monthBuckets.find((m) => m.key === key);

      if (bucket) {
        const amount = tx.amountINR || tx.amount || tx.price || 0;
        if (tx.type === 'credit_purchase' || amount > 0) {
          bucket.spend += Number(amount) || 0;
        }
      }
    });

    const totalLeads = purchasedLeads.length;

    const totalSpend = transactions.reduce((sum, tx) => {
      const amount = tx.amountINR || tx.amount || tx.price || 0;
      if (tx.type === 'credit_purchase' || amount > 0) {
        return sum + Number(amount || 0);
      }
      return sum;
    }, 0);

    const estimatedRevenue = purchasedLeads.reduce((sum, lead) => {
      return sum + Number(lead.budget || lead.amount || lead.price || 0);
    }, 0);

    const categoryMap: Record<string, { name: string; leads: number; converted: number }> = {};

    purchasedLeads.forEach((lead) => {
      const service = lead.service || 'Other';

      if (!categoryMap[service]) {
        categoryMap[service] = {
          name: service,
          leads: 0,
          converted: 0,
        };
      }

      categoryMap[service].leads += 1;

      if (lead.status === 'sold' || lead.status === 'open' || lead.converted) {
        categoryMap[service].converted += 1;
      }
    });

    const categoryData = Object.values(categoryMap).sort((a, b) => b.leads - a.leads);

    const conversionRate =
      totalLeads > 0
        ? Math.round(
          (purchasedLeads.filter((l) => l.status === 'sold' || l.converted).length /
            totalLeads) *
          100
        )
        : 0;

    const costPerLead = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

    return {
      monthlyData: monthBuckets,
      totalLeads,
      totalSpend,
      estimatedRevenue,
      conversionRate,
      costPerLead,
      categoryData,
    };
  }, [purchasedLeads, transactions]);

  const maxLeads = Math.max(...analytics.monthlyData.map((d) => d.leads), 1);
  const maxRevenue = Math.max(...analytics.monthlyData.map((d) => d.revenue), 1);

  const formatINR = (val: number) => {
    if (!val) return '₹0';
    return val >= 100000
      ? `₹${(val / 100000).toFixed(1)}L`
      : `₹${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="analytics" />

      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">
          Analytics
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Your performance and ROI overview from database.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard
            label="Revenue Potential"
            value={isLoading ? '...' : formatINR(analytics.estimatedRevenue)}
            color="text-green-400"
            change="From purchased leads"
            up
          />

          <StatCard
            label="Leads Purchased"
            value={isLoading ? '...' : analytics.totalLeads}
            color="text-purple-400"
            change="Database total"
            up
          />

          <StatCard
            label="Conversion Rate"
            value={isLoading ? '...' : `${analytics.conversionRate}%`}
            color="text-yellow-400"
            change="Based on lead status"
            up
          />

          <StatCard
            label="Cost Per Lead"
            value={isLoading ? '...' : formatINR(analytics.costPerLead)}
            color="text-pink-400"
            change="Spend / leads"
          />
        </div>

        <div className="card p-6 mb-5">
          <div className="font-head text-base font-bold mb-1">
            Leads Purchased — Monthly
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Last 6 months activity from DB
          </p>

          {isLoading ? (
            <div className="h-36 bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-end gap-3 h-36">
              {analytics.monthlyData.map((d) => (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-semibold text-purple-300">
                    {d.leads}
                  </span>

                  <div
                    className="w-full rounded-t-lg bg-purple-500/20 relative overflow-hidden transition-all duration-700"
                    style={{
                      height: `${(d.leads / maxLeads) * 100}%`,
                      minHeight: 8,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500 to-purple-400/60 rounded-t-lg" />
                  </div>

                  <span className="text-xs text-gray-600">{d.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 mb-5">
          <div className="font-head text-base font-bold mb-1">
            Revenue Potential — Monthly
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Estimated from purchased lead budgets
          </p>

          {isLoading ? (
            <div className="h-36 bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-end gap-3 h-36">
              {analytics.monthlyData.map((d) => (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-semibold text-green-400">
                    {formatINR(d.revenue)}
                  </span>

                  <div
                    className="w-full rounded-t-lg relative overflow-hidden transition-all duration-700"
                    style={{
                      height: `${(d.revenue / maxRevenue) * 100}%`,
                      minHeight: 8,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-green-400/50 rounded-t-lg" />
                  </div>

                  <span className="text-xs text-gray-600">{d.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="font-head text-base font-bold mb-4">
            Category Performance
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : analytics.categoryData.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No purchased leads found yet.
            </div>
          ) : (
            <div className="space-y-5">
              {analytics.categoryData.map((c) => {
                const cr = c.leads > 0 ? Math.round((c.converted / c.leads) * 100) : 0;

                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{c.name}</div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{c.leads} bought</span>
                        <span className="text-green-400">
                          {c.converted} active/converted
                        </span>
                        <span className="font-semibold text-purple-300">
                          {cr}% CR
                        </span>
                      </div>
                    </div>

                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500 to-pink-400"
                        style={{ width: `${cr}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-purple-500/8 border border-purple-500/20 rounded-xl">
            <div className="text-xs font-semibold text-purple-300 mb-2">
              💡 Insight
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Analytics are calculated from your purchased leads and transaction
              history. More accurate conversion tracking can be added later with
              a lead outcome/status update feature.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}