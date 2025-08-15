import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Shield, 
  Bell, 
  Settings,
  Star,
  TrendingUp,
  Gift,
  Calendar,
  Phone,
  Mail,
  Edit3,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import EnhancedUserApiService from '@/shared/services/user/EnhancedUserApiService';
import SecuritySettingsPanel from './SecuritySettingsPanel';
import BangladeshProfileForm from './BangladeshProfileForm';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  verificationStatus: string;
  accountTier: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  wishlistCount: number;
  addressCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
  trackingNumber?: string;
}

interface AccountActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const UserAccountDashboard: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [accountActivity, setAccountActivity] = useState<AccountActivity[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profileRes, addressesRes, preferencesRes] = await Promise.all([
        EnhancedUserApiService.getProfile(),
        EnhancedUserApiService.getAddresses(),
        EnhancedUserApiService.getPreferences()
      ]);

      if (profileRes.success) {
        setUserProfile(profileRes.data);
      }

      if (addressesRes.success) {
        setAddresses(addressesRes.data || []);
      }

      if (preferencesRes.success) {
        setPreferences(preferencesRes.data);
      }

      // Mock data for demonstration - replace with actual API calls
      setRecentOrders([
        {
          id: '1',
          orderNumber: 'ORD-2025-001',
          date: '2025-07-05',
          status: 'delivered',
          total: 2500,
          items: 3,
          trackingNumber: 'TRK123456789'
        },
        {
          id: '2',
          orderNumber: 'ORD-2025-002',
          date: '2025-07-03',
          status: 'processing',
          total: 1800,
          items: 2
        }
      ]);

      setAccountActivity([
        {
          id: '1',
          type: 'order_placed',
          description: 'Order ORD-2025-002 placed successfully',
          timestamp: '2025-07-03T10:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          type: 'profile_updated',
          description: 'Profile information updated',
          timestamp: '2025-07-02T15:45:00Z',
          status: 'success'
        }
      ]);

    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return <Package className="h-4 w-4" />;
      case 'profile_updated': return <User className="h-4 w-4" />;
      case 'payment_added': return <CreditCard className="h-4 w-4" />;
      case 'security_update': return <Shield className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getVerificationLevel = () => {
    if (!userProfile) return 0;
    let level = 0;
    if (userProfile.email) level += 20;
    if (userProfile.phone) level += 20;
    if (userProfile.verificationStatus === 'verified') level += 60;
    return level;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile?.avatar} alt={userProfile?.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {userProfile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userProfile?.name || 'User'}</h1>
                <p className="text-gray-600">{userProfile?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">
                    {userProfile?.accountTier || 'Standard'} Member
                  </Badge>
                  {userProfile?.verificationStatus === 'verified' && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="bangladesh">Bangladesh</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userProfile?.totalOrders || 0}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">৳{userProfile?.totalSpent?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Gift className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userProfile?.loyaltyPoints || 0}</p>
                      <p className="text-sm text-gray-600">Loyalty Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{userProfile?.wishlistCount || 0}</p>
                      <p className="text-sm text-gray-600">Wishlist Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Account Completion</CardTitle>
                <CardDescription>Complete your profile to unlock more features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Profile Verification</span>
                    <span className="text-sm font-medium">{getVerificationLevel()}%</span>
                  </div>
                  <Progress value={getVerificationLevel()} className="h-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${userProfile?.email ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">Email Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${userProfile?.phone ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">Phone Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${userProfile?.verificationStatus === 'verified' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">Identity Verified</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.items} items • ৳{order.total}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accountActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.status === 'success' ? 'bg-green-100 text-green-600' :
                          activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track all your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">Placed on {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Amount</p>
                          <p className="text-lg font-bold text-green-600">৳{order.total}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Items</p>
                          <p>{order.items} products</p>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <p className="text-sm font-medium">Tracking</p>
                            <p className="text-sm font-mono">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">View Details</Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">Reorder</Button>
                        )}
                        {order.trackingNumber && (
                          <Button variant="outline" size="sm">Track Package</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
                      <p className="text-gray-600 mb-4">Add your first address for faster checkout</p>
                      <Button>Add New Address</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{address.type}</h4>
                              <p className="text-sm text-gray-600">{address.addressLine1}</p>
                              <p className="text-sm text-gray-600">{address.district}, {address.postalCode}</p>
                            </div>
                            {address.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                    <p className="text-gray-600 mb-4">Add a payment method for faster checkout</p>
                    <Button>Add Payment Method</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <SecuritySettingsPanel />
          </TabsContent>

          {/* Bangladesh Tab */}
          <TabsContent value="bangladesh">
            <BangladeshProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserAccountDashboard;