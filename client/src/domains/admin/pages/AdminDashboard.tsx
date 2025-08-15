import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, DollarSign, BarChart3, 
  Settings, Shield, MessageSquare, Globe, Truck, CreditCard, Tag, 
  UserCheck, FileText, TrendingUp, AlertTriangle, Bell, Search,
  Plus, Filter, Download, RefreshCw, Eye, Edit, Trash2, MoreHorizontal,
  ChevronDown, ChevronRight, Calendar, Clock, Star, MapPin, Phone,
  Mail, ExternalLink, Database, Server, Zap, Activity, Target,
  Layers, Grid, List, PieChart, LineChart, BarChart, Users2, UserPlus,
  Store, Building, Factory, ShoppingBag, Boxes, Box, Package2,
  PackageCheck, Warehouse, Calculator, Receipt, PiggyBank, Banknote,
  CreditCard as CreditCardIcon, Wallet, HandCoins, TrendingDown,
  Megaphone, Volume2 as Bullhorn, Gift, Percent, Crown, Heart, Share2, ThumbsUp,
  Headphones, HelpCircle, LifeBuoy, MessageCircle, PhoneCall, Video,
  FileCheck, ClipboardList, Clipboard, BookOpen, Archive, FolderOpen,
  Lock, Key, UserCog, ShieldCheck, Fingerprint, Scan, Smartphone,
  Monitor, Tablet, Wifi, Cloud, CloudUpload, Download as DownloadIcon,
  Upload, RefreshCw as Sync, Link, Code, Terminal, Bug, Wrench, Cog, Sliders,
  ToggleLeft, ToggleRight, SlidersHorizontal, Palette, Image, Camera,
  Mic, Volume2, PlayCircle, StopCircle, PauseCircle, SkipForward
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet';
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area';
import { Separator } from '@/shared/ui/separator';
import { Progress } from '@/shared/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsDashboard } from './AnalyticsDashboard';
// import { MLDashboard } from '@/components/ml/MLDashboard';
import FinanceDashboard from './FinanceDashboard';
// import { NotificationDashboard } from '@/components/notifications/NotificationDashboard';
// import { ShippingDashboard } from '@/components/shipping/ShippingDashboard';
// import InventoryDashboard from '@/components/inventory/InventoryDashboard';
// import { AdminHeader } from '@/components/admin/layout/AdminHeader';
// import { AdminFooter } from '@/components/admin/layout/AdminFooter';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  badge?: string | number;
  description?: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalVendors: number;
  activeVendors: number;
  pendingOrders: number;
  newCustomers: number;
  conversionRate: number;
}

