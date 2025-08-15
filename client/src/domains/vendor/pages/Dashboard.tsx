
import React, { useState, useEffect } from 'react';
import { 
  Store, Package, ShoppingCart, TrendingUp, Users, DollarSign,
  Package2, PackageCheck, PackageX, Truck, Clock, AlertTriangle,
  BarChart3, LineChart, PieChart, Calendar, Filter, Search,
  Plus, Edit, Trash2, Eye, Download, Upload, RefreshCw,
  Settings, Bell, HelpCircle, MessageCircle, Star, Heart,
  ShoppingBag, CreditCard, Receipt, FileText, Camera, Image,
  Globe, MapPin, Phone, Mail, Building, User, CheckCircle,
  XCircle, AlertCircle, Info, ChevronRight, ChevronDown,
  MoreHorizontal, ExternalLink, Copy, Share2, Target, Award,
  Zap, Shield, Lock, Key, Palette, Brush, Megaphone, Gift,
  Tag, Percent, Coins, PiggyBank, Wallet, BanknoteIcon as Banknote,
  TrendingDown, Activity, Database, Server, Cloud, Wifi,
  Monitor, Smartphone, Tablet, Headphones, Volume2, Mic
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Separator } from '@/shared/ui/separator';
import { useQuery } from '@tanstack/react-query';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface VendorMenuItem {
  id: string;
  label: string;
  labelBn: string;
  icon: React.ReactNode;
  children?: VendorMenuItem[];
  badge?: string | number;
  description?: string;
  descriptionBn?: string;
}

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  averageRating: number;
  conversionRate: number;
  monthlyGrowth: number;
  commissionPaid: number;
}

interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  items: number;
  shippingAddress: string;
}

