'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Star, BarChart2, User, CreditCard, LogOut, Bell, Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import useAuthStore from '@/lib/store';

const NAV_ITEMS = [
  { label: 'Live Leads', icon: LayoutDashboard, href: '/designer/dashboard', badge: null },
  { label: 'My Purchases', icon: Star, href: '/designer/leads', badge: null },
  { label: 'Analytics', icon: BarChart2, href: '/designer/analytics', badge: null },
  { label: 'Profile', icon: User, href: '/designer/profile', badge: null },
  { label: 'Transactions', icon: CreditCard, href: '/designer/transactions', badge: null },
  { label: 'Notifications', icon: Bell, href: '/designer/notifications', badge: '3' },
];

interface DesignerSidebarProps {
  activeTab?: string;
}

export function DesignerSidebar({ activeTab }: DesignerSidebarProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-60 bg-bg-2 border-r border-white/[0.07] flex flex-col min-h-screen pt-16 sticky top-0">
      {/* Credits Box */}
      <div className="mx-4 mt-5 mb-2 card p-4">
        <div className="text-xs text-gray-500 mb-1">Available Credits</div>
        <div className="font-head text-3xl font-extrabold text-yellow-400">{user?.credits ?? 0}</div>
        <div className="text-xs text-gray-500 mb-3">≈ {Math.floor((user?.credits ?? 0) / 5)} leads</div>
        <Link href="/designer/transactions">
          <button className="w-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-lg py-1.5 text-xs font-medium hover:bg-yellow-500/25 transition-all">
            + Buy Credits
          </button>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2">
        <div className="text-[10px] font-medium text-gray-600 uppercase tracking-widest px-3 mb-2 mt-3">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={clsx(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 border-l-2',
                  isActive
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500'
                    : 'text-gray-500 hover:text-white hover:bg-white/3 border-transparent'
                )}
              >
                <item.icon size={15} className="opacity-80" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-purple-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-semibold text-purple-300">
            {user?.name?.charAt(0) ?? 'D'}
          </div>
          <div>
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-[10px] text-gray-500">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
