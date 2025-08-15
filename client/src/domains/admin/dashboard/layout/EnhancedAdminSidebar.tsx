/**
 * Enhanced AdminSidebar - Professional Menu → Submenu Structure
 * Amazon.com/Shopee.sg Level Navigation with Rich Visual Organization
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, Users, Store, Package, ShoppingCart, DollarSign, Truck, 
  Megaphone, Headphones, Shield, Globe, Settings, BarChart3, UserCheck,
  CreditCard, MapPin, Calendar, FileText, Bell, Database, ChevronDown,
  ChevronRight, Building2, Banknote, Flag, Languages, Scale, Brain,
  AlertTriangle, Activity, Zap, Target, Eye, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  labelBn: string;
  icon: any;
  href: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

interface MainMenuItem {
  id: string;
  label: string;
  labelBn: string;
  icon: any;
  children: SubMenuItem[];
  badge?: string;
  badgeColor?: string;
  color: string;
}

export function EnhancedAdminSidebar({ collapsed, onCollapse }: AdminSidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemExpanded = (itemId: string) => expandedItems.includes(itemId);
  const isItemActive = (href: string) => location === href;
  const isParentActive = (children: SubMenuItem[]) => 
    children.some(child => location === child.href);

  const menuItems: MainMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard & Analytics',
      labelBn: 'ড্যাশবোর্ড ও বিশ্লেষণ',
      icon: LayoutDashboard,
      color: 'text-blue-600',
      children: [
        { 
          id: 'overview', 
          label: 'Platform Overview', 
          labelBn: 'প্ল্যাটফর্ম ওভারভিউ', 
          icon: BarChart3, 
          href: '/admin/dashboard',
          description: 'Main dashboard with key metrics and insights'
        },
        { 
          id: 'bangladesh-market', 
          label: 'Bangladesh Market', 
          labelBn: 'বাংলাদেশ মার্কেট', 
          icon: Flag, 
          href: '/admin/dashboard/bangladesh',
          description: 'Bangladesh-specific market analysis and trends'
        },
        { 
          id: 'real-time', 
          label: 'Real-time Monitor', 
          labelBn: 'রিয়েল-টাইম মনিটর', 
          icon: Activity, 
          href: '/admin/dashboard/realtime',
          description: 'Live system monitoring and alerts'
        },
        { 
          id: 'festival-analytics', 
          label: 'Festival Analytics', 
          labelBn: 'উৎসব বিশ্লেষণ', 
          icon: Calendar, 
          href: '/admin/dashboard/festivals',
          description: 'Cultural events and festival performance tracking'
        }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      labelBn: 'ইউজার ম্যানেজমেন্ট',
      icon: Users,
      color: 'text-green-600',
      children: [
        { 
          id: 'user-list', 
          label: 'User Directory', 
          labelBn: 'ইউজার ডিরেক্টরি', 
          icon: Users, 
          href: '/admin/users/directory',
          description: 'Complete user database with search and filters'
        },
        { 
          id: 'customer-verification', 
          label: 'Customer KYC', 
          labelBn: 'কাস্টমার কেওয়াইসি', 
          icon: UserCheck, 
          href: '/admin/users/kyc',
          description: 'Customer identity verification and compliance'
        },
        { 
          id: 'user-analytics', 
          label: 'Behavior Analytics', 
          labelBn: 'আচরণ বিশ্লেষণ', 
          icon: BarChart3, 
          href: '/admin/users/analytics',
          description: 'User behavior patterns and engagement metrics'
        },
        { 
          id: 'fraud-detection', 
          label: 'Fraud Detection', 
          labelBn: 'জালিয়াতি সনাক্তকরণ', 
          icon: Shield, 
          href: '/admin/users/fraud',
          description: 'AI-powered fraud detection and prevention',
          badge: 'NEW'
        }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendor Operations',
      labelBn: 'বিক্রেতা পরিচালনা',
      icon: Store,
      color: 'text-purple-600',
      badge: '12',
      badgeColor: 'bg-red-500',
      children: [
        { 
          id: 'vendor-dashboard', 
          label: 'Vendor Dashboard', 
          labelBn: 'বিক্রেতা ড্যাশবোর্ড', 
          icon: Store, 
          href: '/admin/vendors/dashboard',
          description: 'Comprehensive vendor management hub'
        },
        { 
          id: 'vendor-approvals', 
          label: 'Pending Approvals', 
          labelBn: 'অনুমোদনের অপেক্ষায়', 
          icon: UserCheck, 
          href: '/admin/vendors/approvals',
          badge: '12',
          badgeColor: 'bg-red-500',
          description: 'Vendor applications requiring approval'
        },
        { 
          id: 'kyc-verification', 
          label: 'KYC Verification', 
          labelBn: 'কেওয়াইসি যাচাইকরণ', 
          icon: Shield, 
          href: '/admin/vendors/kyc',
          description: 'Bangladesh vendor KYC verification system'
        },
        { 
          id: 'performance-tracking', 
          label: 'Performance', 
          labelBn: 'কর্মক্ষমতা', 
          icon: BarChart3, 
          href: '/admin/vendors/performance',
          description: 'Vendor performance metrics and analytics'
        },
        { 
          id: 'payout-management', 
          label: 'Payouts', 
          labelBn: 'পেআউট', 
          icon: DollarSign, 
          href: '/admin/vendors/payouts',
          description: 'Vendor payment processing and history'
        }
      ]
    },
    {
      id: 'products',
      label: 'Product Management',
      labelBn: 'পণ্য ব্যবস্থাপনা',
      icon: Package,
      color: 'text-orange-600',
      children: [
        { 
          id: 'product-catalog', 
          label: 'Product Catalog', 
          labelBn: 'পণ্য ক্যাটালগ', 
          icon: Package, 
          href: '/admin/products/catalog',
          description: 'Complete product database with bulk operations'
        },
        { 
          id: 'inventory-management', 
          label: 'Inventory Control', 
          labelBn: 'ইনভেন্টরি নিয়ন্ত্রণ', 
          icon: Database, 
          href: '/admin/products/inventory',
          description: 'Stock levels, alerts, and management'
        },
        { 
          id: 'category-management', 
          label: 'Categories', 
          labelBn: 'বিভাগসমূহ', 
          icon: FileText, 
          href: '/admin/products/categories',
          description: 'Product category hierarchy and management'
        },
        { 
          id: 'content-moderation', 
          label: 'Content Review', 
          labelBn: 'কন্টেন্ট পর্যালোচনা', 
          icon: Eye, 
          href: '/admin/products/moderation',
          description: 'Product content moderation and approval'
        },
        { 
          id: 'pricing-control', 
          label: 'Price Monitoring', 
          labelBn: 'দাম পর্যবেক্ষণ', 
          icon: DollarSign, 
          href: '/admin/products/pricing',
          description: 'Dynamic pricing and market monitoring'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Order Operations',
      labelBn: 'অর্ডার পরিচালনা',
      icon: ShoppingCart,
      color: 'text-indigo-600',
      children: [
        { 
          id: 'order-center', 
          label: 'Order Center', 
          labelBn: 'অর্ডার কেন্দ্র', 
          icon: ShoppingCart, 
          href: '/admin/orders/center',
          description: 'Central order management and processing hub'
        },
        { 
          id: 'fulfillment', 
          label: 'Order Fulfillment', 
          labelBn: 'অর্ডার পূরণ', 
          icon: Truck, 
          href: '/admin/orders/fulfillment',
          description: 'Order processing and fulfillment workflows'
        },
        { 
          id: 'cod-management', 
          label: 'COD Management', 
          labelBn: 'ক্যাশ অন ডেলিভারি', 
          icon: Banknote, 
          href: '/admin/orders/cod',
          description: 'Cash on delivery order management'
        },
        { 
          id: 'returns-refunds', 
          label: 'Returns & Refunds', 
          labelBn: 'রিটার্ন ও রিফান্ড', 
          icon: Scale, 
          href: '/admin/orders/returns',
          description: 'Return processing and refund management'
        },
        { 
          id: 'dispute-resolution', 
          label: 'Disputes', 
          labelBn: 'বিরোধ নিষ্পত্তি', 
          icon: AlertTriangle, 
          href: '/admin/orders/disputes',
          description: 'Order dispute resolution center'
        }
      ]
    },
    {
      id: 'finance',
      label: 'Financial Operations',
      labelBn: 'আর্থিক পরিচালনা',
      icon: DollarSign,
      color: 'text-emerald-600',
      children: [
        { 
          id: 'finance-dashboard', 
          label: 'Finance Dashboard', 
          labelBn: 'ফিন্যান্স ড্যাশবোর্ড', 
          icon: BarChart3, 
          href: '/admin/finance/dashboard',
          description: 'Comprehensive financial overview and metrics'
        },
        { 
          id: 'payment-gateways', 
          label: 'Payment Gateways', 
          labelBn: 'পেমেন্ট গেটওয়ে', 
          icon: CreditCard, 
          href: '/admin/finance/gateways',
          description: 'bKash, Nagad, Rocket gateway management'
        },
        { 
          id: 'transaction-monitoring', 
          label: 'Transactions', 
          labelBn: 'লেনদেন', 
          icon: Activity, 
          href: '/admin/finance/transactions',
          description: 'Real-time transaction monitoring and reports'
        },
        { 
          id: 'revenue-analytics', 
          label: 'Revenue Analytics', 
          labelBn: 'রাজস্ব বিশ্লেষণ', 
          icon: TrendingUp, 
          href: '/admin/finance/revenue',
          description: 'Revenue tracking and financial analytics'
        },
        { 
          id: 'tax-compliance', 
          label: 'Tax & Compliance', 
          labelBn: 'কর ও কমপ্লায়েন্স', 
          icon: FileText, 
          href: '/admin/finance/compliance',
          description: 'Bangladesh tax management and compliance'
        }
      ]
    },
    {
      id: 'shipping',
      label: 'Shipping & Logistics',
      labelBn: 'শিপিং ও লজিস্টিক্স',
      icon: Truck,
      color: 'text-cyan-600',
      children: [
        { 
          id: 'shipping-center', 
          label: 'Shipping Center', 
          labelBn: 'শিপিং কেন্দ্র', 
          icon: Truck, 
          href: '/admin/shipping/center',
          description: 'Central shipping and logistics management'
        },
        { 
          id: 'courier-partners', 
          label: 'Courier Partners', 
          labelBn: 'কুরিয়ার পার্টনার', 
          icon: Building2, 
          href: '/admin/shipping/couriers',
          description: 'Pathao, Paperfly, Sundarban partner management'
        },
        { 
          id: 'delivery-tracking', 
          label: 'Delivery Tracking', 
          labelBn: 'ডেলিভারি ট্র্যাকিং', 
          icon: MapPin, 
          href: '/admin/shipping/tracking',
          description: 'Real-time delivery tracking and updates'
        },
        { 
          id: 'zone-management', 
          label: 'Delivery Zones', 
          labelBn: 'ডেলিভারি জোন', 
          icon: Globe, 
          href: '/admin/shipping/zones',
          description: 'Bangladesh delivery zone configuration'
        },
        { 
          id: 'shipping-analytics', 
          label: 'Logistics Analytics', 
          labelBn: 'লজিস্টিক্স বিশ্লেষণ', 
          icon: BarChart3, 
          href: '/admin/shipping/analytics',
          description: 'Shipping performance and cost analysis'
        }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing & Promotions',
      labelBn: 'মার্কেটিং ও প্রমোশন',
      icon: Megaphone,
      color: 'text-pink-600',
      children: [
        { 
          id: 'campaign-center', 
          label: 'Campaign Center', 
          labelBn: 'ক্যাম্পেইন কেন্দ্র', 
          icon: Megaphone, 
          href: '/admin/marketing/campaigns',
          description: 'Marketing campaign creation and management'
        },
        { 
          id: 'festival-marketing', 
          label: 'Festival Campaigns', 
          labelBn: 'উৎসব ক্যাম্পেইন', 
          icon: Calendar, 
          href: '/admin/marketing/festivals',
          description: 'Eid, Puja, and cultural event marketing'
        },
        { 
          id: 'social-media', 
          label: 'Social Media', 
          labelBn: 'সোশ্যাল মিডিয়া', 
          icon: Globe, 
          href: '/admin/marketing/social',
          description: 'Social media marketing and engagement'
        },
        { 
          id: 'email-sms', 
          label: 'Email & SMS', 
          labelBn: 'ইমেইল ও এসএমএস', 
          icon: Bell, 
          href: '/admin/marketing/messaging',
          description: 'Email and SMS marketing campaigns'
        },
        { 
          id: 'loyalty-programs', 
          label: 'Loyalty Programs', 
          labelBn: 'লয়ালটি প্রোগ্রাম', 
          icon: Target, 
          href: '/admin/marketing/loyalty',
          description: 'Customer loyalty and reward programs'
        }
      ]
    },
    {
      id: 'ai-ml',
      label: 'AI & Machine Learning',
      labelBn: 'এআই ও মেশিন লার্নিং',
      icon: Brain,
      color: 'text-violet-600',
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      children: [
        { 
          id: 'ml-dashboard', 
          label: 'ML Dashboard', 
          labelBn: 'এমএল ড্যাশবোর্ড', 
          icon: Brain, 
          href: '/admin/dashboard/ml-dashboard',
          description: 'AI/ML model management and monitoring'
        },
        { 
          id: 'recommendation-engine', 
          label: 'Recommendations', 
          labelBn: 'সুপারিশ ইঞ্জিন', 
          icon: Target, 
          href: '/admin/ai/recommendations',
          description: 'Product recommendation system management'
        },
        { 
          id: 'fraud-ai', 
          label: 'Fraud Detection AI', 
          labelBn: 'জালিয়াতি সনাক্তকরণ এআই', 
          icon: Shield, 
          href: '/admin/ai/fraud',
          description: 'AI-powered fraud detection and prevention'
        },
        { 
          id: 'price-optimization', 
          label: 'Price Optimization', 
          labelBn: 'দাম অপ্টিমাইজেশন', 
          icon: DollarSign, 
          href: '/admin/ai/pricing',
          description: 'AI-driven dynamic pricing optimization'
        },
        { 
          id: 'demand-forecasting', 
          label: 'Demand Forecasting', 
          labelBn: 'চাহিদা পূর্বাভাস', 
          icon: TrendingUp, 
          href: '/admin/ai/forecasting',
          description: 'Predictive demand and inventory planning'
        }
      ]
    },
    {
      id: 'support',
      label: 'Customer Support',
      labelBn: 'কাস্টমার সাপোর্ট',
      icon: Headphones,
      color: 'text-teal-600',
      children: [
        { 
          id: 'support-center', 
          label: 'Support Center', 
          labelBn: 'সাপোর্ট কেন্দ্র', 
          icon: Headphones, 
          href: '/admin/support/center',
          description: 'Central customer support management'
        },
        { 
          id: 'live-chat', 
          label: 'Live Chat', 
          labelBn: 'লাইভ চ্যাট', 
          icon: Bell, 
          href: '/admin/support/chat',
          description: 'Real-time customer chat support'
        },
        { 
          id: 'ticket-management', 
          label: 'Ticket System', 
          labelBn: 'টিকিট সিস্টেম', 
          icon: FileText, 
          href: '/admin/support/tickets',
          description: 'Support ticket management and tracking'
        },
        { 
          id: 'knowledge-base', 
          label: 'Knowledge Base', 
          labelBn: 'জ্ঞান ভাণ্ডার', 
          icon: Database, 
          href: '/admin/support/knowledge',
          description: 'FAQ and knowledge base management'
        },
        { 
          id: 'multilingual-support', 
          label: 'Bengali Support', 
          labelBn: 'বাংলা সাপোর্ট', 
          icon: Languages, 
          href: '/admin/support/bengali',
          description: 'Bengali language customer support'
        }
      ]
    },
    {
      id: 'system',
      label: 'System Management',
      labelBn: 'সিস্টেম ব্যবস্থাপনা',
      icon: Settings,
      color: 'text-gray-600',
      children: [
        { 
          id: 'system-overview', 
          label: 'System Health', 
          labelBn: 'সিস্টেম স্বাস্থ্য', 
          icon: Activity, 
          href: '/admin/system/health',
          description: 'System performance and health monitoring'
        },
        { 
          id: 'security-center', 
          label: 'Security Center', 
          labelBn: 'নিরাপত্তা কেন্দ্র', 
          icon: Shield, 
          href: '/admin/system/security',
          description: 'Security monitoring and threat detection'
        },
        { 
          id: 'database-management', 
          label: 'Database', 
          labelBn: 'ডেটাবেস', 
          icon: Database, 
          href: '/admin/system/database',
          description: 'Database management and optimization'
        },
        { 
          id: 'backup-recovery', 
          label: 'Backup & Recovery', 
          labelBn: 'ব্যাকআপ ও পুনরুদ্ধার', 
          icon: Shield, 
          href: '/admin/system/backup',
          description: 'Data backup and disaster recovery'
        },
        { 
          id: 'system-logs', 
          label: 'System Logs', 
          labelBn: 'সিস্টেম লগ', 
          icon: FileText, 
          href: '/admin/system/logs',
          description: 'System logs and audit trails'
        }
      ]
    }
  ];

  const renderMenuItem = (item: MainMenuItem) => {
    const isExpanded = isItemExpanded(item.id);
    const isActive = isParentActive(item.children);

    return (
      <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200",
              isActive && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500",
              collapsed && "px-2"
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={cn("h-5 w-5", item.color)} />
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.labelBn}
                  </span>
                </div>
              )}
              {!collapsed && item.badge && (
                <Badge className={cn("text-xs", item.badgeColor || "bg-blue-500")}>
                  {item.badge}
                </Badge>
              )}
            </div>
            {!collapsed && (
              isExpanded ? 
                <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        {!collapsed && (
          <CollapsibleContent className="space-y-1">
            {item.children.map((subItem) => (
              <Link key={subItem.id} href={subItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-3 pl-12 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200",
                    isItemActive(subItem.href) && "bg-blue-100 dark:bg-blue-900/30 border-r-2 border-blue-500"
                  )}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <subItem.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex flex-col items-start flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                          {subItem.label}
                        </span>
                        {subItem.badge && (
                          <Badge className={cn("text-xs", subItem.badgeColor || "bg-blue-500")}>
                            {subItem.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {subItem.labelBn}
                      </span>
                      {subItem.description && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {subItem.description}
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              </Link>
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      collapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                🇧🇩 GetIt Admin
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Amazon/Shopee Level Platform
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapse(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
        {menuItems.map(renderMenuItem)}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              GetIt Bangladesh v2.0
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Enterprise Admin Panel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedAdminSidebar;