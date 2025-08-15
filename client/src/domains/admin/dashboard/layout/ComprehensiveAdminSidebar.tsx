/**
 * Comprehensive AdminSidebar - Amazon.com/Shopee.sg Level Complete Implementation
 * Full 13-Section Admin Dashboard as per specification document
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, DollarSign, ShoppingCart, Package, UserCheck,
  Store, Megaphone, BarChart3, Banknote, Truck, Shield, Settings,
  Target, TrendingUp, Activity, Calendar, Flag, Brain, Eye,
  CreditCard, MapPin, FileText, Bell, Database, ChevronDown,
  ChevronRight, Building2, Globe, Languages, Scale, AlertTriangle,
  Zap, Search, Home, Phone, Mail, MessageSquare, Star,
  Clipboard, Clock, Archive, Filter, Download, Upload,
  Edit, Check, X, Plus, Minus, RotateCcw, RefreshCw,
  PieChart, LineChart, AreaChart, Tag, Gift, Percent,
  Layers, Grid, List, BookOpen, HelpCircle, Info
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

export const ComprehensiveAdminSidebar = ({ collapsed, onCollapse }: AdminSidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems([itemId]);
  };

  const isItemExpanded = (itemId: string) => expandedItems.includes(itemId);
  const isItemActive = (href: string) => location.pathname === href;
  const isParentActive = (children: SubMenuItem[]) => 
    children.some(child => location.pathname === child.href);

  const menuItems: MainMenuItem[] = [
    // 1. DASHBOARD - Main administrative overview and key performance indicators
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelBn: 'ড্যাশবোর্ড',
      icon: LayoutDashboard,
      color: 'text-blue-600',
      children: [
        { 
          id: 'overview', 
          label: 'Overview', 
          labelBn: 'ওভারভিউ', 
          icon: Home, 
          href: '/admin/dashboard/overview',
          description: 'Real-time KPI dashboard with widgets'
        },
        { 
          id: 'analytics-dashboard', 
          label: 'Analytics Dashboard', 
          labelBn: 'অ্যানালিটিক্স ড্যাশবোর্ড', 
          icon: BarChart3, 
          href: '/admin/dashboard/analytics',
          description: 'Multi-chart analytics interface'
        },
        { 
          id: 'real-time-metrics', 
          label: 'Real-time Metrics', 
          labelBn: 'রিয়েল-টাইম মেট্রিক্স', 
          icon: Activity, 
          href: '/admin/dashboard/realtime',
          description: 'Live updating counters and monitoring'
        },
        { 
          id: 'kpi-monitoring', 
          label: 'KPI Monitoring', 
          labelBn: 'কেপিআই মনিটরিং', 
          icon: Target, 
          href: '/admin/dashboard/kpi',
          description: 'Platform performance metrics tracking'
        },
        { 
          id: 'performance-insights', 
          label: 'Performance Insights', 
          labelBn: 'পারফরম্যান্স ইনসাইট', 
          icon: TrendingUp, 
          href: '/admin/dashboard/insights',
          description: 'Detailed analytics and seasonal trends'
        }
      ]
    },

    // 2. USER MANAGEMENT - Comprehensive user administration and analytics
    {
      id: 'user-management',
      label: 'User Management',
      labelBn: 'ইউজার ম্যানেজমেন্ট',
      icon: Users,
      color: 'text-green-600',
      children: [
        { 
          id: 'admin-list', 
          label: 'Admin List', 
          labelBn: 'অ্যাডমিন তালিকা', 
          icon: Users, 
          href: '/admin/users/admin-list',
          description: 'Admin user management with roles'
        },
        { 
          id: 'role-management', 
          label: 'Role Management', 
          labelBn: 'রোল ম্যানেজমেন্ট', 
          icon: Shield, 
          href: '/admin/users/roles',
          description: 'Role hierarchy and permissions'
        },
        { 
          id: 'permissions', 
          label: 'Permissions', 
          labelBn: 'অনুমতিসমূহ', 
          icon: Check, 
          href: '/admin/users/permissions',
          description: 'Module-wise permission settings'
        },
        { 
          id: 'activity-logs', 
          label: 'Activity Logs', 
          labelBn: 'কার্যকলাপ লগ', 
          icon: FileText, 
          href: '/admin/users/activity-logs',
          description: 'User activity tracking and auditing'
        },
        { 
          id: 'user-analytics', 
          label: 'User Analytics', 
          labelBn: 'ইউজার অ্যানালিটিক্স', 
          icon: BarChart3, 
          href: '/admin/users/analytics',
          description: 'Registration trends and demographics'
        }
      ]
    },

    // 3. SALES MANAGEMENT - Comprehensive sales analytics and reporting
    {
      id: 'sales-management',
      label: 'Sales Management',
      labelBn: 'বিক্রয় ব্যবস্থাপনা',
      icon: DollarSign,
      color: 'text-emerald-600',
      children: [
        { 
          id: 'sales-overview', 
          label: 'Sales Overview', 
          labelBn: 'বিক্রয় ওভারভিউ', 
          icon: TrendingUp, 
          href: '/admin/sales/overview',
          description: 'Daily sales charts and revenue tracking'
        },
        { 
          id: 'revenue-analytics', 
          label: 'Revenue Analytics', 
          labelBn: 'রাজস্ব বিশ্লেষণ', 
          icon: PieChart, 
          href: '/admin/sales/revenue',
          description: 'Revenue breakdown and profit margins'
        },
        { 
          id: 'sales-reports', 
          label: 'Sales Reports', 
          labelBn: 'বিক্রয় প্রতিবেদন', 
          icon: FileText, 
          href: '/admin/sales/reports',
          description: 'Detailed sales reports and analysis'
        },
        { 
          id: 'sales-forecast', 
          label: 'Sales Forecast', 
          labelBn: 'বিক্রয় পূর্বাভাস', 
          icon: Calendar, 
          href: '/admin/sales/forecast',
          description: 'Predictive analytics and forecasting'
        }
      ]
    },

    // 4. ORDER MANAGEMENT - Complete order lifecycle management
    {
      id: 'order-management',
      label: 'Order Management',
      labelBn: 'অর্ডার ব্যবস্থাপনা',
      icon: ShoppingCart,
      color: 'text-blue-600',
      badge: '23',
      badgeColor: 'bg-red-500',
      children: [
        { 
          id: 'all-orders', 
          label: 'All Orders', 
          labelBn: 'সকল অর্ডার', 
          icon: List, 
          href: '/admin/orders/all',
          description: 'Comprehensive order table with filtering'
        },
        { 
          id: 'order-processing', 
          label: 'Order Processing', 
          labelBn: 'অর্ডার প্রক্রিয়াকরণ', 
          icon: RefreshCw, 
          href: '/admin/orders/processing',
          description: 'Order workflow and fulfillment'
        },
        { 
          id: 'payment-management', 
          label: 'Payment Management', 
          labelBn: 'পেমেন্ট ব্যবস্থাপনা', 
          icon: CreditCard, 
          href: '/admin/orders/payments',
          description: 'Payment status and gateway management'
        },
        { 
          id: 'shipping-logistics', 
          label: 'Shipping & Logistics', 
          labelBn: 'শিপিং ও লজিস্টিক্স', 
          icon: Truck, 
          href: '/admin/orders/shipping',
          description: 'Delivery tracking and courier management'
        },
        { 
          id: 'order-analytics', 
          label: 'Order Analytics', 
          labelBn: 'অর্ডার অ্যানালিটিক্স', 
          icon: BarChart3, 
          href: '/admin/orders/analytics',
          description: 'Order patterns and performance metrics'
        }
      ]
    },

    // 5. PRODUCT MANAGEMENT - Complete product catalog and inventory control
    {
      id: 'product-management',
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
          description: 'Complete product database management'
        },
        { 
          id: 'category-management', 
          label: 'Category Management', 
          labelBn: 'বিভাগ ব্যবস্থাপনা', 
          icon: Layers, 
          href: '/admin/products/categories',
          description: 'Hierarchical category structure'
        },
        { 
          id: 'product-moderation', 
          label: 'Product Moderation', 
          labelBn: 'পণ্য মডারেশন', 
          icon: Eye, 
          href: '/admin/products/moderation',
          description: 'Content review and approval workflow'
        },
        { 
          id: 'inventory-management', 
          label: 'Inventory Management', 
          labelBn: 'ইনভেন্টরি ব্যবস্থাপনা', 
          icon: Database, 
          href: '/admin/products/inventory',
          description: 'Stock levels and warehouse management'
        },
        { 
          id: 'product-analytics', 
          label: 'Product Analytics', 
          labelBn: 'পণ্য অ্যানালিটিক্স', 
          icon: AreaChart, 
          href: '/admin/products/analytics',
          description: 'Best sellers and performance metrics'
        }
      ]
    },

    // 6. CUSTOMER MANAGEMENT - Comprehensive customer relationship management
    {
      id: 'customer-management',
      label: 'Customer Management',
      labelBn: 'কাস্টমার ব্যবস্থাপনা',
      icon: UserCheck,
      color: 'text-purple-600',
      children: [
        { 
          id: 'customer-database', 
          label: 'Customer Database', 
          labelBn: 'কাস্টমার ডেটাবেস', 
          icon: Users, 
          href: '/admin/customers/database',
          description: 'Complete customer information management'
        },
        { 
          id: 'customer-analytics', 
          label: 'Customer Analytics', 
          labelBn: 'কাস্টমার অ্যানালিটিক্স', 
          icon: BarChart3, 
          href: '/admin/customers/analytics',
          description: 'Customer behavior and lifetime value'
        },
        { 
          id: 'customer-support', 
          label: 'Customer Support', 
          labelBn: 'কাস্টমার সাপোর্ট', 
          icon: MessageSquare, 
          href: '/admin/customers/support',
          description: 'Support tickets and live chat'
        },
        { 
          id: 'customer-segments', 
          label: 'Customer Segments', 
          labelBn: 'কাস্টমার বিভাগ', 
          icon: Filter, 
          href: '/admin/customers/segments',
          description: 'Customer segmentation and targeting'
        }
      ]
    },

    // 7. VENDOR MANAGEMENT - Complete multi-vendor platform management
    {
      id: 'vendor-management',
      label: 'Vendor Management',
      labelBn: 'বিক্রেতা ব্যবস্থাপনা',
      icon: Store,
      color: 'text-indigo-600',
      badge: '5',
      badgeColor: 'bg-orange-500',
      children: [
        { 
          id: 'vendor-directory', 
          label: 'Vendor Directory', 
          labelBn: 'বিক্রেতা ডিরেক্টরি', 
          icon: Building2, 
          href: '/admin/vendors/directory',
          description: 'Active vendors and applications'
        },
        { 
          id: 'kyc-verification', 
          label: 'KYC Verification', 
          labelBn: 'কেওয়াইসি যাচাইকরণ', 
          icon: Shield, 
          href: '/admin/vendors/kyc',
          description: 'Bangladesh KYC verification system'
        },
        { 
          id: 'vendor-performance', 
          label: 'Vendor Performance', 
          labelBn: 'বিক্রেতা কর্মক্ষমতা', 
          icon: Star, 
          href: '/admin/vendors/performance',
          description: 'Performance metrics and scorecards'
        },
        { 
          id: 'financial-management', 
          label: 'Financial Management', 
          labelBn: 'আর্থিক ব্যবস্থাপনা', 
          icon: Banknote, 
          href: '/admin/vendors/financial',
          description: 'Commission tracking and payouts'
        },
        { 
          id: 'vendor-support', 
          label: 'Vendor Support', 
          labelBn: 'বিক্রেতা সহায়তা', 
          icon: HelpCircle, 
          href: '/admin/vendors/support',
          description: 'Vendor support and training'
        }
      ]
    },

    // 8. MARKETING & PROMOTIONS - Comprehensive marketing campaign management
    {
      id: 'marketing-promotions',
      label: 'Marketing & Promotions',
      labelBn: 'মার্কেটিং ও প্রমোশন',
      icon: Megaphone,
      color: 'text-pink-600',
      children: [
        { 
          id: 'marketing-campaigns', 
          label: 'Marketing Campaigns', 
          labelBn: 'মার্কেটিং ক্যাম্পেইন', 
          icon: Megaphone, 
          href: '/admin/marketing/campaigns',
          description: 'Campaign creation and analytics'
        },
        { 
          id: 'promotions-discounts', 
          label: 'Promotions & Discounts', 
          labelBn: 'প্রমোশন ও ছাড়', 
          icon: Percent, 
          href: '/admin/marketing/promotions',
          description: 'Discount codes and flash sales'
        },
        { 
          id: 'email-marketing', 
          label: 'Email Marketing', 
          labelBn: 'ইমেইল মার্কেটিং', 
          icon: Mail, 
          href: '/admin/marketing/email',
          description: 'Email campaigns and newsletters'
        },
        { 
          id: 'seasonal-offers', 
          label: 'Seasonal Offers', 
          labelBn: 'মৌসুমী অফার', 
          icon: Gift, 
          href: '/admin/marketing/seasonal',
          description: 'Festival-specific promotions'
        }
      ]
    },

    // 9. ANALYTICS & REPORTS - Business intelligence and comprehensive reporting
    {
      id: 'analytics-reports',
      label: 'Analytics & Reports',
      labelBn: 'অ্যানালিটিক্স ও রিপোর্ট',
      icon: BarChart3,
      color: 'text-cyan-600',
      children: [
        { 
          id: 'business-intelligence', 
          label: 'Business Intelligence', 
          labelBn: 'বিজনেস ইন্টেলিজেন্স', 
          icon: Brain, 
          href: '/admin/analytics/business',
          description: 'Executive dashboard and key metrics'
        },
        { 
          id: 'financial-reports', 
          label: 'Financial Reports', 
          labelBn: 'আর্থিক প্রতিবেদন', 
          icon: LineChart, 
          href: '/admin/analytics/financial',
          description: 'P&L, cash flow, and tax reports'
        },
        { 
          id: 'operational-reports', 
          label: 'Operational Reports', 
          labelBn: 'অপারেশনাল রিপোর্ট', 
          icon: Clipboard, 
          href: '/admin/analytics/operational',
          description: 'Inventory, shipping, and performance'
        },
        { 
          id: 'custom-reports', 
          label: 'Custom Reports', 
          labelBn: 'কাস্টম রিপোর্ট', 
          icon: FileText, 
          href: '/admin/analytics/custom',
          description: 'Custom report builder and scheduler'
        }
      ]
    },

    // 10. FINANCIAL MANAGEMENT - Comprehensive financial operations and reporting
    {
      id: 'financial-management',
      label: 'Financial Management',
      labelBn: 'আর্থিক ব্যবস্থাপনা',
      icon: Banknote,
      color: 'text-green-600',
      children: [
        { 
          id: 'revenue-dashboard', 
          label: 'Revenue Dashboard', 
          labelBn: 'রাজস্ব ড্যাশবোর্ড', 
          icon: TrendingUp, 
          href: '/admin/finance/revenue',
          description: 'Real-time revenue tracking'
        },
        { 
          id: 'payment-gateways', 
          label: 'Payment Gateways', 
          labelBn: 'পেমেন্ট গেটওয়ে', 
          icon: CreditCard, 
          href: '/admin/finance/gateways',
          description: 'bKash, Nagad, Rocket integration'
        },
        { 
          id: 'vendor-payouts', 
          label: 'Vendor Payouts', 
          labelBn: 'বিক্রেতা পেআউট', 
          icon: DollarSign, 
          href: '/admin/finance/payouts',
          description: 'Vendor payment processing'
        },
        { 
          id: 'transaction-monitoring', 
          label: 'Transaction Monitoring', 
          labelBn: 'লেনদেন পর্যবেক্ষণ', 
          icon: Eye, 
          href: '/admin/finance/transactions',
          description: 'Transaction logs and fraud detection'
        }
      ]
    },

    // 11. SHIPPING & LOGISTICS - Complete logistics and delivery management
    {
      id: 'shipping-logistics',
      label: 'Shipping & Logistics',
      labelBn: 'শিপিং ও লজিস্টিক্স',
      icon: Truck,
      color: 'text-amber-600',
      children: [
        { 
          id: 'courier-partners', 
          label: 'Courier Partners', 
          labelBn: 'কুরিয়ার পার্টনার', 
          icon: Building2, 
          href: '/admin/shipping/couriers',
          description: 'Pathao, Paperfly, RedX integration'
        },
        { 
          id: 'delivery-management', 
          label: 'Delivery Management', 
          labelBn: 'ডেলিভারি ব্যবস্থাপনা', 
          icon: MapPin, 
          href: '/admin/shipping/delivery',
          description: 'Zone management and scheduling'
        },
        { 
          id: 'shipping-analytics', 
          label: 'Shipping Analytics', 
          labelBn: 'শিপিং অ্যানালিটিক্স', 
          icon: AreaChart, 
          href: '/admin/shipping/analytics',
          description: 'Delivery performance metrics'
        },
        { 
          id: 'returns-exchanges', 
          label: 'Returns & Exchanges', 
          labelBn: 'রিটার্ন ও এক্সচেঞ্জ', 
          icon: RotateCcw, 
          href: '/admin/shipping/returns',
          description: 'Return processing workflow'
        }
      ]
    },

    // 12. SECURITY & COMPLIANCE - Platform security and regulatory compliance
    {
      id: 'security-compliance',
      label: 'Security & Compliance',
      labelBn: 'নিরাপত্তা ও কমপ্লায়েন্স',
      icon: Shield,
      color: 'text-red-600',
      children: [
        { 
          id: 'security-monitoring', 
          label: 'Security Monitoring', 
          labelBn: 'নিরাপত্তা পর্যবেক্ষণ', 
          icon: Eye, 
          href: '/admin/security/monitoring',
          description: 'Threat detection and fraud prevention'
        },
        { 
          id: 'compliance-management', 
          label: 'Compliance Management', 
          labelBn: 'কমপ্লায়েন্স ব্যবস্থাপনা', 
          icon: Scale, 
          href: '/admin/security/compliance',
          description: 'Data protection and audit trails'
        },
        { 
          id: 'access-control', 
          label: 'Access Control', 
          labelBn: 'অ্যাক্সেস কন্ট্রোল', 
          icon: Users, 
          href: '/admin/security/access',
          description: 'User permissions and authentication'
        },
        { 
          id: 'security-reports', 
          label: 'Security Reports', 
          labelBn: 'নিরাপত্তা প্রতিবেদন', 
          icon: FileText, 
          href: '/admin/security/reports',
          description: 'Security audits and compliance reports'
        }
      ]
    },

    // 13. SETTINGS & CONFIGURATION - Platform settings and system configuration
    {
      id: 'settings-configuration',
      label: 'Settings & Configuration',
      labelBn: 'সেটিংস ও কনফিগারেশন',
      icon: Settings,
      color: 'text-gray-600',
      children: [
        { 
          id: 'system-settings', 
          label: 'System Settings', 
          labelBn: 'সিস্টেম সেটিংস', 
          icon: Settings, 
          href: '/admin/settings/system',
          description: 'General platform configuration'
        },
        { 
          id: 'platform-config', 
          label: 'Platform Configuration', 
          labelBn: 'প্ল্যাটফর্ম কনফিগারেশন', 
          icon: Globe, 
          href: '/admin/settings/platform',
          description: 'Store and payment configuration'
        },
        { 
          id: 'localization', 
          label: 'Localization', 
          labelBn: 'স্থানীয়করণ', 
          icon: Languages, 
          href: '/admin/settings/localization',
          description: 'Language and cultural settings'
        },
        { 
          id: 'api-management', 
          label: 'API Management', 
          labelBn: 'এপিআই ব্যবস্থাপনা', 
          icon: Zap, 
          href: '/admin/settings/api',
          description: 'API keys and integrations'
        }
      ]
    }
  ];

  // Auto-expand the menu containing the active page
  useEffect(() => {
    const activeParent = menuItems.find(item => 
      item.children.some(child => location.pathname === child.href)
    );
    if (activeParent) {
      setExpandedItems([activeParent.id]);
    } else {
      // Default to dashboard if no active parent found
      setExpandedItems(['dashboard']);
    }
  }, [location.pathname]);

  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 overflow-y-auto",
      collapsed ? "w-16" : "w-80"
    )}>
      <div className="p-4">
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className="mb-4 w-full justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Collapsible
              key={item.id}
              open={isItemExpanded(item.id)}
              onOpenChange={() => toggleExpanded(item.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto",
                    isParentActive(item.children) && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", item.color)} />
                    {!collapsed && (
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.labelBn}</span>
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="secondary" className={cn("text-xs", item.badgeColor)}>
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isItemExpanded(item.id) && "rotate-180"
                      )} />
                    </div>
                  )}
                </Button>
              </CollapsibleTrigger>

              {!collapsed && (
                <CollapsibleContent className="space-y-1 pl-4">
                  {item.children.map((child) => (
                    <Link key={child.id} to={child.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start p-3 h-auto text-left",
                          isItemActive(child.href) && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <child.icon className="h-4 w-4 flex-shrink-0 text-gray-500" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{child.label}</span>
                            <span className="text-xs text-gray-500">{child.labelBn}</span>
                            {child.description && (
                              <span className="text-xs text-gray-400 mt-1">{child.description}</span>
                            )}
                          </div>
                          {child.badge && (
                            <Badge variant="secondary" className={cn("text-xs ml-auto", child.badgeColor)}>
                              {child.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          ))}
        </nav>
      </div>
    </aside>
  );
}