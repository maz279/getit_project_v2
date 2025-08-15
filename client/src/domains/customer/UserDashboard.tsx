/**
 * UserDashboard.tsx - Amazon.com/Shopee.sg-Level Customer Dashboard
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Complete customer dashboard with Bangladesh-specific features and
 * Amazon.com/Shopee.sg-level functionality for personalized experience.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { 
  User, 
  Package, 
  Heart, 
  Star, 
  MapPin, 
  CreditCard, 
  Gift, 
  TrendingUp,
  Calendar,
  Phone,
  MessageCircle,
  Settings,
  ShoppingCart,
  Truck,
  Clock,
  Award,
  Percent,
  Bell,
  Globe
} from 'lucide-react';

// Bangladesh-specific icons
import { FaMosque, FaCalendarAlt } from 'react-icons/fa';

import { UserApiService } from '@/shared/services/user/UserApiService';
import { OrderApiService } from '@/shared/services/order/OrderApiService';
import { MarketingApiService } from '@/shared/services/marketing/MarketingApiService';
import { PaymentApiService } from '@/shared/services/payment/PaymentApiService';

interface UserDashboardProps {
  userId?: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  memberSince: string;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalOrders: number;
  totalSpent: number;
  savedAmount: number;
  preferences: {
    language: string;
    currency: string;
    notifications: boolean;
    culturalFeatures: boolean;
  };
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  date: string;
  items: Array<{
    name: string;
    image: string;
    quantity: number;
  }>;
  tracking?: {
    courier: string;
    trackingNumber: string;
    status: string;
  };
}

interface LoyaltyStatus {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: string;
  nextTierThreshold: number;
  progress: number;
  rewards: Array<{
    id: string;
    title: string;
    points: number;
    description: string;
  }>;
}

interface BangladeshFeatures {
  mobileWallets: Array<{
    provider: 'bkash' | 'nagad' | 'rocket';
    connected: boolean;
    balance?: number;
  }>;
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    location: string;
  };
  upcomingFestivals: Array<{
    name: string;
    date: string;
    countdown: string;
    specialOffers: number;
  }>;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [bangladeshFeatures, setBangladeshFeatures] = useState<BangladeshFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profile = await UserApiService.getProfile();
      setUserProfile(profile);

      // Load recent orders
      const orders = await OrderApiService.getRecentOrders({ limit: 5 });
      setRecentOrders(orders);

      // Load loyalty status
      const loyalty = await MarketingApiService.getUserLoyaltyPoints(profile.id);
      setLoyaltyStatus(loyalty);

      // Load Bangladesh-specific features
      const bangladeshData = await loadBangladeshFeatures();
      setBangladeshFeatures(bangladeshData);

    } catch (error) {
      console.error('Error loading user dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBangladeshFeatures = async () => {
    // Mock Bangladesh-specific data - would come from actual services
    return {
      mobileWallets: [
        { provider: 'bkash' as const, connected: true, balance: 2450 },
        { provider: 'nagad' as const, connected: false },
        { provider: 'rocket' as const, connected: true, balance: 1200 }
      ],
      prayerTimes: {
        fajr: '04:30',
        dhuhr: '12:15',
        asr: '16:45',
        maghrib: '18:30',
        isha: '19:45',
        location: 'Dhaka, Bangladesh'
      },
      upcomingFestivals: [
        { name: 'Eid ul-Fitr', date: '2025-04-01', countdown: '85 days', specialOffers: 150 },
        { name: 'Pohela Boishakh', date: '2025-04-14', countdown: '98 days', specialOffers: 75 }
      ]
    };
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gray-800 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      default: return 'bg-orange-600 text-white';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Unable to load user profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                <CardDescription className="text-sm">{userProfile.email}</CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getTierColor(userProfile.loyaltyTier)}>
                    <Award className="h-3 w-3 mr-1" />
                    {userProfile.loyaltyTier.toUpperCase()} MEMBER
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Since {userProfile.memberSince}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="font-bold">{userProfile.totalOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="font-bold">৳{userProfile.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-green-600">
              <span className="text-sm">Saved Amount</span>
              <span className="font-bold">৳{userProfile.savedAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">৳{order.total.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Truck className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Progress */}
            {loyaltyStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Loyalty Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Points</span>
                        <span className="font-bold">{loyaltyStatus.currentPoints.toLocaleString()}</span>
                      </div>
                      <Progress value={loyaltyStatus.progress} className="mt-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {loyaltyStatus.nextTierThreshold - loyaltyStatus.currentPoints} points to {loyaltyStatus.tier}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Earned</p>
                        <p className="font-bold text-green-600">{loyaltyStatus.totalEarned.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Redeemed</p>
                        <p className="font-bold text-blue-600">{loyaltyStatus.totalRedeemed.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  <span className="text-sm">Shop Now</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Heart className="h-6 w-6 mb-2" />
                  <span className="text-sm">Wishlist</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Truck className="h-6 w-6 mb-2" />
                  <span className="text-sm">Track Order</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span className="text-sm">Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View and manage your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Order #{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                        <p className="text-sm font-medium mt-1">৳{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <p className="text-xs font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.tracking && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-sm">
                          <Truck className="h-4 w-4 inline mr-1" />
                          {order.tracking.courier}: {order.tracking.trackingNumber}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Track Order</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty" className="space-y-6">
          {loyaltyStatus && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Loyalty Program</CardTitle>
                  <CardDescription>Earn points and unlock exclusive rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{loyaltyStatus.currentPoints.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Available Points</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{loyaltyStatus.totalEarned.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Total Earned</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{loyaltyStatus.totalRedeemed.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Total Redeemed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {loyaltyStatus.rewards.map((reward) => (
                      <div key={reward.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{reward.title}</h4>
                          <Badge variant="outline">{reward.points} points</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                        <Button size="sm" disabled={loyaltyStatus.currentPoints < reward.points}>
                          {loyaltyStatus.currentPoints >= reward.points ? 'Redeem' : 'Insufficient Points'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Bangladesh Tab */}
        <TabsContent value="bangladesh" className="space-y-6">
          {bangladeshFeatures && (
            <>
              {/* Mobile Wallets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Mobile Banking
                  </CardTitle>
                  <CardDescription>Manage your bKash, Nagad, and Rocket wallets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {bangladeshFeatures.mobileWallets.map((wallet) => (
                      <div key={wallet.provider} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{wallet.provider}</span>
                          <Badge variant={wallet.connected ? "default" : "secondary"}>
                            {wallet.connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                        </div>
                        {wallet.connected && wallet.balance && (
                          <p className="text-sm text-gray-600">Balance: ৳{wallet.balance.toLocaleString()}</p>
                        )}
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          {wallet.connected ? 'Manage' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prayer Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaMosque className="h-5 w-5 mr-2" />
                    Prayer Times
                  </CardTitle>
                  <CardDescription>{bangladeshFeatures.prayerTimes.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(bangladeshFeatures.prayerTimes).filter(([key]) => key !== 'location').map(([prayer, time]) => (
                      <div key={prayer} className="text-center p-3 border rounded-lg">
                        <p className="text-sm font-medium capitalize">{prayer}</p>
                        <p className="text-lg font-bold">{time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Festivals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaCalendarAlt className="h-5 w-5 mr-2" />
                    Upcoming Festivals
                  </CardTitle>
                  <CardDescription>Special offers and celebrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bangladeshFeatures.upcomingFestivals.map((festival, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{festival.name}</h4>
                            <p className="text-sm text-gray-600">{festival.date}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{festival.countdown}</Badge>
                            <p className="text-sm text-green-600 mt-1">{festival.specialOffers} special offers</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="language" value="en" defaultChecked />
                      <span>English</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="language" value="bn" />
                      <span>বাংলা (Bengali)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="currency" value="bdt" defaultChecked />
                      <span>BDT (৳)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="currency" value="usd" />
                      <span>USD ($)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Prayer Time Reminders</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Festival Notifications</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>

              <Button className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;