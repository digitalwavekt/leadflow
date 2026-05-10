'use client';

import { Bell } from 'lucide-react';
import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import NotificationsPage from "@/components/notifications/NotificationsPage";
export default function DesignerNotifications() {
  return <NotificationsPage />;
}
export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="notifications" />

      <main className="flex-1 p-7 overflow-y-auto">
        <h1 className="font-head text-2xl font-extrabold mb-1">
          Notifications
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Your lead and credit updates will appear here.
        </p>

        <div className="card p-10 text-center">
          <Bell size={42} className="mx-auto mb-4 text-purple-400" />
          <h2 className="font-head text-lg font-bold mb-2">
            No notifications yet
          </h2>
          <p className="text-gray-500 text-sm">
            New lead alerts, credit updates, and purchase events will show here.
          </p>
        </div>
      </main>
    </div>
  );
}