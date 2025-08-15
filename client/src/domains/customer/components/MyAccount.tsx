
import React, { useState, useEffect } from 'react';
import { 
  User, Package, ShoppingCart, Heart, MapPin, CreditCard, Settings, 
  Bell, Gift, Headphones, Star, Clock, Truck, RefreshCw, Eye,
  FileText, Download, Plus, Edit, Trash2, ChevronRight, Search,
  Filter, Calendar, BarChart3, TrendingUp, Award, Crown, Users,
  MessageCircle, ThumbsUp, Share2, Camera, Upload, Lock, Shield,
  Mail, Phone, Globe, Home, Building, Wallet, Receipt, Target,
  Zap, AlertTriangle, CheckCircle, Info, HelpCircle, BookOpen,
  Tag, Percent, Coins, PiggyBank, History, Activity, Bookmark,
  List, Grid, SlidersHorizontal, ArrowUpDown, ExternalLink,
  Copy, MoreHorizontal, Play, Pause, Forward, Rewind, Volume2
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
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface CustomerMenuItem {
  id: string;
  label: string;
  labelBn: string;
  icon: React.ReactNode;
  children?: CustomerMenuItem[];
  badge?: string | number;
  description?: string;
  descriptionBn?: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  savedAmount: number;
  loyaltyPoints: number;
  wishlistItems: number;
  cartItems: number;
  reviews: number;
  addresses: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  vendor: string;
  tracking?: string;
}

const MyAccount: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['account']));

  useSEO({
    title: 'My Account - GetIt Bangladesh | Customer Dashboard',
    description: 'Comprehensive customer dashboard for managing orders, payments, addresses, and account settings on GetIt Bangladesh.',
    keywords: 'customer dashboard, my account, orders, bangladesh ecommerce, account management'
  });

  // Fetch customer statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['customer-dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/customer/dashboard/stats');
      if (!response.ok) {
        // Fallback with realistic demo data
        return {
          totalOrders: 12,
          totalSpent: 45600,
          savedAmount: 3420,
          loyaltyPoints: 850,
          wishlistItems: 8,
          cartItems: 3,
          reviews: 5,
          addresses: 2
        };
      }
      return response.json() as Promise<CustomerStats>;
    },
    refetchInterval: 60000,
  });

  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-recent-orders'],
    queryFn: async () => {
      const response = await fetch('/api/customer/orders?limit=5');
      if (!response.ok) {
        // Fallback with realistic demo data
        return [
          { id: '1', orderNumber: 'GT001234', date: '2025-06-28', status: 'delivered', total: 2500, items: 2, vendor: 'TechMart BD' },
          { id: '2', orderNumber: 'GT001235', date: '2025-06-25', status: 'shipped', total: 1200, items: 1, vendor: 'Fashion Point' },
          { id: '3', orderNumber: 'GT001236', date: '2025-06-20', status: 'delivered', total: 3200, items: 3, vendor: 'Home Essentials' }
        ] as Order[];
      }
      return response.json() as Promise<Order[]>;
    },
  });

  // Complete customer menu structure matching Amazon/Shopee standards
  const menuItems: CustomerMenuItem[] = [
    {
      id: 'account',
      label: 'My Account',
      labelBn: 'আমার অ্যাকাউন্ট',
      icon: <User className="h-5 w-5" />,
      children: [
        { 
          id: 'overview', 
          label: 'Account Overview', 
          labelBn: 'অ্যাকাউন্ট ওভারভিউ',
          icon: <BarChart3 className="h-4 w-4" />, 
          description: 'View account summary and recent activity',
          descriptionBn: 'অ্যাকাউন্ট সারসংক্ষেপ এবং সাম্প্রতিক কার্যকলাপ দেখুন'
        },
        { 
          id: 'profile', 
          label: 'Profile Settings', 
          labelBn: 'প্রোফাইল সেটিংস',
          icon: <Settings className="h-4 w-4" />, 
          description: 'Manage personal information and preferences',
          descriptionBn: 'ব্যক্তিগত তথ্য এবং পছন্দ পরিচালনা করুন'
        },
        { 
          id: 'security', 
          label: 'Security & Privacy', 
          labelBn: 'নিরাপত্তা ও গোপনীয়তা',
          icon: <Shield className="h-4 w-4" />, 
          description: 'Password, 2FA, and privacy settings',
          descriptionBn: 'পাসওয়ার্ড, 2FA, এবং গোপনীয়তা সেটিংস'
        },
        { 
          id: 'notifications', 
          label: 'Notifications', 
          labelBn: 'বিজ্ঞপ্তি',
          icon: <Bell className="h-4 w-4" />, 
          description: 'Manage email and SMS notifications',
          descriptionBn: 'ইমেল এবং SMS বিজ্ঞপ্তি পরিচালনা করুন'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Orders & Returns',
      labelBn: 'অর্ডার ও রিটার্ন',
      icon: <Package className="h-5 w-5" />,
      badge: stats?.totalOrders || 0,
      children: [
        { 
          id: 'all-orders', 
          label: 'All Orders', 
          labelBn: 'সকল অর্ডার',
          icon: <List className="h-4 w-4" />, 
          description: 'View complete order history',
          descriptionBn: 'সম্পূর্ণ অর্ডার ইতিহাস দেখুন'
        },
        { 
          id: 'tracking', 
          label: 'Track Orders', 
          labelBn: 'অর্ডার ট্র্যাক করুন',
          icon: <Truck className="h-4 w-4" />, 
          description: 'Real-time order tracking',
          descriptionBn: 'রিয়েল-টাইম অর্ডার ট্র্যাকিং'
        },
        { 
          id: 'returns', 
          label: 'Returns & Refunds', 
          labelBn: 'রিটার্ন ও রিফান্ড',
          icon: <RefreshCw className="h-4 w-4" />, 
          description: 'Manage returns and refund requests',
          descriptionBn: 'রিটার্ন এবং রিফান্ড অনুরোধ পরিচালনা করুন'
        },
        { 
          id: 'invoices', 
          label: 'Invoices & Receipts', 
          labelBn: 'ইনভয়েস ও রসিদ',
          icon: <Receipt className="h-4 w-4" />, 
          description: 'Download invoices and receipts',
          descriptionBn: 'ইনভয়েস এবং রসিদ ডাউনলোড করুন'
        }
      ]
    },
    {
      id: 'shopping',
      label: 'Shopping',
      labelBn: 'কেনাকাটা',
      icon: <ShoppingCart className="h-5 w-5" />,
      children: [
        { 
          id: 'cart', 
          label: 'Shopping Cart', 
          labelBn: 'শপিং কার্ট',
          icon: <ShoppingCart className="h-4 w-4" />, 
          badge: stats?.cartItems || 0,
          description: 'Items ready for checkout',
          descriptionBn: 'চেকআউটের জন্য প্রস্তুত আইটেম'
        },
        { 
          id: 'wishlist', 
          label: 'Wishlist', 
          labelBn: 'ইচ্ছার তালিকা',
          icon: <Heart className="h-4 w-4" />, 
          badge: stats?.wishlistItems || 0,
          description: 'Saved items for later',
          descriptionBn: 'পরবর্তীর জন্য সংরক্ষিত আইটেম'
        },
        { 
          id: 'recently-viewed', 
          label: 'Recently Viewed', 
          labelBn: 'সম্প্রতি দেখা',
          icon: <Eye className="h-4 w-4" />, 
          description: 'Products you\'ve recently viewed',
          descriptionBn: 'আপনি সম্প্রতি দেখেছেন এমন পণ্য'
        },
        { 
          id: 'buy-again', 
          label: 'Buy Again', 
          labelBn: 'আবার কিনুন',
          icon: <RefreshCw className="h-4 w-4" />, 
          description: 'Reorder frequently purchased items',
          descriptionBn: 'ঘন ঘন কেনা আইটেম পুনরায় অর্ডার করুন'
        }
      ]
    },
    {
      id: 'addresses-payments',
      label: 'Addresses & Payments',
      labelBn: 'ঠিকানা ও পেমেন্ট',
      icon: <CreditCard className="h-5 w-5" />,
      children: [
        { 
          id: 'addresses', 
          label: 'Address Book', 
          labelBn: 'ঠিকানা বই',
          icon: <MapPin className="h-4 w-4" />, 
          badge: stats?.addresses || 0,
          description: 'Manage delivery addresses',
          descriptionBn: 'ডেলিভারি ঠিকানা পরিচালনা করুন'
        },
        { 
          id: 'payment-methods', 
          label: 'Payment Methods', 
          labelBn: 'পেমেন্ট পদ্ধতি',
          icon: <Wallet className="h-4 w-4" />, 
          description: 'Manage cards and payment options',
          descriptionBn: 'কার্ড এবং পেমেন্ট অপশন পরিচালনা করুন'
        },
        { 
          id: 'payment-history', 
          label: 'Payment History', 
          labelBn: 'পেমেন্ট ইতিহাস',
          icon: <History className="h-4 w-4" />, 
          description: 'View all payment transactions',
          descriptionBn: 'সমস্ত পেমেন্ট লেনদেন দেখুন'
        }
      ]
    },
    {
      id: 'rewards-loyalty',
      label: 'Rewards & Loyalty',
      labelBn: 'পুরস্কার ও লয়ালটি',
      icon: <Gift className="h-5 w-5" />,
      children: [
        { 
          id: 'loyalty-points', 
          label: 'Loyalty Points', 
          labelBn: 'লয়ালটি পয়েন্ট',
          icon: <Coins className="h-4 w-4" />, 
          badge: stats?.loyaltyPoints || 0,
          description: 'View and redeem loyalty points',
          descriptionBn: 'লয়ালটি পয়েন্ট দেখুন এবং রিডিম করুন'
        },
        { 
          id: 'coupons', 
          label: 'Coupons & Discounts', 
          labelBn: 'কুপন ও ছাড়',
          icon: <Tag className="h-4 w-4" />, 
          description: 'Available coupons and discount codes',
          descriptionBn: 'উপলব্ধ কুপন এবং ডিসকাউন্ট কোড'
        },
        { 
          id: 'membership', 
          label: 'Premium Membership', 
          labelBn: 'প্রিমিয়াম সদস্যতা',
          icon: <Crown className="h-4 w-4" />, 
          description: 'Upgrade to premium benefits',
          descriptionBn: 'প্রিমিয়াম সুবিধায় আপগ্রেড করুন'
        },
        { 
          id: 'referrals', 
          label: 'Refer Friends', 
          labelBn: 'বন্ধুদের রেফার করুন',
          icon: <Users className="h-4 w-4" />, 
          description: 'Earn rewards by referring friends',
          descriptionBn: 'বন্ধুদের রেফার করে পুরস্কার অর্জন করুন'
        }
      ]
    },
    {
      id: 'reviews-feedback',
      label: 'Reviews & Feedback',
      labelBn: 'রিভিউ ও ফিডব্যাক',
      icon: <Star className="h-5 w-5" />,
      children: [
        { 
          id: 'my-reviews', 
          label: 'My Reviews', 
          labelBn: 'আমার রিভিউ',
          icon: <Star className="h-4 w-4" />, 
          badge: stats?.reviews || 0,
          description: 'Reviews you\'ve written',
          descriptionBn: 'আপনার লেখা রিভিউ'
        },
        { 
          id: 'pending-reviews', 
          label: 'Pending Reviews', 
          labelBn: 'অপেক্ষমাণ রিভিউ',
          icon: <Clock className="h-4 w-4" />, 
          description: 'Products waiting for your review',
          descriptionBn: 'আপনার রিভিউর অপেক্ষায় থাকা পণ্য'
        },
        { 
          id: 'helpful-votes', 
          label: 'Helpful Votes', 
          labelBn: 'সহায়ক ভোট',
          icon: <ThumbsUp className="h-4 w-4" />, 
          description: 'Reviews you found helpful',
          descriptionBn: 'আপনার সহায়ক মনে হওয়া রিভিউ'
        }
      ]
    },
    {
      id: 'support',
      label: 'Support & Help',
      labelBn: 'সাহায্য ও সহায়তা',
      icon: <Headphones className="h-5 w-5" />,
      children: [
        { 
          id: 'help-center', 
          label: 'Help Center', 
          labelBn: 'সহায়তা কেন্দ্র',
          icon: <HelpCircle className="h-4 w-4" />, 
          description: 'FAQs and help articles',
          descriptionBn: 'FAQ এবং সহায়তা নিবন্ধ'
        },
        { 
          id: 'contact-support', 
          label: 'Contact Support', 
          labelBn: 'সাহায্যের জন্য যোগাযোগ',
          icon: <MessageCircle className="h-4 w-4" />, 
          description: 'Get help from our support team',
          descriptionBn: 'আমাদের সাহায্য টিম থেকে সহায়তা নিন'
        },
        { 
          id: 'live-chat', 
          label: 'Live Chat', 
          labelBn: 'লাইভ চ্যাট',
          icon: <MessageCircle className="h-4 w-4" />, 
          description: 'Chat with support representative',
          descriptionBn: 'সাহায্য প্রতিনিধির সাথে চ্যাট করুন'
        },
        { 
          id: 'feedback', 
          label: 'Send Feedback', 
          labelBn: 'ফিডব্যাক পাঠান',
          icon: <MessageCircle className="h-4 w-4" />, 
          description: 'Share your suggestions',
          descriptionBn: 'আপনার পরামর্শ শেয়ার করুন'
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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    const texts = {
      pending: { en: 'Pending', bn: 'অপেক্ষমাণ' },
      processing: { en: 'Processing', bn: 'প্রক্রিয়াধীন' },
      shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
      delivered: { en: 'Delivered', bn: 'ডেলিভার হয়েছে' },
      cancelled: { en: 'Cancelled', bn: 'বাতিল' }
    };
    return texts[status][language];
  };

  const renderMenuItem = (item: CustomerMenuItem, level: number = 0) => (
    <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          activeTab === item.id ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' : ''
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
                    {language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'গত মাস থেকে +২৩%' : '+23% from last month'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'মোট খরচ' : 'Total Spent'}
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ৳{stats?.totalSpent?.toLocaleString('bn-BD') || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'এই বছর' : 'This year'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'লয়ালটি পয়েন্ট' : 'Loyalty Points'}
                  </CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.loyaltyPoints || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'ব্যবহারের জন্য প্রস্তুত' : 'Ready to use'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'bn' ? 'সাশ্রয়' : 'Savings'}
                  </CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ৳{stats?.savedAmount?.toLocaleString('bn-BD') || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'ছাড় ও অফারে' : 'From discounts & offers'}
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
                          <Package className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.items} items</p>
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
                      onClick={() => setActiveTab('cart')}
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'কার্ট দেখুন' : 'View Cart'}
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('tracking')}
                    >
                      <Truck className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'ট্র্যাক অর্ডার' : 'Track Order'}
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('wishlist')}
                    >
                      <Heart className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'ইচ্ছার তালিকা' : 'Wishlist'}
                      </span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('contact-support')}
                    >
                      <Headphones className="h-6 w-6" />
                      <span className="text-sm">
                        {language === 'bn' ? 'সাহায্য' : 'Get Help'}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'bn' ? 'আপনার জন্য সুপারিশ' : 'Recommended for You'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Samsung Galaxy S24', price: 89000, rating: 4.8 },
                    { name: 'iPhone 15', price: 120000, rating: 4.9 },
                    { name: 'Nike Air Max', price: 12500, rating: 4.6 },
                    { name: 'HP Laptop i7', price: 65000, rating: 4.7 }
                  ].map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                      <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                      <p className="text-lg font-bold text-orange-600">৳{item.price.toLocaleString('bn-BD')}</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
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
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                </h1>
                <p className="text-orange-100 mt-2">
                  {language === 'bn' ? 'আপনার অ্যাকাউন্ট পরিচালনা করুন' : 'Manage your account and preferences'}
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
                  <AvatarFallback>JD</AvatarFallback>
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

export default MyAccount;
