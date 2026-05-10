'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CreditCard,
  Settings,
  CheckCircle,
  XCircle,
  LogOut,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { StatCard } from '@/components/ui/StatCard';
import useAuthStore from '@/lib/store';
import api from '@/lib/api';

const ADMIN_NAV = [
  { label: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'All Leads', icon: ClipboardList, href: '/admin/leads' },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Transactions', icon: CreditCard, href: '/admin/transactions' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

const CAT_DATA = [
  { name: 'Interior Design', pct: 42, color: '#7c5cfc' },
  { name: 'UI/UX Design', pct: 28, color: '#f472b6' },
  { name: 'Logo & Brand Identity', pct: 18, color: '#fbbf24' },
  { name: '3D Visualization', pct: 7, color: '#4ade80' },
  { name: 'Motion & Packaging', pct: 5, color: '#888' },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <aside className="w-56 bg-bg-2 border-r border-white/[0.07] flex flex-col min-h-screen pt-16 sticky top-0">
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <div className="font-head text-sm font-bold">Admin Panel</div>
        <div className="text-xs text-gray-500">LeadFlow Console</div>
      </div>

      <nav className="flex-1 py-4 px-3">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5',
                  isActive
                    ? 'bg-purple-500/10 text-purple-300'
                    : 'text-gray-500 hover:text-white hover:bg-white/3'
                )}
              >
                <item.icon size={15} />
                <span className="flex-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-semibold text-red-300">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div>
            <div className="text-xs font-medium">{user?.name || 'Admin'}</div>
            <div className="text-[10px] text-gray-500">Admin</div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pendingLeads, setPendingLeads] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.get('/admin/dashboard');

      const dashboardStats = data?.stats || data?.data?.stats || data?.data || null;
      const recentLeads = data?.recentLeads || data?.data?.recentLeads || [];
      const transactions =
        data?.recentTransactions || data?.data?.recentTransactions || [];

      setStats(dashboardStats);
      setPendingLeads(
        Array.isArray(recentLeads)
          ? recentLeads.filter((l: any) => l.status === 'pending')
          : []
      );
      setRecentActivity(Array.isArray(transactions) ? transactions : []);
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
      setStats(null);
      setPendingLeads([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, quality: string) => {
    try {
      await api.patch(`/admin/leads/${id}/verify`, { quality });

      setActionMsg(`Lead approved (${quality} quality)`);
      setPendingLeads((prev) => prev.filter((l) => l._id !== id));

      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Verify failed:', err);
      setActionMsg('Action failed — check API connection');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/admin/leads/${id}/reject`, {
        reason: 'Rejected by admin',
      });

      setActionMsg('Lead rejected.');
      setPendingLeads((prev) => prev.filter((l) => l._id !== id));

      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Reject failed:', err);
      setActionMsg('Action failed — check API connection');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />

      <main className="flex-1 p-7">
        <h1 className="font-head text-2xl font-extrabold mb-1">Overview</h1>
        <p className="text-gray-400 text-sm mb-6">
          Platform performance at a glance.
        </p>

        {actionMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/25 rounded-xl text-sm text-green-400 flex items-center gap-2">
            <CheckCircle size={14} /> {actionMsg}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard
            label="Total Leads"
            value={isLoading ? '...' : stats?.totalLeads ?? 0}
            color="text-purple-400"
            change="From database"
            up
          />
          <StatCard
            label="Active Designers"
            value={isLoading ? '...' : stats?.totalDesigners ?? 0}
            color="text-green-400"
            change="From database"
            up
          />
          <StatCard
            label="Revenue MTD"
            value={isLoading ? '...' : formatINR(stats?.revenueMTD)}
            color="text-yellow-400"
            change="From database"
            up
          />
          <StatCard
            label="Pending Review"
            value={isLoading ? '...' : stats?.pendingLeads ?? pendingLeads.length}
            color="text-red-400"
            change="Needs attention"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="font-head text-base font-bold mb-4 flex items-center gap-2">
              <AlertTriangle size={15} className="text-yellow-400" />
              Pending Verification
              {pendingLeads.length > 0 && (
                <span className="ml-auto bg-yellow-500/15 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                  {pendingLeads.length}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-white/3 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : pendingLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                All caught up! No pending leads.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeads.map((lead: any) => (
                  <div
                    key={lead._id}
                    className="flex items-center gap-3 p-3 bg-bg-3 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {lead.service}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.location} ·{' '}
                        {lead.budgetDisplay ||
                          `₹${((lead.budget || 0) / 1000).toFixed(0)}K`}
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleVerify(lead._id, 'high')}
                        className="btn-success text-xs py-1 px-2"
                      >
                        <CheckCircle size={11} />
                      </button>

                      <button
                        onClick={() => handleVerify(lead._id, 'medium')}
                        className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs py-1 px-2 rounded-lg hover:bg-yellow-500/20 transition-all"
                      >
                        Med
                      </button>

                      <button
                        onClick={() => handleReject(lead._id)}
                        className="btn-danger text-xs py-1 px-2"
                      >
                        <XCircle size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="font-head text-base font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-purple-400" />
              Recent Activity
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-white/3 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recent activity found.
              </div>
            ) : (
              <div className="space-y-0">
                {recentActivity.map((item: any, i: number) => (
                  <div
                    key={item._id || i}
                    className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0"
                  >
                    <span className="text-base mt-0.5">
                      {item.icon || '💳'}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-200">
                        {item.text ||
                          item.description ||
                          `${item.type || 'Transaction'} completed`}
                      </div>

                      <div className="text-xs text-gray-600 mt-0.5">
                        {item.time ||
                          new Date(
                            item.createdAt || item.updatedAt || Date.now()
                          ).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-5 mt-5">
          <div className="font-head text-base font-bold mb-5">
            Lead Categories Breakdown
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {CAT_DATA.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{c.name}</span>
                  <span className="font-semibold">{c.pct}%</span>
                </div>

                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}