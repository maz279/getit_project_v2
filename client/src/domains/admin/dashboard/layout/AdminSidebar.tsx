/**
 * AdminSidebar - Bangladesh Admin Panel Navigation
 * Amazon.com/Shopee.sg Level Navigation System
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, Users, Store, Package, ShoppingCart, DollarSign, Truck, 
  Megaphone, Headphones, Shield, Globe, Settings, BarChart3, UserCheck,
  CreditCard, MapPin, Calendar, FileText, Bell, Database, ChevronDown,
  ChevronRight, Building2, Banknote, Flag, Languages, Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  labelBn: string;
  icon: any;
  href?: string;
  children?: NavigationItem[];
  badge?: string;
  badgeColor?: string;
}

export function AdminSidebar({ collapsed, onCollapse }: AdminSidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelBn: 'ড্যাশবোর্ড',
      icon: LayoutDashboard,
      children: [
        { id: 'overview', label: 'Platform Overview', labelBn: 'প্ল্যাটফর্ম ওভারভিউ', icon: BarChart3, href: '/admin/dashboard' },
        { id: 'bangladesh-stats', label: 'Bangladesh Market', labelBn: 'বাংলাদেশ মার্কেট', icon: Flag, href: '/admin/dashboard/bangladesh' },
        { id: 'festival-analytics', label: 'Festival Analytics', labelBn: 'উৎসব বিশ্লেষণ', icon: Calendar, href: '/admin/dashboard/festivals' },
        { id: 'real-time', label: 'Real-time Monitoring', labelBn: 'রিয়েল-টাইম মনিটরিং', icon: Database, href: '/admin/dashboard/realtime' }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      labelBn: 'ইউজার ম্যানেজমেন্ট',
      icon: Users,
      children: [
        { id: 'user-list', label: 'User List', labelBn: 'ইউজার তালিকা', icon: Users, href: '/admin/users' },
        { id: 'customer-verification', label: 'Customer Verification', labelBn: 'কাস্টমার যাচাইকরণ', icon: UserCheck, href: '/admin/users/verification' },
        { id: 'user-analytics', label: 'User Analytics', labelBn: 'ইউজার বিশ্লেষণ', icon: BarChart3, href: '/admin/users/analytics' },
        { id: 'suspicious-activity', label: 'Fraud Detection', labelBn: 'জালিয়াতি সনাক্তকরণ', icon: Shield, href: '/admin/users/fraud' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendor Management',
      labelBn: 'বিক্রেতা ম্যানেজমেন্ট',
      icon: Store,
      badge: '12',
      badgeColor: 'bg-red-500',
      children: [
        { id: 'vendor-list', label: 'Vendor List', labelBn: 'বিক্রেতা তালিকা', icon: Store, href: '/admin/vendors' },
        { id: 'vendor-approvals', label: 'Pending Approvals', labelBn: 'অনুমোদনের অপেক্ষায়', icon: UserCheck, href: '/admin/vendors/approvals', badge: '12' },
        { id: 'kyc-verification', label: 'KYC Verification', labelBn: 'কেওয়াইসি যাচাইকরণ', icon: Shield, href: '/admin/vendors/kyc' },
        { id: 'vendor-performance', label: 'Performance', labelBn: 'কর্মক্ষমতা', icon: BarChart3, href: '/admin/vendors/performance' },
        { id: 'vendor-payouts', label: 'Payouts', labelBn: 'পেআউট', icon: DollarSign, href: '/admin/vendors/payouts' },
        { id: 'commission-management', label: 'Commission', labelBn: 'কমিশন', icon: Banknote, href: '/admin/vendors/commission' }
      ]
    },
    {
      id: 'products',
      label: 'Product Management',
      labelBn: 'পণ্য ম্যানেজমেন্ট',
      icon: Package,
      children: [
        { id: 'product-moderation', label: 'Product Moderation', labelBn: 'পণ্য মডারেশন', icon: Package, href: '/admin/products/moderation' },
        { id: 'category-management', label: 'Categories', labelBn: 'বিভাগ', icon: Package, href: '/admin/products/categories' },
        { id: 'bangla-content', label: 'Bangla Content Review', labelBn: 'বাংলা কন্টেন্ট পর্যালোচনা', icon: Languages, href: '/admin/products/bangla' },
        { id: 'seasonal-products', label: 'Festival Products', labelBn: 'উৎসবের পণ্য', icon: Calendar, href: '/admin/products/seasonal' },
        { id: 'price-monitoring', label: 'Price Monitoring', labelBn: 'দাম পর্যবেক্ষণ', icon: DollarSign, href: '/admin/products/pricing' }
      ]
    },
    {
      id: 'orders',
      label: 'Order Management',
      labelBn: 'অর্ডার ম্যানেজমেন্ট',
      icon: ShoppingCart,
      children: [
        { id: 'order-monitoring', label: 'Order Monitoring', labelBn: 'অর্ডার মনিটরিং', icon: ShoppingCart, href: '/admin/orders/monitoring' },
        { id: 'cod-management', label: 'COD Management', labelBn: 'ক্যাশ অন ডেলিভারি', icon: Banknote, href: '/admin/orders/cod' },
        { id: 'dispute-resolution', label: 'Dispute Resolution', labelBn: 'বিরোধ নিষ্পত্তি', icon: Scale, href: '/admin/orders/disputes' },
        { id: 'multi-vendor-orders', label: 'Multi-vendor Orders', labelBn: 'মাল্টি-ভেন্ডর অর্ডার', icon: Building2, href: '/admin/orders/multi-vendor' },
        { id: 'festival-orders', label: 'Festival Orders', labelBn: 'উৎসবের অর্ডার', icon: Calendar, href: '/admin/orders/festival' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance Management',
      labelBn: 'ফিন্যান্স ম্যানেজমেন্ট',
      icon: DollarSign,
      children: [
        { id: 'finance-overview', label: 'Finance Overview', labelBn: 'ফিন্যান্স ওভারভিউ', icon: DollarSign, href: '/admin/finance' },
        { id: 'bd-payment-gateways', label: 'BD Payment Gateways', labelBn: 'বিডি পেমেন্ট গেটওয়ে', icon: CreditCard, href: '/admin/finance/gateways' },
        { id: 'bkash-integration', label: 'bKash Integration', labelBn: 'বিকাশ ইন্টিগ্রেশন', icon: CreditCard, href: '/admin/finance/bkash' },
        { id: 'nagad-integration', label: 'Nagad Integration', labelBn: 'নগদ ইন্টিগ্রেশন', icon: CreditCard, href: '/admin/finance/nagad' },
        { id: 'rocket-integration', label: 'Rocket Integration', labelBn: 'রকেট ইন্টিগ্রেশন', icon: CreditCard, href: '/admin/finance/rocket' },
        { id: 'vat-management', label: 'VAT Management', labelBn: 'ভ্যাট ম্যানেজমেন্ট', icon: FileText, href: '/admin/finance/vat' },
        { id: 'bb-compliance', label: 'Bangladesh Bank Compliance', labelBn: 'বাংলাদেশ ব্যাংক কমপ্লায়েন্স', icon: Building2, href: '/admin/finance/bb-compliance' }
      ]
    },
    {
      id: 'shipping',
      label: 'Shipping Management',
      labelBn: 'শিপিং ম্যানেজমেন্ট',
      icon: Truck,
      children: [
        { id: 'shipping-overview', label: 'Shipping Overview', labelBn: 'শিপিং ওভারভিউ', icon: Truck, href: '/admin/shipping' },
        { id: 'courier-partners', label: 'Courier Partners', labelBn: 'কুরিয়ার পার্টনার', icon: Building2, href: '/admin/shipping/couriers' },
        { id: 'pathao-integration', label: 'Pathao Integration', labelBn: 'পাঠাও ইন্টিগ্রেশন', icon: Truck, href: '/admin/shipping/pathao' },
        { id: 'paperfly-integration', label: 'Paperfly Integration', labelBn: 'পেপারফ্লাই ইন্টিগ্রেশন', icon: Truck, href: '/admin/shipping/paperfly' },
        { id: 'sundarban-integration', label: 'Sundarban Integration', labelBn: 'সুন্দরবন ইন্টিগ্রেশন', icon: Truck, href: '/admin/shipping/sundarban' },
        { id: 'delivery-zones', label: 'BD Delivery Zones', labelBn: 'বিডি ডেলিভারি জোন', icon: MapPin, href: '/admin/shipping/zones' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      labelBn: 'মার্কেটিং',
      icon: Megaphone,
      children: [
        { id: 'campaign-management', label: 'Campaign Management', labelBn: 'ক্যাম্পেইন ম্যানেজমেন্ট', icon: Megaphone, href: '/admin/marketing/campaigns' },
        { id: 'festival-campaigns', label: 'Festival Campaigns', labelBn: 'উৎসব ক্যাম্পেইন', icon: Calendar, href: '/admin/marketing/festivals' },
        { id: 'social-media', label: 'Social Media', labelBn: 'সোশ্যাল মিডিয়া', icon: Megaphone, href: '/admin/marketing/social' },
        { id: 'sms-campaigns', label: 'SMS Campaigns', labelBn: 'এসএমএস ক্যাম্পেইন', icon: Bell, href: '/admin/marketing/sms' }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      labelBn: 'সাপোর্ট',
      icon: Headphones,
      children: [
        { id: 'support-dashboard', label: 'Support Dashboard', labelBn: 'সাপোর্ট ড্যাশবোর্ড', icon: Headphones, href: '/admin/support' },
        { id: 'whatsapp-support', label: 'WhatsApp Support', labelBn: 'হোয়াটসঅ্যাপ সাপোর্ট', icon: Bell, href: '/admin/support/whatsapp' },
        { id: 'bengali-support', label: 'Bengali Support', labelBn: 'বাংলা সাপোর্ট', icon: Languages, href: '/admin/support/bengali' }
      ]
    },
    {
      id: 'compliance',
      label: 'BD Compliance',
      labelBn: 'বিডি কমপ্লায়েন্স',
      icon: Shield,
      children: [
        { id: 'regulatory-compliance', label: 'Regulatory Compliance', labelBn: 'নিয়ামক কমপ্লায়েন্স', icon: Shield, href: '/admin/compliance/regulatory' },
        { id: 'ecommerce-regulations', label: 'E-commerce Laws', labelBn: 'ই-কমার্স আইন', icon: Scale, href: '/admin/compliance/ecommerce' },
        { id: 'data-protection', label: 'Data Protection', labelBn: 'ডেটা সুরক্ষা', icon: Shield, href: '/admin/compliance/data-protection' },
        { id: 'consumer-rights', label: 'Consumer Rights', labelBn: 'ভোক্তা অধিকার', icon: Users, href: '/admin/compliance/consumer-rights' }
      ]
    },
    {
      id: 'localization',
      label: 'Localization',
      labelBn: 'স্থানীয়করণ',
      icon: Globe,
      children: [
        { id: 'language-management', label: 'Language Management', labelBn: 'ভাষা ম্যানেজমেন্ট', icon: Languages, href: '/admin/localization/languages' },
        { id: 'bengali-content', label: 'Bengali Content', labelBn: 'বাংলা কন্টেন্ট', icon: Languages, href: '/admin/localization/bengali' },
        { id: 'cultural-sensitivity', label: 'Cultural Features', labelBn: 'সাংস্কৃতিক বৈশিষ্ট্য', icon: Calendar, href: '/admin/localization/cultural' }
      ]
    },
    {
      id: 'system',
      label: 'System',
      labelBn: 'সিস্টেম',
      icon: Settings,
      children: [
        { id: 'system-settings', label: 'System Settings', labelBn: 'সিস্টেম সেটিংস', icon: Settings, href: '/admin/system/settings' },
        { id: 'security-settings', label: 'Security', labelBn: 'নিরাপত্তা', icon: Shield, href: '/admin/system/security' },
        { id: 'performance-monitor', label: 'Performance', labelBn: 'পারফরম্যান্স', icon: BarChart3, href: '/admin/system/performance' },
        { id: 'database-management', label: 'Database', labelBn: 'ডেটাবেস', icon: Database, href: '/admin/system/database' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      labelBn: 'রিপোর্ট',
      icon: FileText,
      children: [
        { id: 'report-center', label: 'Report Center', labelBn: 'রিপোর্ট সেন্টার', icon: FileText, href: '/admin/reports' },
        { id: 'bangladesh-reports', label: 'Bangladesh Market Reports', labelBn: 'বাংলাদেশ মার্কেট রিপোর্ট', icon: Flag, href: '/admin/reports/bangladesh' },
        { id: 'compliance-reports', label: 'Compliance Reports', labelBn: 'কমপ্লায়েন্স রিপোর্ট', icon: Shield, href: '/admin/reports/compliance' },
        { id: 'festival-analytics', label: 'Festival Analytics', labelBn: 'উৎসব বিশ্লেষণ', icon: Calendar, href: '/admin/reports/festivals' }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.startsWith(href);
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 px-3 text-left",
                level > 0 && "ml-4",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn("px-2 py-1 text-xs rounded-full text-white ml-2", item.badgeColor || "bg-blue-500")}>
                      {item.badge}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          
          {!collapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <Link key={item.id} href={item.href || '#'}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-10 px-3",
            level > 0 && "ml-4",
            collapsed && "justify-center px-2",
            active && "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
          )}
        >
          <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn("px-2 py-1 text-xs rounded-full text-white ml-2", item.badgeColor || "bg-blue-500")}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GI</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">GetIt Admin</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bangladesh Platform</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {navigationItems.map(item => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className="w-full"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </div>
  );
}

export default AdminSidebar;