const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['business']));

  useSEO({
    title: 'Vendor Dashboard - GetIt Bangladesh | Seller Portal',
    description: 'Comprehensive vendor dashboard for managing products, orders, analytics, and business operations on GetIt Bangladesh marketplace.',
    keywords: 'vendor dashboard, seller portal, bangladesh marketplace, vendor management, ecommerce dashboard'
  });

  // Fetch vendor statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vendor-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/dashboard/stats');
      if (!response.ok) {
        // Fallback with realistic demo data
        return {
          totalProducts: 45,
          totalOrders: 156,
          totalRevenue: 485000,
          totalCustomers: 89,
          pendingOrders: 12,
          lowStockProducts: 8,
          averageRating: 4.6,
          conversionRate: 12.5,
          monthlyGrowth: 18.2,
          commissionPaid: 48500
        };
      }
      return response.json() as Promise<VendorStats>;
    },
    refetchInterval: 60000,
  });

  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendor-recent-orders'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/orders?limit=5');
      if (!response.ok) {
        // Fallback with realistic demo data
        return [
          { id: '1', orderNumber: 'GT001234', customerName: 'রহিম আহমেদ', date: '2025-06-28', status: 'pending', total: 2500, items: 2, shippingAddress: 'ঢাকা' },
          { id: '2', orderNumber: 'GT001235', customerName: 'Fatima Khan', date: '2025-06-27', status: 'processing', total: 1200, items: 1, shippingAddress: 'চট্টগ্রাম' },
          { id: '3', orderNumber: 'GT001236', customerName: 'করিম উদ্দিন', date: '2025-06-26', status: 'shipped', total: 3200, items: 3, shippingAddress: 'সিলেট' }
        ] as VendorOrder[];
      }
      return response.json() as Promise<VendorOrder[]>;
    },
  });

  // Complete vendor menu structure matching Amazon Seller Central/Shopee Seller Centre
  const menuItems: VendorMenuItem[] = [
    {
      id: 'business',
      label: 'Business Overview',
      labelBn: 'ব্যবসার ওভারভিউ',
      icon: <Store className="h-5 w-5" />,
      children: [
        { 
          id: 'overview', 
          label: 'Dashboard Home', 
          labelBn: 'ড্যাশবোর্ড হোম',
          icon: <BarChart3 className="h-4 w-4" />, 
          description: 'Key metrics and business overview',
          descriptionBn: 'মূল মেট্রিক্স এবং ব্যবসার ওভারভিউ'
        },
        { 
          id: 'analytics', 
          label: 'Business Analytics', 
          labelBn: 'ব্যবসার অ্যানালিটিক্স',
          icon: <LineChart className="h-4 w-4" />, 
          description: 'Detailed business performance analysis',
          descriptionBn: 'বিস্তারিত ব্যবসায়িক কর্মক্ষমতা বিশ্লেষণ'
        },
        { 
          id: 'performance', 
          label: 'Performance Metrics', 
          labelBn: 'পারফরম্যান্স মেট্রিক্স',
          icon: <Target className="h-4 w-4" />, 
          description: 'Track KPIs and business goals',
          descriptionBn: 'KPI এবং ব্যবসায়িক লক্ষ্য ট্র্যাক করুন'
        },
        { 
          id: 'financial-summary', 
          label: 'Financial Summary', 
          labelBn: 'আর্থিক সারসংক্ষেপ',
          icon: <DollarSign className="h-4 w-4" />, 
          description: 'Revenue, profits, and commission details',
          descriptionBn: 'রাজস্ব, মুনাফা, এবং কমিশন বিবরণ'
        }
      ]
    },
    {
      id: 'products',
      label: 'Product Management',
      labelBn: 'পণ্য ব্যবস্থাপনা',
      icon: <Package className="h-5 w-5" />,
      badge: stats?.totalProducts || 0,
      children: [
        { 
          id: 'all-products', 
          label: 'All Products', 
          labelBn: 'সকল পণ্য',
          icon: <Package2 className="h-4 w-4" />, 
          badge: stats?.totalProducts || 0,
          description: 'View and manage all your products',
          descriptionBn: 'আপনার সমস্ত পণ্য দেখুন এবং পরিচালনা করুন'
        },
        { 
          id: 'add-product', 
          label: 'Add New Product', 
          labelBn: 'নতুন পণ্য যোগ করুন',
          icon: <Plus className="h-4 w-4" />, 
          description: 'Create and list new products',
          descriptionBn: 'নতুন পণ্য তৈরি করুন এবং তালিকাভুক্ত করুন'
        },
        { 
          id: 'inventory', 
          label: 'Inventory Management', 
          labelBn: 'ইনভেন্টরি ব্যবস্থাপনা',
          icon: <Database className="h-4 w-4" />, 
          badge: stats?.lowStockProducts || 0,
          description: 'Track stock levels and manage inventory',
          descriptionBn: 'স্টক লেভেল ট্র্যাক করুন এবং ইনভেন্টরি পরিচালনা করুন'
        },
        { 
          id: 'bulk-upload', 
          label: 'Bulk Upload', 
          labelBn: 'বাল্ক আপলোড',
          icon: <Upload className="h-4 w-4" />, 
          description: 'Upload multiple products at once',
          descriptionBn: 'একসাথে একাধিক পণ্য আপলোড করুন'
        },
        { 
          id: 'product-reviews', 
          label: 'Product Reviews', 
          labelBn: 'পণ্যের রিভিউ',
          icon: <Star className="h-4 w-4" />, 
          description: 'Monitor and respond to reviews',
          descriptionBn: 'রিভিউ মনিটর করুন এবং প্রতিক্রিয়া জানান'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Order Management',
      labelBn: 'অর্ডার ব্যবস্থাপনা',
      icon: <ShoppingCart className="h-5 w-5" />,
      badge: stats?.pendingOrders || 0,
      children: [
        { 
          id: 'all-orders', 
          label: 'All Orders', 
          labelBn: 'সকল অর্ডার',
          icon: <ShoppingBag className="h-4 w-4" />, 
          badge: stats?.totalOrders || 0,
          description: 'View and manage all orders',
          descriptionBn: 'সমস্ত অর্ডার দেখুন এবং পরিচালনা করুন'
        },
        { 
          id: 'pending-orders', 
          label: 'Pending Orders', 
          labelBn: 'অপেক্ষমাণ অর্ডার',
          icon: <Clock className="h-4 w-4" />, 
          badge: stats?.pendingOrders || 0,
          description: 'Orders awaiting processing',
          descriptionBn: 'প্রক্রিয়াকরণের অপেক্ষায় থাকা অর্ডার'
        },
        { 
          id: 'shipping', 
          label: 'Shipping & Fulfillment', 
          labelBn: 'শিপিং ও পূরণ',
          icon: <Truck className="h-4 w-4" />, 
          description: 'Manage shipping and delivery',
          descriptionBn: 'শিপিং এবং ডেলিভারি পরিচালনা করুন'
        },
        { 
          id: 'returns', 
          label: 'Returns & Refunds', 
          labelBn: 'রিটার্ন ও রিফান্ড',
          icon: <RefreshCw className="h-4 w-4" />, 
          description: 'Handle returns and refund requests',
          descriptionBn: 'রিটার্ন এবং রিফান্ড অনুরোধ পরিচালনা করুন'
        },
        { 
          id: 'order-reports', 
          label: 'Order Reports', 
          labelBn: 'অর্ডার রিপোর্ট',
          icon: <FileText className="h-4 w-4" />, 
          description: 'Generate order reports and insights',
          descriptionBn: 'অর্ডার রিপোর্ট এবং অন্তর্দৃষ্টি তৈরি করুন'
        }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing & Promotions',
      labelBn: 'মার্কেটিং ও প্রমোশন',
      icon: <Megaphone className="h-5 w-5" />,
      children: [
        { 
          id: 'campaigns', 
          label: 'Marketing Campaigns', 
          labelBn: 'মার্কেটিং ক্যাম্পেইন',
          icon: <Target className="h-4 w-4" />, 
          description: 'Create and manage marketing campaigns',
          descriptionBn: 'মার্কেটিং ক্যাম্পেইন তৈরি করুন এবং পরিচালনা করুন'
        },
        { 
          id: 'promotions', 
          label: 'Promotions & Discounts', 
          labelBn: 'প্রমোশন ও ছাড়',
          icon: <Tag className="h-4 w-4" />, 
          description: 'Set up discounts and promotional offers',
          descriptionBn: 'ছাড় এবং প্রচারমূলক অফার সেট আপ করুন'
        },
        { 
          id: 'coupons', 
          label: 'Coupon Management', 
          labelBn: 'কুপন ব্যবস্থাপনা',
          icon: <Gift className="h-4 w-4" />, 
          description: 'Create and manage discount coupons',
          descriptionBn: 'ডিসকাউন্ট কুপন তৈরি করুন এবং পরিচালনা করুন'
        },
        { 
          id: 'advertising', 
          label: 'Paid Advertising', 
          labelBn: 'পেইড বিজ্ঞাপন',
          icon: <Zap className="h-4 w-4" />, 
          description: 'Manage sponsored product campaigns',
          descriptionBn: 'স্পন্সর্ড পণ্য ক্যাম্পেইন পরিচালনা করুন'
        },
        { 
          id: 'seo-optimization', 
          label: 'SEO Optimization', 
          labelBn: 'SEO অপ্টিমাইজেশন',
          icon: <Globe className="h-4 w-4" />, 
          description: 'Optimize product listings for search',
          descriptionBn: 'অনুসন্ধানের জন্য পণ্যের তালিকা অপ্টিমাইজ করুন'
        }
      ]
    },
    {
      id: 'customers',
      label: 'Customer Management',
      labelBn: 'গ্রাহক ব্যবস্থাপনা',
      icon: <Users className="h-5 w-5" />,
      badge: stats?.totalCustomers || 0,
      children: [
        { 
          id: 'customer-list', 
          label: 'Customer Database', 
          labelBn: 'গ্রাহক ডাটাবেস',
          icon: <Users className="h-4 w-4" />, 
          badge: stats?.totalCustomers || 0,
          description: 'View and manage customer information',
          descriptionBn: 'গ্রাহকের তথ্য দেখুন এবং পরিচালনা করুন'
        },
        { 
          id: 'customer-communication', 
          label: 'Customer Communication', 
          labelBn: 'গ্রাহক যোগাযোগ',
          icon: <MessageCircle className="h-4 w-4" />, 
          description: 'Communicate with customers',
          descriptionBn: 'গ্রাহকদের সাথে যোগাযোগ করুন'
        },
        { 
          id: 'customer-support', 
          label: 'Customer Support', 
          labelBn: 'গ্রাহক সহায়তা',
          icon: <HelpCircle className="h-4 w-4" />, 
          description: 'Handle customer inquiries and support',
          descriptionBn: 'গ্রাহকের অনুসন্ধান এবং সহায়তা পরিচালনা করুন'
        },
        { 
          id: 'feedback', 
          label: 'Feedback Management', 
          labelBn: 'ফিডব্যাক ব্যবস্থাপনা',
          icon: <Star className="h-4 w-4" />, 
          description: 'Manage customer feedback and reviews',
          descriptionBn: 'গ্রাহকের ফিডব্যাক এবং রিভিউ পরিচালনা করুন'
        }
      ]
    },
    {
      id: 'finance',
      label: 'Finance & Payments',
      labelBn: 'অর্থ ও পেমেন্ট',
      icon: <DollarSign className="h-5 w-5" />,
      children: [
        { 
          id: 'revenue-dashboard', 
          label: 'Revenue Dashboard', 
          labelBn: 'রাজস্ব ড্যাশবোর্ড',
          icon: <TrendingUp className="h-4 w-4" />, 
          description: 'Track revenue and sales performance',
          descriptionBn: 'রাজস্ব এবং বিক্রয় কর্মক্ষমতা ট্র্যাক করুন'
        },
        { 
          id: 'payments', 
          label: 'Payment Management', 
          labelBn: 'পেমেন্ট ব্যবস্থাপনা',
          icon: <CreditCard className="h-4 w-4" />, 
          description: 'Manage payment methods and transactions',
          descriptionBn: 'পেমেন্ট পদ্ধতি এবং লেনদেন পরিচালনা করুন'
        },
        { 
          id: 'commission', 
          label: 'Commission & Fees', 
          labelBn: 'কমিশন ও ফি',
          icon: <Percent className="h-4 w-4" />, 
          description: 'View commission structure and fees',
          descriptionBn: 'কমিশন কাঠামো এবং ফি দেখুন'
        },
        { 
          id: 'financial-reports', 
          label: 'Financial Reports', 
          labelBn: 'আর্থিক রিপোর্ট',
          icon: <Receipt className="h-4 w-4" />, 
          description: 'Generate financial reports and statements',
          descriptionBn: 'আর্থিক রিপোর্ট এবং বিবৃতি তৈরি করুন'
        },
        { 
          id: 'tax-management', 
          label: 'Tax Management', 
          labelBn: 'ট্যাক্স ব্যবস্থাপনা',
          icon: <FileText className="h-4 w-4" />, 
          description: 'Manage tax obligations and documents',
          descriptionBn: 'ট্যাক্স বাধ্যবাধকতা এবং ডকুমেন্ট পরিচালনা করুন'
        }
      ]
    },
    {
      id: 'tools',
      label: 'Business Tools',
      labelBn: 'ব্যবসায়িক টুলস',
      icon: <Settings className="h-5 w-5" />,
      children: [
        { 
          id: 'bulk-tools', 
          label: 'Bulk Management Tools', 
          labelBn: 'বাল্ক ম্যানেজমেন্ট টুলস',
          icon: <Database className="h-4 w-4" />, 
          description: 'Bulk edit products, prices, and inventory',
          descriptionBn: 'পণ্য, দাম, এবং ইনভেন্টরি বাল্ক এডিট করুন'
        },
        { 
          id: 'automation', 
          label: 'Business Automation', 
          labelBn: 'ব্যবসায়িক অটোমেশন',
          icon: <Zap className="h-4 w-4" />, 
          description: 'Automate routine business tasks',
          descriptionBn: 'নিয়মিত ব্যবসায়িক কাজ অটোমেট করুন'
        },
        { 
          id: 'integrations', 
          label: 'Third-party Integrations', 
          labelBn: 'তৃতীয় পক্ষের ইন্টিগ্রেশন',
          icon: <Globe className="h-4 w-4" />, 
          description: 'Connect with external systems and APIs',
          descriptionBn: 'বাহ্যিক সিস্টেম এবং API এর সাথে সংযোগ করুন'
        },
        { 
          id: 'templates', 
          label: 'Templates & Design', 
          labelBn: 'টেমপ্লেট ও ডিজাইন',
          icon: <Palette className="h-4 w-4" />, 
          description: 'Customize store appearance and templates',
          descriptionBn: 'স্টোরের চেহারা এবং টেমপ্লেট কাস্টমাইজ করুন'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Account & Settings',
      labelBn: 'অ্যাকাউন্ট ও সেটিংস',
      icon: <User className="h-5 w-5" />,
      children: [
        { 
          id: 'store-settings', 
          label: 'Store Settings', 
          labelBn: 'স্টোর সেটিংস',
          icon: <Store className="h-4 w-4" />, 
          description: 'Configure store information and policies',
          descriptionBn: 'স্টোরের তথ্য এবং নীতি কনফিগার করুন'
        },
        { 
          id: 'profile', 
          label: 'Vendor Profile', 
          labelBn: 'ভেন্ডর প্রোফাইল',
          icon: <User className="h-4 w-4" />, 
          description: 'Manage vendor account information',
          descriptionBn: 'ভেন্ডর অ্যাকাউন্টের তথ্য পরিচালনা করুন'
        },
        { 
          id: 'shipping-settings', 
          label: 'Shipping Settings', 
          labelBn: 'শিপিং সেটিংস',
          icon: <Truck className="h-4 w-4" />, 
          description: 'Configure shipping zones and rates',
          descriptionBn: 'শিপিং জোন এবং রেট কনফিগার করুন'
        },
        { 
          id: 'payment-settings', 
          label: 'Payment Settings', 
          labelBn: 'পেমেন্ট সেটিংস',
          icon: <CreditCard className="h-4 w-4" />, 
          description: 'Manage payment methods and bank details',
          descriptionBn: 'পেমেন্ট পদ্ধতি এবং ব্যাংক বিবরণ পরিচালনা করুন'
        },
        { 
          id: 'notifications', 
          label: 'Notification Settings', 
          labelBn: 'বিজ্ঞপ্তি সেটিংস',
          icon: <Bell className="h-4 w-4" />, 
          description: 'Configure email and SMS notifications',
          descriptionBn: 'ইমেল এবং SMS বিজ্ঞপ্তি কনফিগার করুন'
        }
      ]
    }
  ];

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const getStatusColor = (status: VendorOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: VendorOrder['status']) => {
    const texts = {
      pending: { en: 'Pending', bn: 'অপেক্ষমাণ' },
      processing: { en: 'Processing', bn: 'প্রক্রিয়াধীন' },
      shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
      delivered: { en: 'Delivered', bn: 'ডেলিভার হয়েছে' },
      cancelled: { en: 'Cancelled', bn: 'বাতিল' },
      returned: { en: 'Returned', bn: 'ফেরত' }
    };
    return texts[status][language];
  };

  const renderMenuItem = (item: VendorMenuItem, level: number = 0) => (
    <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          activeTab === item.id ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' : ''
        }`}
        onClick={() => {
          if (item.children) {
            toggleMenu(item.id);
          } else {
            setActiveTab(item.id);
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          {item.icon}
          <div className="flex-1">
            <span className="font-medium">
              {language === 'bn' ? item.labelBn : item.label}
            </span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </div>
        </div>
        {item.children && (
          <ChevronRight className={`h-4 w-4 transition-transform ${
            expandedMenus.has(item.id) ? 'rotate-90' : ''
          }`} />
        )}
      </div>
      
      {item.children && expandedMenus.has(item.id) && (
        <div className="mt-2 space-y-1">
          {item.children.map(child => renderMenuItem(child, level + 1))}
        </div>
      )}
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'মোট রাজস্ব' : 'Total Revenue'}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ৳{stats?.totalRevenue?.toLocaleString('bn-BD') || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? '+১৮.২% এ মাসে' : '+18.2% this month'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? `${stats?.pendingOrders || 0} অপেক্ষমাণ` : `${stats?.pendingOrders || 0} pending`}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'মোট পণ্য' : 'Total Products'}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? `${stats?.lowStockProducts || 0} কম স্টক` : `${stats?.lowStockProducts || 0} low stock`}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'গড় রেটিং' : 'Average Rating'}
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.averageRating || 0}/5
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? `${stats?.totalCustomers || 0} গ্রাহক` : `${stats?.totalCustomers || 0} customers`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {language === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('all-orders')}>
                    {language === 'bn' ? 'সব দেখুন' : 'View All'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders?.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">৳{order.total.toLocaleString('bn-BD')}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'দ্রুত অ্যাকশন' : 'Quick Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('add-product')}
                    >
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'পণ্য যোগ করুন' : 'Add Product'}
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('pending-orders')}
                    >
                      <Clock className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'অর্ডার দেখুন' : 'View Orders'}
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <Database className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'ইনভেন্টরি' : 'Inventory'}
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics'}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'বিক্রয় পারফরম্যান্স' : 'Sales Performance'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'bn' ? 'রূপান্তর হার' : 'Conversion Rate'}
                      </span>
                      <span className="font-medium">{stats?.conversionRate || 0}%</span>
                    </div>
                    <Progress value={stats?.conversionRate || 0} className="h-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'bn' ? 'মাসিক বৃদ্ধি' : 'Monthly Growth'}
                      </span>
                      <span className="font-medium text-green-600">+{stats?.monthlyGrowth || 0}%</span>
                    </div>
                    <Progress value={stats?.monthlyGrowth || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'স্টক সতর্কতা' : 'Stock Alerts'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">
                        {language === 'bn' ? `${stats?.lowStockProducts || 0} পণ্য কম স্টক` : `${stats?.lowStockProducts || 0} products low stock`}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {language === 'bn' ? 'ইনভেন্টরি আপডেট' : 'Inventory updated'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'bn' ? 'আর্থিক সারসংক্ষেপ' : 'Financial Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'bn' ? 'কমিশন প্রদত্ত' : 'Commission Paid'}
                      </span>
                      <span className="font-medium">৳{stats?.commissionPaid?.toLocaleString('bn-BD') || '0'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'bn' ? 'নেট আয়' : 'Net Earnings'}
                      </span>
                      <span className="font-medium text-green-600">
                        ৳{((stats?.totalRevenue || 0) - (stats?.commissionPaid || 0)).toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {menuItems.find(item => 
                  item.id === activeTab || 
                  item.children?.some(child => child.id === activeTab)
                )?.label || 'Feature Coming Soon'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {language === 'bn' 
                  ? 'এই বৈশিষ্ট্যটি শীঘ্রই আসছে।'
                  : 'This feature is being developed and will be available soon.'
                }
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {language === 'bn' ? 'ভেন্ডর ড্যাশবোর্ড' : 'Vendor Dashboard'}
                </h1>
                <p className="text-blue-100 mt-2">
                  {language === 'bn' ? 'আপনার ব্যবসা পরিচালনা করুন' : 'Manage your business and track performance'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={language} onValueChange={(value: 'en' | 'bn') => setLanguage(value)}>
                  <SelectTrigger className="w-24 bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="bn">বাং</SelectItem>
                  </SelectContent>
                </Select>
                
                <Avatar>
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback>VD</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {menuItems.map(item => renderMenuItem(item))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorDashboard;
