import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-bg">
            <AdminSidebar />
            <main className="flex-1 p-7 overflow-x-auto">{children}</main>
        </div>
    );
}