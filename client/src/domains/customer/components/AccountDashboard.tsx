import React, { useState } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { User, Package, CreditCard, Bell, Shield, Gift, Star, Settings, MapPin, Heart, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountDashboard: React.FC = () => {
  const [activeOrders] = useState(3);
  const [loyaltyPoints] = useState(2485);
  const [totalOrders] = useState(47);
  const [membershipTier] = useState('Gold');

  // Quick stats for dashboard overview
  const quickStats = [
    { title: 'Active Orders', value: activeOrders, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Loyalty Points', value: loyaltyPoints, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Total Orders', value: totalOrders, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Membership', value: membershipTier, icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  // Quick actions menu
  const quickActions = [
    { title: 'Order History', description: 'View all your orders', icon: Package, link: '/account/orders', color: 'text-blue-600' },
    { title: 'Profile Settings', description: 'Manage your profile', icon: User, link: '/account/profile', color: 'text-green-600' },
    { title: 'Payment Methods', description: 'Manage payments', icon: CreditCard, link: '/account/payments', color: 'text-purple-600' },
    { title: 'Address Book', description: 'Manage addresses', icon: MapPin, link: '/account/addresses', color: 'text-orange-600' },
    { title: 'Security Settings', description: 'Account security', icon: Shield, link: '/account/security', color: 'text-red-600' },
    { title: 'Notifications', description: 'Notification preferences', icon: Bell, link: '/account/notifications', color: 'text-indigo-600' }
  ];

  // Recent activity (mock data)
  const recentActivity = [
    { action: 'Order #BD-2025-001 shipped', time: '2 hours ago', type: 'order' },
    { action: 'Earned 50 loyalty points', time: '1 day ago', type: 'points' },
    { action: 'Payment method updated', time: '3 days ago', type: 'account' },
    { action: 'Order #BD-2025-002 delivered', time: '5 days ago', type: 'order' }
  ];

  return (
    <div className="bg-white flex flex-col overflow-hidden items-stretch min-h-screen">
      {/* Blue-purple-red gradient header for consistent design */}
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account Dashboard</h1>
          <p className="text-gray-600">Manage your account, orders, and preferences</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.link} className="block">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gray-50`}>
                              <action.icon className={`h-5 w-5 ${action.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest account activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className={`p-1.5 rounded-full ${
                        activity.type === 'order' ? 'bg-blue-100' :
                        activity.type === 'points' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {activity.type === 'order' ? (
                          <Package className="h-3 w-3 text-blue-600" />
                        ) : activity.type === 'points' ? (
                          <Star className="h-3 w-3 text-yellow-600" />
                        ) : (
                          <User className="h-3 w-3 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/account/activity">View All Activity</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Tabs for Additional Features */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>
                    Complete overview of your GetIt Bangladesh account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Account Status</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email Verified</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone Verified</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">KYC Status</span>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">Completed</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Membership Benefits</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Tier</span>
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800">Gold</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Tier</span>
                          <span className="text-gray-900">Platinum (₹2,000 more)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Free Shipping</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Preferences</CardTitle>
                  <CardDescription>
                    Customize your shopping experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Language Preference</h3>
                        <p className="text-sm text-gray-600">Choose your preferred language</p>
                      </div>
                      <Button variant="outline">বাংলা / English</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Currency Display</h3>
                        <p className="text-sm text-gray-600">Select your currency</p>
                      </div>
                      <Button variant="outline">৳ BDT</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Personalized Recommendations</h3>
                        <p className="text-sm text-gray-600">AI-powered product suggestions</p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loyalty Program</CardTitle>
                  <CardDescription>
                    Your rewards and loyalty benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">{loyaltyPoints}</div>
                    <p className="text-gray-600">Available Points</p>
                    <Button className="mt-4" asChild>
                      <Link to="/account/loyalty">Redeem Points</Link>
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Upcoming Rewards</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>₹100 Off Coupon</span>
                        <Badge variant="outline">500 points</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Free Shipping for 1 Month</span>
                        <Badge variant="outline">1000 points</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Premium Membership (3 Months)</span>
                        <Badge variant="outline">2500 points</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    My Wishlist
                  </CardTitle>
                  <CardDescription>
                    Items you've saved for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-4">Start adding items you love to see them here</p>
                    <Button asChild>
                      <Link to="/category-browse">Browse Products</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Gray-blue-purple gradient footer for consistent design */}
      <Footer />
    </div>
  );
};

export default AccountDashboard;