import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Settings,
  Store,
  Truck,
  Megaphone,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Activity,
  Shield,
  FileText,
  CreditCard,
  MapPin,
  Bell,
  Award,
  TrendingUp,
  UserCheck,
  Clipboard,
  Target,
  Database,
  Globe,
  Zap
} from 'lucide-react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Badge } from '@/shared/ui/badge';

interface EnhancedAdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  badge?: number;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  badge?: number;
  children?: SubSubMenuItem[];
}

interface SubSubMenuItem {
  id: string;
  label: string;
  badge?: number;
}

export const EnhancedAdminSidebar: React.FC<EnhancedAdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dashboard']));

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-500',
      children: [
        { id: 'overview', label: 'Overview' },
        { id: 'metrics', label: 'Real-time Metrics' },
        { id: 'performance', label: 'Platform Performance' },
        { id: 'health', label: 'System Health' },
        { id: 'quick-actions', label: 'Quick Actions' }
      ]
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      color: 'text-green-500',
      badge: 12,
      children: [
        {
          id: 'customer-management',
          label: 'Customer Management',
          badge: 8,
          children: [
            { id: 'customer-list', label: 'Customer List' },
            { id: 'customer-details', label: 'Customer Details' },
            { id: 'customer-analytics', label: 'Customer Analytics' },
            { id: 'account-verification', label: 'Account Verification', badge: 5 },
            { id: 'customer-support', label: 'Customer Support', badge: 3 }
          ]
        },
        {
          id: 'admin-users',
          label: 'Admin Users',
          children: [
            { id: 'admin-list', label: 'Admin List' },
            { id: 'role-management', label: 'Role Management' },
            { id: 'permissions', label: 'Permissions' },
            { id: 'activity-logs', label: 'Activity Logs' }
          ]
        },
        {
          id: 'user-analytics',
          label: 'User Analytics',
          children: [
            { id: 'registration-trends', label: 'Registration Trends' },
            { id: 'activity-reports', label: 'Activity Reports' },
            { id: 'demographics', label: 'Demographics' }
          ]
        }
      ]
    },
    {
      id: 'vendor-management',
      label: 'Vendor Management',
      icon: Store,
      color: 'text-purple-500',
      badge: 23,
      children: [
        {
          id: 'vendor-directory',
          label: 'Vendor Directory',
          children: [
            { id: 'active-vendors', label: 'Active Vendors' },
            { id: 'pending-applications', label: 'Pending Applications', badge: 15 },
            { id: 'suspended-vendors', label: 'Suspended Vendors' },
            { id: 'vendor-search', label: 'Vendor Search' }
          ]
        },
        {
          id: 'kyc-verification',
          label: 'KYC Verification',
          badge: 8,
          children: [
            { id: 'document-review', label: 'Document Review', badge: 5 },
            { id: 'trade-license', label: 'Trade License Verification' },
            { id: 'tin-verification', label: 'TIN Verification' },
            { id: 'nid-verification', label: 'NID Verification', badge: 3 },
            { id: 'bank-verification', label: 'Bank Account Verification' }
          ]
        },
        {
          id: 'vendor-performance',
          label: 'Vendor Performance',
          children: [
            { id: 'performance-metrics', label: 'Performance Metrics' },
            { id: 'vendor-scorecard', label: 'Vendor Scorecard' },
            { id: 'rating-management', label: 'Rating Management' },
            { id: 'performance-reports', label: 'Performance Reports' }
          ]
        },
        {
          id: 'financial-management',
          label: 'Financial Management',
          children: [
            { id: 'commission-tracking', label: 'Commission Tracking' },
            { id: 'payout-processing', label: 'Payout Processing' },
            { id: 'revenue-sharing', label: 'Revenue Sharing' },
            { id: 'financial-reports', label: 'Financial Reports' }
          ]
        },
        {
          id: 'vendor-support',
          label: 'Vendor Support',
          children: [
            { id: 'support-tickets', label: 'Support Tickets' },
            { id: 'training-programs', label: 'Training Programs' },
            { id: 'resource-center', label: 'Resource Center' }
          ]
        }
      ]
    },
    {
      id: 'product-management',
      label: 'Product Management',
      icon: Package,
      color: 'text-orange-500',
      badge: 45,
      children: [
        {
          id: 'product-catalog',
          label: 'Product Catalog',
          children: [
            { id: 'all-products', label: 'All Products' },
            { id: 'product-search', label: 'Product Search' },
            { id: 'featured-products', label: 'Featured Products' },
            { id: 'import-export', label: 'Product Import/Export' }
          ]
        },
        {
          id: 'category-management',
          label: 'Category Management',
          children: [
            { id: 'category-structure', label: 'Category Structure' },
            { id: 'category-performance', label: 'Category Performance' },
            { id: 'seasonal-categories', label: 'Seasonal Categories' },
            { id: 'category-analytics', label: 'Category Analytics' }
          ]
        },
        {
          id: 'product-moderation',
          label: 'Product Moderation',
          badge: 25,
          children: [
            { id: 'pending-approvals', label: 'Pending Approvals', badge: 25 },
            { id: 'content-review', label: 'Content Review' },
            { id: 'quality-control', label: 'Quality Control' },
            { id: 'rejected-products', label: 'Rejected Products' }
          ]
        },
        {
          id: 'inventory-management',
          label: 'Inventory Management',
          children: [
            { id: 'stock-overview', label: 'Stock Overview' },
            { id: 'low-stock-alerts', label: 'Low Stock Alerts', badge: 20 },
            { id: 'inventory-reports', label: 'Inventory Reports' },
            { id: 'warehouse-management', label: 'Warehouse Management' }
          ]
        },
        {
          id: 'product-analytics',
          label: 'Product Analytics',
          children: [
            { id: 'best-sellers', label: 'Best Sellers' },
            { id: 'performance-metrics', label: 'Performance Metrics' },
            { id: 'market-trends', label: 'Market Trends' }
          ]
        }
      ]
    },
    {
      id: 'order-management',
      label: 'Order Management',
      icon: ShoppingCart,
      color: 'text-cyan-500',
      badge: 67,
      children: [
        {
          id: 'order-overview',
          label: 'Order Overview',
          children: [
            { id: 'all-orders', label: 'All Orders' },
            { id: 'order-search', label: 'Order Search' },
            { id: 'order-timeline', label: 'Order Timeline' },
            { id: 'bulk-actions', label: 'Bulk Actions' }
          ]
        },
        {
          id: 'order-processing',
          label: 'Order Processing',
          badge: 34,
          children: [
            { id: 'new-orders', label: 'New Orders', badge: 12 },
            { id: 'processing-orders', label: 'Processing Orders', badge: 22 },
            { id: 'shipped-orders', label: 'Shipped Orders' },
            { id: 'delivered-orders', label: 'Delivered Orders' }
          ]
        },
        {
          id: 'payment-management',
          label: 'Payment Management',
          children: [
            { id: 'payment-status', label: 'Payment Status' },
            { id: 'payment-methods', label: 'Payment Methods' },
            { id: 'failed-payments', label: 'Failed Payments', badge: 5 },
            { id: 'refund-processing', label: 'Refund Processing' }
          ]
        },
        {
          id: 'shipping-logistics',
          label: 'Shipping & Logistics',
          children: [
            { id: 'courier-partners', label: 'Courier Partners' },
            { id: 'delivery-tracking', label: 'Delivery Tracking' },
            { id: 'shipping-zones', label: 'Shipping Zones' },
            { id: 'delivery-performance', label: 'Delivery Performance' }
          ]
        },
        {
          id: 'order-analytics',
          label: 'Order Analytics',
          children: [
            { id: 'order-reports', label: 'Order Reports' },
            { id: 'revenue-analytics', label: 'Revenue Analytics' },
            { id: 'performance-metrics', label: 'Performance Metrics' }
          ]
        }
      ]
    },
    {
      id: 'financial-management',
      label: 'Financial Management',
      icon: DollarSign,
      color: 'text-emerald-500',
      children: [
        {
          id: 'revenue-dashboard',
          label: 'Revenue Dashboard',
          children: [
            { id: 'revenue-overview', label: 'Revenue Overview' },
            { id: 'revenue-trends', label: 'Revenue Trends' },
            { id: 'commission-summary', label: 'Commission Summary' },
            { id: 'profit-analytics', label: 'Profit Analytics' }
          ]
        },
        {
          id: 'payment-gateways',
          label: 'Payment Gateways',
          children: [
            { id: 'bkash-integration', label: 'bKash Integration' },
            { id: 'nagad-integration', label: 'Nagad Integration' },
            { id: 'rocket-integration', label: 'Rocket Integration' },
            { id: 'international-gateways', label: 'International Gateways' },
            { id: 'payment-analytics', label: 'Payment Analytics' }
          ]
        },
        {
          id: 'vendor-payouts',
          label: 'Vendor Payouts',
          children: [
            { id: 'payout-schedule', label: 'Payout Schedule' },
            { id: 'pending-payouts', label: 'Pending Payouts', badge: 18 },
            { id: 'payout-history', label: 'Payout History' },
            { id: 'payout-reports', label: 'Payout Reports' }
          ]
        },
        {
          id: 'financial-reports',
          label: 'Financial Reports',
          children: [
            { id: 'daily-reports', label: 'Daily Reports' },
            { id: 'monthly-reports', label: 'Monthly Reports' },
            { id: 'tax-reports', label: 'Tax Reports' },
            { id: 'audit-reports', label: 'Audit Reports' }
          ]
        },
        {
          id: 'transaction-monitoring',
          label: 'Transaction Monitoring',
          children: [
            { id: 'transaction-logs', label: 'Transaction Logs' },
            { id: 'fraud-detection', label: 'Fraud Detection' },
            { id: 'security-monitoring', label: 'Security Monitoring' }
          ]
        }
      ]
    },
    {
      id: 'shipping-logistics',
      label: 'Shipping & Logistics',
      icon: Truck,
      color: 'text-indigo-500',
      children: [
        {
          id: 'courier-partners',
          label: 'Courier Partners',
          children: [
            { id: 'pathao-management', label: 'Pathao Management' },
            { id: 'paperfly-integration', label: 'Paperfly Integration' },
            { id: 'sundarban-coordination', label: 'Sundarban Coordination' },
            { id: 'redx-monitoring', label: 'RedX Monitoring' },
            { id: 'ecourier-tracking', label: 'eCourier Tracking' }
          ]
        },
        {
          id: 'delivery-management',
          label: 'Delivery Management',
          children: [
            { id: 'delivery-zones', label: 'Delivery Zones' },
            { id: 'delivery-scheduling', label: 'Delivery Scheduling' },
            { id: 'route-optimization', label: 'Route Optimization' },
            { id: 'delivery-performance', label: 'Delivery Performance' }
          ]
        },
        {
          id: 'shipping-analytics',
          label: 'Shipping Analytics',
          children: [
            { id: 'delivery-reports', label: 'Delivery Reports' },
            { id: 'performance-metrics', label: 'Performance Metrics' },
            { id: 'cost-analysis', label: 'Cost Analysis' },
            { id: 'customer-satisfaction', label: 'Customer Satisfaction' }
          ]
        },
        {
          id: 'returns-exchanges',
          label: 'Returns & Exchanges',
          children: [
            { id: 'return-requests', label: 'Return Requests', badge: 7 },
            { id: 'exchange-processing', label: 'Exchange Processing' },
            { id: 'refund-management', label: 'Refund Management' },
            { id: 'return-analytics', label: 'Return Analytics' }
          ]
        }
      ]
    },
    {
      id: 'marketing-promotions',
      label: 'Marketing & Promotions',
      icon: Megaphone,
      color: 'text-pink-500',
      children: [
        {
          id: 'campaign-management',
          label: 'Campaign Management',
          children: [
            { id: 'active-campaigns', label: 'Active Campaigns' },
            { id: 'campaign-creation', label: 'Campaign Creation' },
            { id: 'campaign-analytics', label: 'Campaign Analytics' },
            { id: 'campaign-history', label: 'Campaign History' }
          ]
        },
        {
          id: 'promotional-tools',
          label: 'Promotional Tools',
          children: [
            { id: 'discount-codes', label: 'Discount Codes' },
            { id: 'flash-sales', label: 'Flash Sales' },
            { id: 'seasonal-promotions', label: 'Seasonal Promotions' },
            { id: 'bundle-offers', label: 'Bundle Offers' }
          ]
        },
        {
          id: 'content-management',
          label: 'Content Management',
          children: [
            { id: 'banner-management', label: 'Banner Management' },
            { id: 'email-templates', label: 'Email Templates' },
            { id: 'sms-templates', label: 'SMS Templates' },
            { id: 'push-notifications', label: 'Push Notifications' }
          ]
        },
        {
          id: 'marketing-analytics',
          label: 'Marketing Analytics',
          children: [
            { id: 'campaign-performance', label: 'Campaign Performance' },
            { id: 'customer-acquisition', label: 'Customer Acquisition' },
            { id: 'roi-analysis', label: 'ROI Analysis' }
          ]
        }
      ]
    },
    {
      id: 'analytics-reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      color: 'text-violet-500',
      children: [
        {
          id: 'business-intelligence',
          label: 'Business Intelligence',
          children: [
            { id: 'executive-dashboard', label: 'Executive Dashboard' },
            { id: 'kpi-monitoring', label: 'KPI Monitoring' },
            { id: 'performance-metrics', label: 'Performance Metrics' },
            { id: 'trend-analysis', label: 'Trend Analysis' }
          ]
        },
        {
          id: 'sales-analytics',
          label: 'Sales Analytics',
          children: [
            { id: 'sales-reports', label: 'Sales Reports' },
            { id: 'product-performance', label: 'Product Performance' },
            { id: 'vendor-performance', label: 'Vendor Performance' },
            { id: 'market-analysis', label: 'Market Analysis' }
          ]
        },
        {
          id: 'customer-analytics',
          label: 'Customer Analytics',
          children: [
            { id: 'customer-behavior', label: 'Customer Behavior' },
            { id: 'purchase-patterns', label: 'Purchase Patterns' },
            { id: 'customer-segmentation', label: 'Customer Segmentation' },
            { id: 'retention-analysis', label: 'Retention Analysis' }
          ]
        },
        {
          id: 'financial-analytics',
          label: 'Financial Analytics',
          children: [
            { id: 'revenue-analysis', label: 'Revenue Analysis' },
            { id: 'profit-margins', label: 'Profit Margins' },
            { id: 'cost-analysis', label: 'Cost Analysis' },
            { id: 'financial-forecasting', label: 'Financial Forecasting' }
          ]
        },
        {
          id: 'custom-reports',
          label: 'Custom Reports',
          children: [
            { id: 'report-builder', label: 'Report Builder' },
            { id: 'scheduled-reports', label: 'Scheduled Reports' },
            { id: 'export-options', label: 'Export Options' }
          ]
        }
      ]
    },
    {
      id: 'settings-configuration',
      label: 'Settings & Configuration',
      icon: Settings,
      color: 'text-gray-500',
      children: [
        {
          id: 'platform-settings',
          label: 'Platform Settings',
          children: [
            { id: 'general-settings', label: 'General Settings' },
            { id: 'security-settings', label: 'Security Settings' },
            { id: 'api-configuration', label: 'API Configuration' },
            { id: 'system-maintenance', label: 'System Maintenance' }
          ]
        },
        {
          id: 'payment-configuration',
          label: 'Payment Configuration',
          children: [
            { id: 'gateway-settings', label: 'Gateway Settings' },
            { id: 'commission-rates', label: 'Commission Rates' },
            { id: 'currency-settings', label: 'Currency Settings' },
            { id: 'tax-configuration', label: 'Tax Configuration' }
          ]
        },
        {
          id: 'shipping-configuration',
          label: 'Shipping Configuration',
          children: [
            { id: 'courier-settings', label: 'Courier Settings' },
            { id: 'zone-management', label: 'Zone Management' },
            { id: 'rate-configuration', label: 'Rate Configuration' },
            { id: 'delivery-options', label: 'Delivery Options' }
          ]
        },
        {
          id: 'localization',
          label: 'Localization',
          children: [
            { id: 'language-settings', label: 'Language Settings' },
            { id: 'regional-settings', label: 'Regional Settings' },
            { id: 'cultural-adaptation', label: 'Cultural Adaptation' },
            { id: 'festival-management', label: 'Festival Management' }
          ]
        },
        {
          id: 'system-administration',
          label: 'System Administration',
          children: [
            { id: 'user-roles', label: 'User Roles' },
            { id: 'permissions', label: 'Permissions' },
            { id: 'backup-management', label: 'Backup Management' },
            { id: 'system-logs', label: 'System Logs' }
          ]
        }
      ]
    }
  ];

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isExpanded = expandedMenus.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              setActiveTab(item.id);
            }
          }}
          className={`w-full flex items-center px-3 py-2.5 text-left hover:bg-white/80 hover:shadow-sm transition-all duration-200 rounded-lg text-xs group ${
            activeTab === item.id ? 'bg-white shadow-md border-l-4 border-blue-500 text-blue-700' : 'text-gray-600'
          }`}
        >
          <Icon 
            size={20} 
            className={`flex-shrink-0 transition-colors ${
              activeTab === item.id ? 'text-blue-600' : item.color
            } group-hover:${item.color}`} 
          />
          {!collapsed && (
            <>
              <span className="ml-3 font-medium flex-1">{item.label}</span>
              {item.badge && (
                <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-5 flex items-center justify-center ml-2">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                isExpanded ? <ChevronUp size={14} className="ml-2" /> : <ChevronDown size={14} className="ml-2" />
              )}
            </>
          )}
        </button>

        {/* Sub-menu items */}
        {!collapsed && hasChildren && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children?.map((subItem) => (
              <div key={subItem.id}>
                <button
                  onClick={() => {
                    if (subItem.children && subItem.children.length > 0) {
                      toggleMenu(subItem.id);
                    } else {
                      setActiveTab(subItem.id);
                    }
                  }}
                  className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 transition-all duration-200 rounded-md text-xs ${
                    activeTab === subItem.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'
                  }`}
                >
                  <span className="flex-1">{subItem.label}</span>
                  {subItem.badge && (
                    <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center ml-2">
                      {subItem.badge}
                    </Badge>
                  )}
                  {subItem.children && subItem.children.length > 0 && (
                    expandedMenus.has(subItem.id) ? <ChevronUp size={12} className="ml-2" /> : <ChevronDown size={12} className="ml-2" />
                  )}
                </button>

                {/* Sub-sub-menu items */}
                {subItem.children && subItem.children.length > 0 && expandedMenus.has(subItem.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {subItem.children.map((subSubItem) => (
                      <button
                        key={subSubItem.id}
                        onClick={() => setActiveTab(subSubItem.id)}
                        className={`w-full flex items-center px-3 py-1.5 text-left hover:bg-gray-100 transition-all duration-200 rounded-md text-xs ${
                          activeTab === subSubItem.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'
                        }`}
                      >
                        <span className="flex-1">{subSubItem.label}</span>
                        {subSubItem.badge && (
                          <Badge className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[14px] h-3.5 flex items-center justify-center ml-2">
                            {subSubItem.badge}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed left-0 top-[120px] bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-800 transition-all duration-300 z-30 shadow-lg border-r border-gray-200 ${
      collapsed ? 'w-16' : 'w-80'
    }`} style={{ bottom: '-360px', height: 'calc(100vh + 360px)' }}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🏪</span>
            </div>
            <div>
              <span className="font-bold text-lg text-gray-800">GetIt Admin</span>
              <div className="text-xs text-gray-500">Multi-Vendor Platform</div>
              <div className="text-xs text-blue-600 font-medium">v2.0.1</div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Enhanced Scrollable Navigation */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh + 200px)' }}>
        <ScrollArea className="h-full">
          <nav className="p-3">
            {menuItems.map(renderMenuItem)}
          </nav>
        </ScrollArea>
      </div>

      {/* Enhanced Footer - positioned at the extended bottom */}
      {!collapsed && (
        <div className="absolute left-4 right-4" style={{ bottom: '20px' }}>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-200">
            <div className="text-xs text-gray-600 font-medium">System Status</div>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-600 font-medium">All Systems Operational</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Last updated: 2 min ago</div>
          </div>
        </div>
      )}
    </div>
  );
};
