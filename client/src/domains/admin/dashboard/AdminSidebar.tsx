
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  FileText,
  Bell,
  Store,
  DollarSign,
  BarChart3,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ScrollArea } from '@/shared/ui/scroll-area';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'vendors', label: 'Vendors', icon: Store, color: 'text-green-500' },
    { id: 'products', label: 'Products', icon: Package, color: 'text-purple-500' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-orange-500' },
    { id: 'users', label: 'Users', icon: Users, color: 'text-cyan-500' },
    { id: 'financials', label: 'Financials', icon: DollarSign, color: 'text-emerald-500' },
    { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-indigo-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-red-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-500' }
  ];

  return (
    <div className={`fixed left-0 top-[120px] bottom-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-800 transition-all duration-300 z-30 shadow-lg border-r border-gray-200 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="font-bold text-sm text-gray-700">GETIT Admin</span>
          </Link>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 h-[calc(100vh-180px)] overflow-hidden">
        <ScrollArea className="h-full">
          <nav className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 mb-1 text-left hover:bg-white/80 hover:shadow-sm transition-all duration-200 rounded-lg text-xs group ${
                    isActive ? 'bg-white shadow-md border-l-4 border-blue-500 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  <Icon 
                    size={16} 
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : item.color
                    } group-hover:${item.color}`} 
                  />
                  {!collapsed && (
                    <span className="ml-2.5 font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Admin Panel v2.0</div>
            <div className="text-xs text-gray-600 mt-0.5 font-medium">GETIT Bangladesh</div>
          </div>
        </div>
      )}
    </div>
  );
};
