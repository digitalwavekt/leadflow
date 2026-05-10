'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ListChecks,
    CreditCard,
    Settings,
    LogOut,
    Bell,
} from 'lucide-react';
import { clsx } from 'clsx';
import useAuthStore from '@/lib/store';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Leads', icon: ListChecks, href: '/admin/leads' },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'Transactions', icon: CreditCard, href: '/admin/transactions' },
    { label: 'Notifications', icon: Bell, href: '/admin/notifications' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <aside className="w-60 shrink-0 bg-bg-2 border-r border-white/[0.07] flex flex-col min-h-screen pt-16 sticky top-0">
            <div className="mx-4 mt-5 mb-2 card p-4">
                <div className="text-xs text-gray-500 mb-1">Admin Panel</div>

                <div className="font-head text-xl font-extrabold text-purple-300">
                    LeadFlow
                </div>

                <div className="text-xs text-gray-500 mt-1">Platform Control</div>
            </div>

            <nav className="flex-1 px-3 py-2">
                <div className="text-[10px] font-medium text-gray-600 uppercase tracking-widest px-3 mb-2 mt-3">
                    Menu
                </div>

                {NAV_ITEMS.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={clsx(
                                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 border-l-2',
                                    isActive
                                        ? 'bg-purple-500/10 text-purple-300 border-purple-500'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent'
                                )}
                            >
                                <Icon size={15} className="opacity-80" />
                                <span className="flex-1">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/[0.07]">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-semibold text-purple-300">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>

                    <div>
                        <div className="text-xs font-medium">{user?.name || 'Admin'}</div>
                        <div className="text-[10px] text-gray-500">
                            {user?.role || 'admin'}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
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

export default AdminSidebar;