'use client';

import { DesignerSidebar } from '@/components/designer/DesignerSidebar';
import NotificationsPage from '@/components/notifications/NotificationsPage';

export default function DesignerNotifications() {
  return (
    <div className="flex min-h-screen bg-bg">
      <DesignerSidebar activeTab="notifications" />

      <main className="flex-1 p-7 overflow-y-auto">
        <NotificationsPage />
      </main>
    </div>
  );
}