const AdminDashboard: React.FC = () => {
  const { section, subsection } = useParams();
  const navigate = useNavigate();
  const activeTab = subsection || section || 'overview';
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['dashboard']));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Real-time monitoring state
  const [realTimeData, setRealTimeData] = useState({
    onlineUsers: 1247,
    activeOrders: 89,
    pendingPayments: 23,
    systemLoad: 68,
    responseTime: 245,
    revenue: 124589,
    conversion: 3.2,
    serverHealth: 'healthy'
  });
  
  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, type: 'warning', message: 'High server load detected', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New vendor registration', time: '5 min ago' },
    { id: 3, type: 'success', message: 'Payment gateway restored', time: '12 min ago' }
  ]);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as Promise<DashboardStats>;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Complete admin menu structure matching Amazon/Shopee standards
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      children: [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" />, description: 'Platform overview and key metrics' },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="h-4 w-4" />, description: 'Deep analytics and insights' },
        { id: 'ml-dashboard', label: 'AI & ML Operations', icon: <Target className="h-4 w-4" />, description: 'Machine learning and AI analytics' },
        { id: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" />, description: 'Generate and view reports' },
        { id: 'real-time', label: 'Real-time Monitor', icon: <Activity className="h-4 w-4" />, description: 'Live platform monitoring' }
      ]
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: <Users className="h-5 w-5" />,
      badge: '2.5K',
      children: [
        { id: 'customers', label: 'Customer Management', icon: <Users2 className="h-4 w-4" />, description: 'Manage customer accounts and profiles' },
        { id: 'vendors', label: 'Vendor Management', icon: <Store className="h-4 w-4" />, description: 'Manage vendor accounts and verification' },
        { id: 'admin-users', label: 'Admin Users', icon: <UserCog className="h-4 w-4" />, description: 'Manage admin and staff accounts' },
        { id: 'user-roles', label: 'User Roles & Permissions', icon: <Shield className="h-4 w-4" />, description: 'Configure user roles and access control' },
        { id: 'user-verification', label: 'User Verification', icon: <UserCheck className="h-4 w-4" />, description: 'Verify user identities and documents' },
        { id: 'user-analytics', label: 'User Analytics', icon: <BarChart className="h-4 w-4" />, description: 'User behavior and engagement analytics' }
      ]
    },
    {
      id: 'product-management',
      label: 'Product Management',
      icon: <Package className="h-5 w-5" />,
      badge: '15.2K',
      children: [
        { id: 'product-catalog', label: 'Product Catalog', icon: <Grid className="h-4 w-4" />, description: 'Manage product listings and catalog' },
        { id: 'categories', label: 'Categories', icon: <Layers className="h-4 w-4" />, description: 'Manage product categories and taxonomy' },
        { id: 'inventory', label: 'Inventory Management', icon: <Warehouse className="h-4 w-4" />, description: 'Track and manage inventory levels' },
        { id: 'product-approval', label: 'Product Approval', icon: <PackageCheck className="h-4 w-4" />, description: 'Review and approve new products' },
        { id: 'product-quality', label: 'Quality Control', icon: <Star className="h-4 w-4" />, description: 'Monitor product quality and standards' },
        { id: 'bulk-operations', label: 'Bulk Operations', icon: <Box className="h-4 w-4" />, description: 'Bulk product management tools' }
      ]
    },
    {
      id: 'order-management',
      label: 'Order Management',
      icon: <ShoppingCart className="h-5 w-5" />,
      badge: '847',
      children: [
        { id: 'order-list', label: 'All Orders', icon: <List className="h-4 w-4" />, description: 'View and manage all orders' },
        { id: 'order-processing', label: 'Order Processing', icon: <Clock className="h-4 w-4" />, description: 'Process pending orders' },
        { id: 'order-tracking', label: 'Order Tracking', icon: <MapPin className="h-4 w-4" />, description: 'Track order status and delivery' },
        { id: 'returns-refunds', label: 'Returns & Refunds', icon: <RefreshCw className="h-4 w-4" />, description: 'Handle returns and refund requests' },
        { id: 'dispute-resolution', label: 'Dispute Resolution', icon: <AlertTriangle className="h-4 w-4" />, description: 'Resolve order disputes' },
        { id: 'shipping-dashboard', label: 'Shipping Dashboard', icon: <Truck className="h-4 w-4" />, description: 'Comprehensive shipping and courier management' },
        { id: 'shipping-management', label: 'Shipping Management', icon: <Truck className="h-4 w-4" />, description: 'Manage shipping and delivery' }
      ]
    },
    {
      id: 'financial-management',
      label: 'Financial Management',
      icon: <DollarSign className="h-5 w-5" />,
      children: [
        { id: 'finance-dashboard', label: 'Finance Dashboard', icon: <Calculator className="h-4 w-4" />, description: 'Comprehensive financial operations and analytics' },
        { id: 'revenue-tracking', label: 'Revenue Tracking', icon: <TrendingUp className="h-4 w-4" />, description: 'Track platform revenue and growth' },
        { id: 'vendor-payouts', label: 'Vendor Payouts', icon: <HandCoins className="h-4 w-4" />, description: 'Manage vendor payments and commissions' },
        { id: 'commission-management', label: 'Commission Management', icon: <Calculator className="h-4 w-4" />, description: 'Configure and track commissions' },
        { id: 'payment-methods', label: 'Payment Methods', icon: <CreditCardIcon className="h-4 w-4" />, description: 'Manage payment gateways and methods' },
        { id: 'financial-reports', label: 'Financial Reports', icon: <Receipt className="h-4 w-4" />, description: 'Generate financial reports' },
        { id: 'tax-management', label: 'Tax Management', icon: <FileCheck className="h-4 w-4" />, description: 'Handle tax calculations and compliance' }
      ]
    },
    {
      id: 'marketing-promotion',
      label: 'Marketing & Promotion',
      icon: <Megaphone className="h-5 w-5" />,
      children: [
        { id: 'notification-dashboard', label: 'Notification Center', icon: <Bell className="h-4 w-4" />, description: 'Multi-channel notification management and analytics' },
        { id: 'campaigns', label: 'Marketing Campaigns', icon: <Bullhorn className="h-4 w-4" />, description: 'Create and manage marketing campaigns' },
        { id: 'discounts', label: 'Discounts & Coupons', icon: <Percent className="h-4 w-4" />, description: 'Manage discounts and coupon codes' },
        { id: 'flash-sales', label: 'Flash Sales', icon: <Zap className="h-4 w-4" />, description: 'Configure flash sales and time-limited offers' },
        { id: 'loyalty-program', label: 'Loyalty Program', icon: <Crown className="h-4 w-4" />, description: 'Manage customer loyalty programs' },
        { id: 'email-marketing', label: 'Email Marketing', icon: <Mail className="h-4 w-4" />, description: 'Email campaign management' },
        { id: 'social-media', label: 'Social Media Integration', icon: <Share2 className="h-4 w-4" />, description: 'Manage social media presence' }
      ]
    },
    {
      id: 'customer-support',
      label: 'Customer Support',
      icon: <Headphones className="h-5 w-5" />,
      badge: '23',
      children: [
        { id: 'support-tickets', label: 'Support Tickets', icon: <MessageCircle className="h-4 w-4" />, description: 'Manage customer support tickets' },
        { id: 'live-chat', label: 'Live Chat', icon: <MessageSquare className="h-4 w-4" />, description: 'Monitor live chat conversations' },
        { id: 'faq-management', label: 'FAQ Management', icon: <HelpCircle className="h-4 w-4" />, description: 'Manage frequently asked questions' },
        { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen className="h-4 w-4" />, description: 'Maintain help documentation' },
        { id: 'support-analytics', label: 'Support Analytics', icon: <BarChart className="h-4 w-4" />, description: 'Analyze support performance' },
        { id: 'escalation-management', label: 'Escalation Management', icon: <AlertTriangle className="h-4 w-4" />, description: 'Handle escalated issues' }
      ]
    },
    {
      id: 'content-management',
      label: 'Content Management',
      icon: <FileText className="h-5 w-5" />,
      children: [
        { id: 'pages', label: 'Page Management', icon: <Globe className="h-4 w-4" />, description: 'Manage website pages and content' },
        { id: 'banners', label: 'Banner Management', icon: <Image className="h-4 w-4" />, description: 'Manage promotional banners' },
        { id: 'blog', label: 'Blog Management', icon: <Edit className="h-4 w-4" />, description: 'Manage blog posts and articles' },
        { id: 'media-library', label: 'Media Library', icon: <FolderOpen className="h-4 w-4" />, description: 'Manage images and media files' },
        { id: 'seo-management', label: 'SEO Management', icon: <Search className="h-4 w-4" />, description: 'Optimize search engine visibility' },
        { id: 'localization', label: 'Localization', icon: <Globe className="h-4 w-4" />, description: 'Manage translations and localization' }
      ]
    },
    {
      id: 'system-configuration',
      label: 'System Configuration',
      icon: <Settings className="h-5 w-5" />,
      children: [
        { id: 'general-settings', label: 'General Settings', icon: <Cog className="h-4 w-4" />, description: 'Configure platform settings' },
        { id: 'payment-settings', label: 'Payment Settings', icon: <CreditCard className="h-4 w-4" />, description: 'Configure payment gateways' },
        { id: 'shipping-settings', label: 'Shipping Settings', icon: <Truck className="h-4 w-4" />, description: 'Configure shipping options' },
        { id: 'notification-settings', label: 'Notification Settings', icon: <Bell className="h-4 w-4" />, description: 'Configure system notifications' },
        { id: 'api-management', label: 'API Management', icon: <Code className="h-4 w-4" />, description: 'Manage API keys and integrations' },
        { id: 'backup-restore', label: 'Backup & Restore', icon: <Database className="h-4 w-4" />, description: 'System backup and recovery' }
      ]
    },
    {
      id: 'security-compliance',
      label: 'Security & Compliance',
      icon: <Shield className="h-5 w-5" />,
      children: [
        { id: 'security-settings', label: 'Security Settings', icon: <Lock className="h-4 w-4" />, description: 'Configure security policies' },
        { id: 'fraud-detection', label: 'Fraud Detection', icon: <ShieldCheck className="h-4 w-4" />, description: 'Monitor and prevent fraud' },
        { id: 'audit-logs', label: 'Audit Logs', icon: <ClipboardList className="h-4 w-4" />, description: 'View system audit trails' },
        { id: 'compliance-monitoring', label: 'Compliance Monitoring', icon: <FileCheck className="h-4 w-4" />, description: 'Monitor regulatory compliance' },
        { id: 'access-control', label: 'Access Control', icon: <Key className="h-4 w-4" />, description: 'Manage user access permissions' },
        { id: 'security-reports', label: 'Security Reports', icon: <AlertTriangle className="h-4 w-4" />, description: 'Generate security reports' }
      ]
    },
    {
      id: 'analytics-intelligence',
      label: 'Analytics & Intelligence',
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { id: 'sales-analytics', label: 'Sales Analytics', icon: <TrendingUp className="h-4 w-4" />, description: 'Analyze sales performance' },
        { id: 'customer-analytics', label: 'Customer Analytics', icon: <Users className="h-4 w-4" />, description: 'Customer behavior insights' },
        { id: 'vendor-analytics', label: 'Vendor Analytics', icon: <Store className="h-4 w-4" />, description: 'Vendor performance metrics' },
        { id: 'product-analytics', label: 'Product Analytics', icon: <Package className="h-4 w-4" />, description: 'Product performance insights' },
        { id: 'market-intelligence', label: 'Market Intelligence', icon: <Target className="h-4 w-4" />, description: 'Market trends and insights' },
        { id: 'custom-reports', label: 'Custom Reports', icon: <PieChart className="h-4 w-4" />, description: 'Build custom analytics reports' }
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

  const renderMenuItem = (item: MenuItem, level: number = 0) => (
    <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
      <div
        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
          activeTab === item.id ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : ''
        }`}
        onClick={() => {
          if (item.children) {
            toggleMenu(item.id);
          } else {
            navigate(`/admin/dashboard/${item.id}`);
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          {item.icon}
          {!sidebarCollapsed && (
            <>
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
        {item.children && !sidebarCollapsed && (
          expandedMenus.has(item.id) ? 
          <ChevronDown className="h-4 w-4" /> : 
          <ChevronRight className="h-4 w-4" />
        )}
      </div>
      
      {item.children && expandedMenus.has(item.id) && !sidebarCollapsed && (
        <div className="mt-1 space-y-1">
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
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ৳{stats?.totalRevenue?.toLocaleString('bn-BD') || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalOrders?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">+15.3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalCustomers?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.activeVendors?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New vendor application approved</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order #12345 marked as delivered</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment dispute resolved</p>
                        <p className="text-xs text-muted-foreground">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                        <div>
                          <p className="text-sm font-medium">Samsung Galaxy S23</p>
                          <p className="text-xs text-muted-foreground">Electronics</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">৳89,000</p>
                        <p className="text-xs text-green-600">+25.3%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                        <div>
                          <p className="text-sm font-medium">Nike Air Max 270</p>
                          <p className="text-xs text-muted-foreground">Fashion</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">৳12,500</p>
                        <p className="text-xs text-green-600">+18.7%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Monitoring Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Real-time System Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{realTimeData.onlineUsers}</p>
                      <p className="text-sm text-blue-600">Online Users</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{realTimeData.activeOrders}</p>
                      <p className="text-sm text-green-600">Active Orders</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{realTimeData.pendingPayments}</p>
                      <p className="text-sm text-orange-600">Pending Payments</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{realTimeData.responseTime}ms</p>
                      <p className="text-sm text-purple-600">Avg Response</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Server Load</span>
                      <span className="text-sm text-gray-600">{realTimeData.systemLoad}%</span>
                    </div>
                    <Progress value={realTimeData.systemLoad} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm text-gray-600">{realTimeData.conversion}%</span>
                    </div>
                    <Progress value={realTimeData.conversion * 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === 'warning' ? 'bg-orange-500' :
                          alert.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View All Alerts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">৳{realTimeData.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Today's Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">1,247</p>
                        <p className="text-sm text-gray-600">Orders Today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">৳852</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Daily Goal Progress</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Admin
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Approve Products
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Store className="w-4 h-4 mr-2" />
                    Review Vendors
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'ml-dashboard':
        return <MLDashboard />;
      
      case 'finance-dashboard':
        return <FinanceDashboard />;
      
      case 'notification-dashboard':
        return <NotificationDashboard />;
      
      case 'shipping-dashboard':
        return <ShippingDashboard />;
      
      case 'inventory-dashboard':
        return <InventoryDashboard />;

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {menuItems.find(item => 
                  item.id === activeTab || 
                  item.children?.some(child => child.id === activeTab)
                )?.label || 'Feature Coming Soon'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                This feature is being developed and will be available soon.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <AdminHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleNotifications={() => setNotificationOpen(!notificationOpen)}
        currentPage={menuItems.find(item => 
          item.id === activeTab || 
          item.children?.some(child => child.id === activeTab)
        )?.label || 'Dashboard'}
      />

      {/* Main Container - Account for fixed header and footer */}
      <div className="flex pt-20 pb-16 h-screen">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 fixed left-0 top-20 bottom-16 flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-orange-600">Navigation</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Scrollable Menu Area with explicit height */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2 min-h-full">
                {menuItems.map(item => renderMenuItem(item))}
                {/* Add some extra spacing to ensure scrollbar appears */}
                <div className="h-20"></div>
              </div>
              {/* Custom visible scrollbar */}
              <ScrollBar 
                className="w-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                orientation="vertical" 
              />
            </ScrollArea>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
          {/* Content Area Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {menuItems.find(item => 
                    item.id === activeTab || 
                    item.children?.some(child => child.id === activeTab)
                  )?.label || 'Dashboard'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {menuItems.find(item => 
                    item.children?.some(child => child.id === activeTab)
                  )?.children?.find(child => child.id === activeTab)?.description || 'Admin dashboard overview'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1 p-6">
            {renderMainContent()}
          </ScrollArea>
        </div>
      </div>

      {/* Admin Footer - Fixed at bottom */}
      <AdminFooter className="fixed bottom-0 left-0 right-0 z-40" />
    </div>
  );
};

export default AdminDashboard;