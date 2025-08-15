
import React, { useState } from 'react';
import { 
  Home, 
  Clock, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  DollarSign,
  BarChart3,
  Filter,
  Search,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Award,
  Activity,
  Shield,
  FileText,
  CreditCard,
  Truck,
  Bell,
  Settings,
  Globe,
  Target,
  Zap,
  Database,
  UserCheck
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';

interface EnhancedMainContentProps {
  activeTab: string;
}

export const EnhancedMainContent: React.FC<EnhancedMainContentProps> = ({ activeTab }) => {
  const [currentSubTab, setCurrentSubTab] = useState('overview');

  const getTabConfiguration = (tabId: string) => {
    const tabConfigs: Record<string, any> = {
      'dashboard': {
        title: 'Dashboard Overview',
        breadcrumb: 'Home > Dashboard > Overview',
        tabs: [
          { id: 'overview', label: 'Overview', active: true },
          { id: 'metrics', label: 'Real-time Metrics' },
          { id: 'performance', label: 'Platform Performance' },
          { id: 'health', label: 'System Health' },
          { id: 'quick-actions', label: 'Quick Actions' }
        ]
      },
      'user-management': {
        title: 'User Management',
        breadcrumb: 'Home > User Management > Customers',
        tabs: [
          { id: 'customers', label: 'Customers', active: true },
          { id: 'admins', label: 'Admins' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'verification', label: 'Verification' },
          { id: 'support', label: 'Support' }
        ]
      },
      'vendor-management': {
        title: 'Vendor Management',
        breadcrumb: 'Home > Vendor Management > Directory',
        tabs: [
          { id: 'directory', label: 'Directory', active: true },
          { id: 'applications', label: 'Applications' },
          { id: 'kyc', label: 'KYC' },
          { id: 'performance', label: 'Performance' },
          { id: 'payouts', label: 'Payouts' },
          { id: 'support', label: 'Support' }
        ]
      },
      'product-management': {
        title: 'Product Management',
        breadcrumb: 'Home > Product Management > Catalog',
        tabs: [
          { id: 'catalog', label: 'Catalog', active: true },
          { id: 'categories', label: 'Categories' },
          { id: 'moderation', label: 'Moderation' },
          { id: 'inventory', label: 'Inventory' },
          { id: 'analytics', label: 'Analytics' }
        ]
      },
      'order-management': {
        title: 'Order Management',
        breadcrumb: 'Home > Order Management > Overview',
        tabs: [
          { id: 'overview', label: 'Overview', active: true },
          { id: 'processing', label: 'Processing' },
          { id: 'payments', label: 'Payments' },
          { id: 'shipping', label: 'Shipping' },
          { id: 'analytics', label: 'Analytics' }
        ]
      },
      'financial-management': {
        title: 'Financial Management',
        breadcrumb: 'Home > Financial Management > Revenue',
        tabs: [
          { id: 'revenue', label: 'Revenue', active: true },
          { id: 'gateways', label: 'Gateways' },
          { id: 'payouts', label: 'Payouts' },
          { id: 'reports', label: 'Reports' },
          { id: 'monitoring', label: 'Monitoring' }
        ]
      },
      'shipping-logistics': {
        title: 'Shipping & Logistics',
        breadcrumb: 'Home > Shipping & Logistics > Courier Partners',
        tabs: [
          { id: 'courier-partners', label: 'Courier Partners', active: true },
          { id: 'delivery-management', label: 'Delivery Management' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'returns', label: 'Returns & Exchanges' }
        ]
      },
      'marketing-promotions': {
        title: 'Marketing & Promotions',
        breadcrumb: 'Home > Marketing & Promotions > Campaigns',
        tabs: [
          { id: 'campaigns', label: 'Campaigns', active: true },
          { id: 'promotional-tools', label: 'Promotional Tools' },
          { id: 'content', label: 'Content Management' },
          { id: 'analytics', label: 'Analytics' }
        ]
      },
      'analytics-reports': {
        title: 'Analytics & Reports',
        breadcrumb: 'Home > Analytics & Reports > Business Intelligence',
        tabs: [
          { id: 'business-intelligence', label: 'Business Intelligence', active: true },
          { id: 'sales', label: 'Sales Analytics' },
          { id: 'customer', label: 'Customer Analytics' },
          { id: 'financial', label: 'Financial Analytics' },
          { id: 'custom', label: 'Custom Reports' }
        ]
      },
      'settings-configuration': {
        title: 'Settings & Configuration',
        breadcrumb: 'Home > Settings & Configuration > Platform Settings',
        tabs: [
          { id: 'platform', label: 'Platform Settings', active: true },
          { id: 'payment', label: 'Payment Configuration' },
          { id: 'shipping', label: 'Shipping Configuration' },
          { id: 'localization', label: 'Localization' },
          { id: 'system', label: 'System Administration' }
        ]
      }
    };

    return tabConfigs[tabId] || tabConfigs['dashboard'];
  };

  const config = getTabConfiguration(activeTab);

  // Key Metrics Cards for Dashboard
  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-800">৳ 2,34,567</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +12.5% from yesterday
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-green-800">45,678</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +8.3% from yesterday
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Active Vendors</p>
                <p className="text-3xl font-bold text-purple-800">1,234</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +15.2% from yesterday
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Home className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-orange-800">8,901</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  +6.7% from yesterday
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
              Revenue Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Interactive Revenue Chart</p>
                <p className="text-sm text-gray-500">Line chart showing 6-month trend</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MapPin className="mr-3 h-5 w-5 text-green-600" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Bangladesh Map</p>
                <p className="text-sm text-gray-500">User distribution across divisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-3 h-5 w-5 text-orange-600" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: '🔔', text: 'New vendor application received from Dhaka Electronics', time: '2 min ago', type: 'info' },
              { icon: '📦', text: '100 new products added today across all categories', time: '15 min ago', type: 'success' },
              { icon: '💰', text: 'BDT 45,000 in vendor payouts processed successfully', time: '1 hour ago', type: 'success' },
              { icon: '⚠️', text: '3 orders requiring immediate attention for delivery issues', time: '2 hours ago', type: 'warning' },
              { icon: '🎯', text: 'Flash sale campaign started - 25% off electronics', time: '3 hours ago', type: 'info' },
              { icon: '📊', text: 'Weekly analytics report generated and sent to stakeholders', time: '4 hours ago', type: 'info' }
            ].map((activity, index) => (
              <div key={index} className={`flex items-center p-4 rounded-lg border-l-4 ${
                activity.type === 'success' ? 'bg-green-50 border-green-400' :
                activity.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <span className="text-2xl mr-4">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced Vendor Management Content
  const renderVendorContent = () => (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Controls */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search vendors by name, email, or business..."
                  className="pl-10 pr-4 py-2 w-80 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>All Status</option>
                <option>✅ Active (1,156)</option>
                <option>⏳ Pending (23)</option>
                <option>🔒 Suspended (8)</option>
                <option>❌ Rejected (15)</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home & Garden</option>
                <option>Health & Beauty</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Name A-Z</option>
                <option>Name Z-A</option>
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Most Products</option>
                <option>Best Rating</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">1,234</div>
              <div className="text-sm text-blue-600">Total Vendors</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">1,156</div>
              <div className="text-sm text-green-600">Active Vendors</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800">23</div>
              <div className="text-sm text-yellow-600">Pending Approval</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">৳ 45L</div>
              <div className="text-sm text-purple-600">Monthly Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Vendor Table */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Vendor</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Business Info</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Performance</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    name: 'ABC Electronics Ltd', 
                    email: 'contact@abcelectronics.com',
                    category: 'Electronics',
                    status: 'Active', 
                    products: '234', 
                    rating: '4.8',
                    revenue: '৳ 2,45,000',
                    statusColor: 'bg-green-100 text-green-800',
                    joinDate: '2023-01-15'
                  },
                  { 
                    name: 'Fashion House BD', 
                    email: 'info@fashionhouse.bd',
                    category: 'Fashion',
                    status: 'Pending', 
                    products: '56', 
                    rating: '4.2',
                    revenue: '৳ 89,000',
                    statusColor: 'bg-yellow-100 text-yellow-800',
                    joinDate: '2024-06-20'
                  },
                  { 
                    name: 'Home Decor Paradise', 
                    email: 'hello@homedecor.com',
                    category: 'Home & Garden',
                    status: 'Active', 
                    products: '189', 
                    rating: '4.6',
                    revenue: '৳ 1,67,000',
                    statusColor: 'bg-green-100 text-green-800',
                    joinDate: '2023-08-10'
                  }
                ].map((vendor, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {vendor.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{vendor.name}</div>
                          <div className="text-sm text-gray-500">{vendor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium">{vendor.category}</div>
                        <div className="text-xs text-gray-500">Joined: {vendor.joinDate}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={vendor.statusColor}>
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{vendor.rating}</span>
                        </div>
                        <div className="text-xs text-gray-500">{vendor.products} products</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-green-600">{vendor.revenue}</div>
                      <div className="text-xs text-gray-500">This month</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {vendor.status === 'Pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">Showing 1-10 of 1,234 vendors</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">← Previous</Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">...</Button>
              <Button variant="outline" size="sm">124</Button>
              <Button variant="outline" size="sm">Next →</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced Order Management Content
  const renderOrderContent = () => (
    <div className="space-y-6">
      {/* Order Overview Controls */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>All Orders (8,901)</option>
                <option>🆕 New Orders (156)</option>
                <option>🔄 Processing (234)</option>
                <option>📦 Shipped (445)</option>
                <option>✅ Delivered (7,891)</option>
                <option>❌ Failed (34)</option>
                <option>↩️ Returned (89)</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Last 3 Months</option>
                <option>Custom Range</option>
              </select>
              <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>All Payment Methods</option>
                <option>bKash</option>
                <option>Nagad</option>
                <option>Rocket</option>
                <option>Card Payment</option>
                <option>Cash on Delivery</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                📊 Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'New Orders', count: '156', color: 'blue', icon: '🆕' },
          { label: 'Processing', count: '234', color: 'yellow', icon: '🔄' },
          { label: 'Shipped', count: '445', color: 'purple', icon: '📦' },
          { label: 'Delivered', count: '7,891', color: 'green', icon: '✅' },
          { label: 'Failed', count: '34', color: 'red', icon: '❌' },
          { label: 'Returned', count: '89', color: 'orange', icon: '↩️' }
        ].map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100`}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className={`text-2xl font-bold text-${stat.color}-800`}>{stat.count}</div>
                <div className={`text-xs text-${stat.color}-600`}>{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Order Table */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Order Details</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Delivery</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    id: '12345', 
                    customer: 'John Rahman', 
                    email: 'john@email.com',
                    amount: '৳ 2,340', 
                    status: 'Processing', 
                    statusColor: 'bg-yellow-100 text-yellow-800', 
                    icon: '🟡',
                    paymentMethod: 'bKash',
                    items: '3 items',
                    address: 'Dhanmondi, Dhaka',
                    orderDate: '2024-06-23'
                  },
                  { 
                    id: '12346', 
                    customer: 'Sarah Ahmed', 
                    email: 'sarah@email.com',
                    amount: '৳ 1,890', 
                    status: 'Shipped', 
                    statusColor: 'bg-blue-100 text-blue-800', 
                    icon: '🟢',
                    paymentMethod: 'Nagad',
                    items: '2 items',
                    address: 'Gulshan, Dhaka',
                    orderDate: '2024-06-22'
                  },
                  { 
                    id: '12347', 
                    customer: 'Karim Hassan', 
                    email: 'karim@email.com',
                    amount: '৳ 3,450', 
                    status: 'Failed', 
                    statusColor: 'bg-red-100 text-red-800', 
                    icon: '🔴',
                    paymentMethod: 'Card',
                    items: '5 items',
                    address: 'Uttara, Dhaka',
                    orderDate: '2024-06-21'
                  }
                ].map((order, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-blue-600">#{order.id}</div>
                        <div className="text-sm text-gray-500">{order.items}</div>
                        <div className="text-xs text-gray-400">{order.orderDate}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                        <div className="text-xs text-gray-400">{order.address}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-green-600">{order.amount}</div>
                        <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={order.statusColor}>
                        {order.icon} {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        {order.status === 'Shipped' && (
                          <div className="text-blue-600">
                            <Truck className="h-4 w-4 inline mr-1" />
                            In Transit
                          </div>
                        )}
                        {order.status === 'Processing' && (
                          <div className="text-yellow-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Preparing
                          </div>
                        )}
                        {order.status === 'Failed' && (
                          <div className="text-red-600">
                            <XCircle className="h-4 w-4 inline mr-1" />
                            Payment Failed
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                        {order.status === 'Failed' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">Showing 1-25 of 8,901 orders</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">← Previous</Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">...</Button>
              <Button variant="outline" size="sm">356</Button>
              <Button variant="outline" size="sm">Next →</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    if (activeTab.includes('dashboard') || activeTab === 'overview') {
      return renderDashboardContent();
    } else if (activeTab.includes('vendor') || activeTab.includes('directory')) {
      return renderVendorContent();
    } else if (activeTab.includes('order')) {
      return renderOrderContent();
    } else {
      return renderDashboardContent(); // Default fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              {config.title}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              📍 Breadcrumb: {config.breadcrumb}
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {config.tabs.map((tab: any, index: number) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSubTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 relative ${
                currentSubTab === tab.id || (index === 0 && !currentSubTab)
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.active && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs">Active</Badge>
              )}
              {/* Active indicator */}
              {(currentSubTab === tab.id || (index === 0 && !currentSubTab)) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};
