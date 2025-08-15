/**
 * AdminLayout - Bangladesh Admin Panel Layout
 * Amazon.com/Shopee.sg Level Admin Interface
 */

import { useState, ReactNode } from 'react';
import { ComprehensiveAdminSidebar } from './ComprehensiveAdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { NotificationCenter } from './NotificationCenter';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage?: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
}

export const AdminLayout = ({ children, currentPage, breadcrumbItems }: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Admin Header */}
      <AdminHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleNotifications={() => setNotificationOpen(!notificationOpen)}
        currentPage={currentPage}
      />

      {/* Main Content Container - Added top margin to account for two-tier header */}
      <div className="flex flex-1 overflow-hidden mt-20">
        {/* Admin Sidebar with vertical slider */}
        <div className={`transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ComprehensiveAdminSidebar 
              collapsed={sidebarCollapsed}
              onCollapse={setSidebarCollapsed}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb Navigation */}
          {breadcrumbItems && (
            <div className="flex-shrink-0">
              <AdminBreadcrumb items={breadcrumbItems} />
            </div>
          )}

          {/* Page Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Admin Footer */}
      <AdminFooter />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Bangladesh Cultural Elements */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm shadow-lg">
          <span className="mr-1">🕌</span>
          Prayer Time
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;