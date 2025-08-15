/**
 * Sidebar Component - Amazon.com/Shopee.sg-Level Vendor Dashboard Navigation
 * 
 * Complete Sidebar Navigation System:
 * - Comprehensive vendor dashboard navigation menu
 * - Dynamic navigation based on vendor permissions and KYC status
 * - Bangladesh-specific vendor features integration
 * - Real-time badge indicators for notifications and alerts
 * - Collapsible sections with submenu navigation
 * - Mobile-responsive with touch optimization
 * - Multi-language support (Bengali/English)
 * - Professional vendor branding and store information
 */

import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/helpers/className';
import { 
  Home,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Store,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Shield,
  AlertCircle,
  Bell,
  MessageSquare,
  Truck,
  Star,
  CreditCard,
  Globe,
  X,
  Zap,
  Target,
  Award,
  Calendar,
  Database,
  Headphones
} from 'lucide-react';

// Types
interface NavigationItem {
  id: string;
  name: string;
  nameBn: string;
  href?: string;
  icon: any;
  badge?: number | string;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  children?: NavigationItem[];
  requiresKyc?: boolean;
  requiresActiveStore?: boolean;
  permission?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: any;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  vendor, 
  kycStatus 
}) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dashboard']));

  // Navigation structure based on the comprehensive vendor dashboard
  const navigationItems: NavigationItem[] = useMemo(() => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      nameBn: 'ড্যাশবোর্ড',
      icon: Home,
      children: [
        {
          id: 'overview',
          name: 'Overview',
          nameBn: 'সংক্ষিপ্ত বিবরণ',
          href: '/vendor/dashboard',
          icon: BarChart3
        },
        {
          id: 'analytics',
          name: 'Analytics',
          nameBn: 'বিশ্লেষণ',
          href: '/vendor/analytics',
          icon: TrendingUp,
          requiresKyc: true
        },
        {
          id: 'reports',
          name: 'Reports',
          nameBn: 'প্রতিবেদন',
          href: '/vendor/reports',
          icon: FileText,
          requiresKyc: true
        },
        {
          id: 'notifications',
          name: 'Notifications',
          nameBn: 'বিজ্ঞপ্তি',
          href: '/vendor/notifications',
          icon: Bell,
          badge: vendor?.unreadNotifications || 0,
          badgeColor: 'red'
        }
      ]
    },
    {
      id: 'products',
      name: 'Products',
      nameBn: 'পণ্য',
      icon: Package,
      requiresKyc: true,
      children: [
        {
          id: 'product-list',
          name: 'All Products',
          nameBn: 'সব পণ্য',
          href: '/vendor/products',
          icon: Package,
          badge: vendor?.totalProducts || 0,
          badgeColor: 'blue'
        },
        {
          id: 'add-product',
          name: 'Add Product',
          nameBn: 'পণ্য যোগ করুন',
          href: '/vendor/products/add',
          icon: Zap
        },
        {
          id: 'bulk-upload',
          name: 'Bulk Upload',
          nameBn: 'বাল্ক আপলোড',
          href: '/vendor/products/bulk-upload',
          icon: Database
        },
        {
          id: 'inventory',
          name: 'Inventory',
          nameBn: 'ইনভেন্টরি',
          href: '/vendor/products/inventory',
          icon: Database,
          badge: vendor?.lowStockItems || 0,
          badgeColor: 'yellow'
        },
        {
          id: 'categories',
          name: 'Categories',
          nameBn: 'বিভাগ',
          href: '/vendor/products/categories',
          icon: Target
        },
        {
          id: 'reviews',
          name: 'Reviews',
          nameBn: 'রিভিউ',
          href: '/vendor/products/reviews',
          icon: Star,
          badge: vendor?.pendingReviews || 0,
          badgeColor: 'green'
        }
      ]
    },
    {
      id: 'orders',
      name: 'Orders',
      nameBn: 'অর্ডার',
      icon: ShoppingCart,
      requiresKyc: true,
      children: [
        {
          id: 'order-list',
          name: 'All Orders',
          nameBn: 'সব অর্ডার',
          href: '/vendor/orders',
          icon: ShoppingCart,
          badge: vendor?.newOrders || 0,
          badgeColor: 'red'
        },
        {
          id: 'order-processing',
          name: 'Processing',
          nameBn: 'প্রক্রিয়াকরণ',
          href: '/vendor/orders/processing',
          icon: Zap,
          badge: vendor?.processingOrders || 0,
          badgeColor: 'yellow'
        },
        {
          id: 'shipping',
          name: 'Shipping',
          nameBn: 'শিপিং',
          href: '/vendor/orders/shipping',
          icon: Truck
        },
        {
          id: 'returns',
          name: 'Returns',
          nameBn: 'রিটার্ন',
          href: '/vendor/orders/returns',
          icon: AlertCircle,
          badge: vendor?.pendingReturns || 0,
          badgeColor: 'red'
        }
      ]
    },
    {
      id: 'customers',
      name: 'Customers',
      nameBn: 'গ্রাহক',
      icon: Users,
      requiresKyc: true,
      children: [
        {
          id: 'customer-list',
          name: 'All Customers',
          nameBn: 'সব গ্রাহক',
          href: '/vendor/customers',
          icon: Users,
          badge: vendor?.totalCustomers || 0,
          badgeColor: 'blue'
        },
        {
          id: 'customer-segments',
          name: 'Segments',
          nameBn: 'বিভাগ',
          href: '/vendor/customers/segments',
          icon: Target
        },
        {
          id: 'communication',
          name: 'Communication',
          nameBn: 'যোগাযোগ',
          href: '/vendor/customers/communication',
          icon: MessageSquare
        }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      nameBn: 'মার্কেটিং',
      icon: TrendingUp,
      requiresKyc: true,
      children: [
        {
          id: 'promotions',
          name: 'Promotions',
          nameBn: 'প্রমোশন',
          href: '/vendor/marketing/promotions',
          icon: Award
        },
        {
          id: 'campaigns',
          name: 'Campaigns',
          nameBn: 'ক্যাম্পেইন',
          href: '/vendor/marketing/campaigns',
          icon: Calendar
        },
        {
          id: 'advertising',
          name: 'Advertising',
          nameBn: 'বিজ্ঞাপন',
          href: '/vendor/marketing/advertising',
          icon: Globe
        },
        {
          id: 'seo',
          name: 'SEO Tools',
          nameBn: 'SEO টুলস',
          href: '/vendor/marketing/seo',
          icon: TrendingUp
        }
      ]
    },
    {
      id: 'finances',
      name: 'Finances',
      nameBn: 'আর্থিক',
      icon: DollarSign,
      requiresKyc: true,
      children: [
        {
          id: 'earnings',
          name: 'Earnings',
          nameBn: 'আয়',
          href: '/vendor/finances/earnings',
          icon: DollarSign
        },
        {
          id: 'transactions',
          name: 'Transactions',
          nameBn: 'লেনদেন',
          href: '/vendor/finances/transactions',
          icon: CreditCard
        },
        {
          id: 'invoicing',
          name: 'Invoicing',
          nameBn: 'ইনভয়েসিং',
          href: '/vendor/finances/invoicing',
          icon: FileText
        },
        {
          id: 'tax-reporting',
          name: 'Tax Reports',
          nameBn: 'কর প্রতিবেদন',
          href: '/vendor/finances/tax-reports',
          icon: FileText
        },
        {
          id: 'banking',
          name: 'Banking',
          nameBn: 'ব্যাংকিং',
          href: '/vendor/finances/banking',
          icon: CreditCard
        }
      ]
    },
    {
      id: 'store',
      name: 'Store',
      nameBn: 'দোকান',
      icon: Store,
      children: [
        {
          id: 'store-settings',
          name: 'Store Settings',
          nameBn: 'দোকান সেটিংস',
          href: '/vendor/store/settings',
          icon: Settings
        },
        {
          id: 'store-design',
          name: 'Store Design',
          nameBn: 'দোকান ডিজাইন',
          href: '/vendor/store/design',
          icon: Globe,
          requiresKyc: true
        },
        {
          id: 'kyc-verification',
          name: 'KYC Verification',
          nameBn: 'KYC যাচাইকরণ',
          href: '/vendor/store/kyc',
          icon: Shield,
          badge: kycStatus === 'pending' ? 'Pending' : kycStatus === 'rejected' ? 'Failed' : '',
          badgeColor: kycStatus === 'pending' ? 'yellow' : kycStatus === 'rejected' ? 'red' : 'green'
        },
        {
          id: 'performance',
          name: 'Performance',
          nameBn: 'পারফরম্যান্স',
          href: '/vendor/store/performance',
          icon: BarChart3,
          requiresKyc: true
        }
      ]
    },
    {
      id: 'support',
      name: 'Support',
      nameBn: 'সহায়তা',
      icon: Headphones,
      children: [
        {
          id: 'help-desk',
          name: 'Help Desk',
          nameBn: 'সহায়তা ডেস্ক',
          href: '/vendor/support/tickets',
          icon: HelpCircle,
          badge: vendor?.openTickets || 0,
          badgeColor: 'blue'
        },
        {
          id: 'documentation',
          name: 'Documentation',
          nameBn: 'ডকুমেন্টেশন',
          href: '/vendor/support/docs',
          icon: FileText
        },
        {
          id: 'training',
          name: 'Training',
          nameBn: 'প্রশিক্ষণ',
          href: '/vendor/support/training',
          icon: Award
        }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      nameBn: 'সেটিংস',
      icon: Settings,
      children: [
        {
          id: 'account',
          name: 'Account',
          nameBn: 'অ্যাকাউন্ট',
          href: '/vendor/settings/account',
          icon: Settings
        },
        {
          id: 'payment-settings',
          name: 'Payment Setup',
          nameBn: 'পেমেন্ট সেটআপ',
          href: '/vendor/settings/payments',
          icon: CreditCard
        },
        {
          id: 'shipping-settings',
          name: 'Shipping Setup',
          nameBn: 'শিপিং সেটআপ',
          href: '/vendor/settings/shipping',
          icon: Truck
        },
        {
          id: 'notifications-settings',
          name: 'Notifications',
          nameBn: 'বিজ্ঞপ্তি',
          href: '/vendor/settings/notifications',
          icon: Bell
        },
        {
          id: 'integrations',
          name: 'Integrations',
          nameBn: 'ইন্টিগ্রেশন',
          href: '/vendor/settings/integrations',
          icon: Globe
        }
      ]
    }
  ], [vendor, kycStatus]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Check if item should be disabled
  const isItemDisabled = (item: NavigationItem) => {
    if (item.requiresKyc && kycStatus !== 'approved') return true;
    if (item.requiresActiveStore && vendor?.storeStatus !== 'active') return true;
    return false;
  };

  // Render navigation item
  const renderNavItem = (item: NavigationItem, level = 0) => {
    const isActive = location.pathname === item.href;
    const isExpanded = expandedSections.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isDisabled = isItemDisabled(item);

    if (hasChildren) {
      return (
        <li key={item.id}>
          <button
            onClick={() => toggleSection(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              level === 0 
                ? "text-gray-700 hover:bg-gray-100" 
                : "text-gray-600 hover:bg-gray-50",
              isExpanded && "bg-gray-100 text-gray-900"
            )}
          >
            <div className="flex items-center">
              <item.icon className={cn(
                "flex-shrink-0 h-5 w-5 mr-3",
                level === 0 ? "text-gray-500" : "text-gray-400"
              )} />
              <span>{item.name}</span>
            </div>
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </button>
          
          {isExpanded && item.children && (
            <ul className="mt-1 space-y-1 ml-6">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <NavLink
          to={item.href!}
          className={({ isActive }) => cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            level === 0 
              ? "text-gray-700 hover:bg-gray-100" 
              : "text-gray-600 hover:bg-gray-50",
            isActive && "bg-primary text-white hover:bg-primary-600",
            isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          onClick={(e) => {
            if (isDisabled) {
              e.preventDefault();
            } else if (level === 0) {
              onClose();
            }
          }}
        >
          <div className="flex items-center">
            <item.icon className="flex-shrink-0 h-5 w-5 mr-3" />
            <span>{item.name}</span>
          </div>
          
          {item.badge && (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              {
                "bg-red-100 text-red-800": item.badgeColor === 'red',
                "bg-blue-100 text-blue-800": item.badgeColor === 'blue',
                "bg-green-100 text-green-800": item.badgeColor === 'green',
                "bg-yellow-100 text-yellow-800": item.badgeColor === 'yellow',
                "bg-purple-100 text-purple-800": item.badgeColor === 'purple'
              }
            )}>
              {item.badge}
            </span>
          )}
          
          {isDisabled && (
            <AlertCircle className="h-4 w-4 text-gray-400" />
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {vendor?.storeLogo ? (
                <img
                  src={vendor.storeLogo}
                  alt={vendor.businessName}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {vendor?.businessName || 'Vendor Dashboard'}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {vendor?.storeType || 'Multi-vendor Store'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map(item => renderNavItem(item))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex-shrink-0 h-3 w-3 rounded-full",
              vendor?.isOnline ? "bg-green-400" : "bg-gray-400"
            )} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900">
                {vendor?.isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-gray-500">
                KYC: {kycStatus === 'approved' ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;