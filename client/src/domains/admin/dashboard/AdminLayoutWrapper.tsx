
import React, { ReactNode } from 'react';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';
import { ComprehensiveAdminSidebar } from '@/components/admin/ComprehensiveAdminSidebar';
import { ComprehensiveMainContent } from '@/components/admin/ComprehensiveMainContent';
import { AdminDashboardFooter } from '@/components/admin/AdminDashboardFooter';

interface AdminLayoutWrapperProps {
  selectedMenu: string;
  selectedSubmenu: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onMenuChange: (menu: string) => void;
  userProfile: {
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
}

export const AdminLayoutWrapper: React.FC<AdminLayoutWrapperProps> = ({
  selectedMenu,
  selectedSubmenu,
  sidebarCollapsed,
  setSidebarCollapsed,
  onMenuChange,
  userProfile
}) => {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Independent Header */}
        <AdminDashboardHeader userProfile={userProfile} />

        {/* Content Area with top margin for fixed header */}
        <div className="flex pt-[125px]">
          {/* Collapsible Sidebar */}
          <ComprehensiveAdminSidebar
            activeTab={selectedMenu}
            setActiveTab={onMenuChange}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />

          {/* Main Content - Dynamic margin based on sidebar state */}
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
            {/* Main Content */}
            <div className="min-h-screen">
              <ComprehensiveMainContent 
                selectedMenu={selectedMenu} 
                selectedSubmenu={selectedSubmenu} 
              />
            </div>
            
            {/* Footer */}
            <AdminDashboardFooter />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};
