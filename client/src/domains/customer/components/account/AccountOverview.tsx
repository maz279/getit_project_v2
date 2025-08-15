import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  CreditCard, 
  MapPin, 
  Bell, 
  Shield,
  Star,
  TrendingUp,
  Calendar,
  Package,
  DollarSign
} from 'lucide-react';

interface AccountStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  rewardPoints: number;
  memberSince: string;
  orderHistory: Array<{
    id: string;
    date: string;
    status: string;
    total: number;
    items: number;
  }>;
}

export const AccountOverview: React.FC = () => {
  // Mock data - in real app, this would come from API
  const accountStats: AccountStats = {
    totalOrders: 24,
    totalSpent: 45600,
    wishlistItems: 12,
    rewardPoints: 2850,
    memberSince: 'January 2023',
    orderHistory: [
      { id: 'ORD-2024-001', date: '2024-07-10', status: 'Delivered', total: 2500, items: 3 },
      { id: 'ORD-2024-002', date: '2024-07-08', status: 'Shipped', total: 1200, items: 1 },
      { id: 'ORD-2024-003', date: '2024-07-05', status: 'Processing', total: 3400, items: 2 }
    ]
  };

  const loyaltyLevel = accountStats.rewardPoints >= 5000 ? 'Platinum' : 
                     accountStats.rewardPoints >= 2500 ? 'Gold' : 
                     accountStats.rewardPoints >= 1000 ? 'Silver' : 'Bronze';

  const nextLevelPoints = loyaltyLevel === 'Gold' ? 5000 : 
                         loyaltyLevel === 'Silver' ? 2500 : 
                         loyaltyLevel === 'Bronze' ? 1000 : 0;

  const progressPercentage = nextLevelPoints > 0 ? (accountStats.rewardPoints / nextLevelPoints) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Customer!</h1>
        <p className="text-blue-100">Here's your account overview and recent activity</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{accountStats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountStats.wishlistItems}</div>
            <p className="text-xs text-muted-foreground">2 items on sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountStats.rewardPoints}</div>
            <p className="text-xs text-muted-foreground">Earn 150 more for next level</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Loyalty Status
          </CardTitle>
          <CardDescription>
            You're a {loyaltyLevel} member since {accountStats.memberSince}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant={loyaltyLevel === 'Platinum' ? 'default' : 'secondary'} className="text-sm">
              {loyaltyLevel} Member
            </Badge>
            <span className="text-sm text-muted-foreground">
              {accountStats.rewardPoints} / {nextLevelPoints} points
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {loyaltyLevel !== 'Platinum' && `${nextLevelPoints - accountStats.rewardPoints} points to reach ${loyaltyLevel === 'Gold' ? 'Platinum' : loyaltyLevel === 'Silver' ? 'Gold' : 'Silver'} level`}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Package className="w-4 h-4 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accountStats.orderHistory.slice(0, 3).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <MapPin className="w-4 h-4 mr-2" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">Home Address</p>
                <p className="text-xs text-muted-foreground">123 Main St, Dhaka 1000</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">Office Address</p>
                <p className="text-xs text-muted-foreground">456 Business Ave, Dhaka 1200</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Addresses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">bKash</p>
                <p className="text-xs text-muted-foreground">**** **** **** 1234</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">Visa Card</p>
                <p className="text-xs text-muted-foreground">**** **** **** 5678</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Payment Methods
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center justify-start">
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </Button>
            <Button variant="outline" className="flex items-center justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
            <Button variant="outline" className="flex items-center justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" className="flex items-center justify-start">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};