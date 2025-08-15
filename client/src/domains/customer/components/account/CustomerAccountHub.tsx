/**
 * Amazon.com/Shopee.sg-Level Customer Account Hub
 * Consolidates user profile, order history, wishlist, and account management
 * Implements enterprise-grade account dashboard with cultural optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard,
  Settings,
  Bell,
  Shield,
  Star,
  Gift,
  Truck,
  Calendar,
  Crown,
  Award
} from 'lucide-react';

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  total: number;
  items: number;
  trackingNumber?: string;
}

interface WishlistItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  discount?: number;
}

interface CustomerAccountHubProps {
  className?: string;
  language?: 'en' | 'bn';
}

export const CustomerAccountHub: React.FC<CustomerAccountHubProps> = ({
  className = '',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({
    name: 'আহমেদ করিম',
    email: 'ahmed.karim@email.com',
    phone: '+880 1712-345678',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    memberSince: '2022-03-15',
    loyaltyPoints: 2450,
    loyaltyTier: 'Gold',
    completedOrders: 47,
    savedAmount: 15600
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    // Mock data for demonstration
    setRecentOrders([
      {
        id: 'ORD-2024-001',
        date: '2024-01-10',
        status: 'delivered',
        total: 2850,
        items: 3,
        trackingNumber: 'BD123456789'
      },
      {
        id: 'ORD-2024-002',
        date: '2024-01-08',
        status: 'shipped',
        total: 1200,
        items: 1,
        trackingNumber: 'BD987654321'
      },
      {
        id: 'ORD-2024-003',
        date: '2024-01-05',
        status: 'processing',
        total: 4500,
        items: 2
      }
    ]);

    setWishlistItems([
      {
        id: '1',
        title: 'Premium Wireless Earbuds',
        bengaliTitle: 'প্রিমিয়াম ওয়্যারলেস ইয়ারবাড',
        price: 1850,
        originalPrice: 2500,
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200',
        inStock: true,
        discount: 26
      },
      {
        id: '2',
        title: 'Handwoven Cotton Saree',
        bengaliTitle: 'হস্তবোনা কটন শাড়ি',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200',
        inStock: false
      }
    ]);
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Order['status']) => {
    if (language === 'bn') {
      switch (status) {
        case 'delivered': return 'ডেলিভার হয়েছে';
        case 'shipped': return 'পাঠানো হয়েছে';
        case 'processing': return 'প্রক্রিয়াধীন';
        case 'cancelled': return 'বাতিল';
        default: return 'অজানা';
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={`customer-account-hub ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${user.loyaltyTier === 'Gold' ? 'bg-yellow-500' : 'bg-gray-500'} text-white`}>
                  <Crown className="w-3 h-3 mr-1" />
                  {user.loyaltyTier} Member
                </Badge>
                <span className="text-sm text-gray-500">
                  {language === 'bn' ? 'সদস্য হওয়ার তারিখ' : 'Member since'}: {user.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{user.completedOrders}</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'সম্পূর্ণ অর্ডার' : 'Orders'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">৳{user.savedAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'মোট সাশ্রয়' : 'Total Saved'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{user.loyaltyPoints}</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'লয়ালটি পয়েন্ট' : 'Loyalty Points'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{wishlistItems.length}</div>
                <div className="text-sm text-gray-600">
                  {language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist Items'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {language === 'bn' ? 'অর্ডার' : 'Orders'}
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {language === 'bn' ? 'ঠিকানা' : 'Addresses'}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {language === 'bn' ? 'সেটিংস' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {language === 'bn' ? 'লয়ালটি প্রোগ্রাম' : 'Loyalty Program'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {language === 'bn' ? 'প্ল্যাটিনাম পর্যন্ত' : 'Progress to Platinum'}
                        </span>
                        <span className="text-sm font-medium">2,450 / 5,000</span>
                      </div>
                      <Progress value={49} className="h-2" />
                    </div>
                    <Button className="w-full" variant="outline">
                      {language === 'bn' ? 'রিওয়ার্ড দেখুন' : 'View Rewards'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {language === 'bn' ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <div className="font-medium">Order ORD-2024-001 delivered</div>
                        <div className="text-gray-500">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <div className="font-medium">Order ORD-2024-002 shipped</div>
                        <div className="text-gray-500">1 day ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="text-sm">
                        <div className="font-medium">Added 2 items to wishlist</div>
                        <div className="text-gray-500">3 days ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'আমার অর্ডার' : 'My Orders'}
              </h3>
              <Button variant="outline" size="sm">
                {language === 'bn' ? 'সব দেখুন' : 'View All'}
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {order.date}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {order.items} items • ৳{order.total.toLocaleString()}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-xs text-blue-600 mt-1">
                            Tracking: {order.trackingNumber}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {getStatusText(order.status)}
                        </Badge>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'আমার পছন্দের তালিকা' : 'My Wishlist'}
              </h3>
              <Button variant="outline" size="sm">
                {language === 'bn' ? 'শেয়ার করুন' : 'Share List'}
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {wishlistItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {language === 'bn' && item.bengaliTitle ? item.bengaliTitle : item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold text-blue-600">
                            ৳{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ৳{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" disabled={!item.inStock}>
                            {!item.inStock 
                              ? (language === 'bn' ? 'স্টকে নেই' : 'Out of Stock')
                              : (language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart')
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {language === 'bn' ? 'সংরক্ষিত ঠিকানা' : 'Saved Addresses'}
              </h3>
              <Button size="sm">
                {language === 'bn' ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Home</div>
                    <div className="text-sm text-gray-600 mt-1">
                      House #123, Road #5, Block A<br />
                      Bashundhara R/A, Dhaka-1229<br />
                      Bangladesh
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Phone: +880 1712-345678
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                    </Button>
                    <Button size="sm" variant="outline">
                      {language === 'bn' ? 'ডিলিট' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    {language === 'bn' ? 'নোটিফিকেশন সেটিংস' : 'Notification Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Order Updates</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Promotional Offers</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Price Drop Alerts</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {language === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'দুই-ফ্যাক্টর অথেন্টিকেশন' : 'Two-Factor Authentication'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {language === 'bn' ? 'লগইন হিস্টরি' : 'Login History'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerAccountHub;