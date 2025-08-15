
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  FileText,
  Shield,
  Zap,
  Users,
  Building,
  Globe
} from 'lucide-react';

export const PaymentStatusContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock payment data
  const paymentStats = {
    totalTransactions: 15420,
    successfulPayments: 14876,
    failedPayments: 325,
    pendingPayments: 219,
    totalAmount: 2847650,
    successRate: 96.5,
    averageAmount: 184.7,
    disputeRate: 0.8
  };

  const paymentMethods = [
    { name: 'Credit Card', transactions: 8945, amount: 1650000, percentage: 58.0 },
    { name: 'Mobile Banking', transactions: 4320, amount: 798000, percentage: 28.0 },
    { name: 'Digital Wallet', transactions: 1875, amount: 289000, percentage: 12.2 },
    { name: 'Bank Transfer', transactions: 280, amount: 110650, percentage: 1.8 }
  ];

  const recentTransactions = [
    {
      id: 'TXN001234',
      orderId: 'ORD-2024-5678',
      customer: 'Ahmed Rahman',
      amount: 2340,
      method: 'Credit Card',
      status: 'Completed',
      timestamp: '2024-06-26 14:30:25',
      gateway: 'Stripe',
      currency: 'BDT'
    },
    {
      id: 'TXN001235',
      orderId: 'ORD-2024-5679',
      customer: 'Sarah Khan',
      amount: 1890,
      method: 'bKash',
      status: 'Failed',
      timestamp: '2024-06-26 14:28:15',
      gateway: 'bKash',
      currency: 'BDT'
    },
    {
      id: 'TXN001236',
      orderId: 'ORD-2024-5680',
      customer: 'Mohammad Ali',
      amount: 3450,
      method: 'Nagad',
      status: 'Pending',
      timestamp: '2024-06-26 14:25:40',
      gateway: 'Nagad',
      currency: 'BDT'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Payment Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Successful Payments</p>
                <p className="text-3xl font-bold text-green-800">{paymentStats.successfulPayments.toLocaleString()}</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <TrendingUp size={12} className="mr-1" />
                  {paymentStats.successRate}% success rate
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Failed Payments</p>
                <p className="text-3xl font-bold text-red-800">{paymentStats.failedPayments}</p>
                <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                  <TrendingDown size={12} className="mr-1" />
                  {((paymentStats.failedPayments / paymentStats.totalTransactions) * 100).toFixed(1)}% failure rate
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-800">{paymentStats.pendingPayments}</p>
                <p className="text-xs text-yellow-600 font-medium flex items-center mt-1">
                  <Clock size={12} className="mr-1" />
                  Awaiting processing
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-800">৳ {paymentStats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-blue-600 font-medium flex items-center mt-1">
                  <DollarSign size={12} className="mr-1" />
                  Avg: ৳ {paymentStats.averageAmount}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-3 h-5 w-5 text-blue-600" />
              Payment Methods Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500" style={{ 
                      backgroundColor: `hsl(${index * 90}, 60%, 50%)` 
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-800">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.transactions.toLocaleString()} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">৳ {method.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{method.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-green-600" />
              Payment Trends (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Payment Trends Chart</p>
                <p className="text-sm text-gray-500">7-day payment volume analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by transaction ID, order ID, or customer..."
                  className="pl-10 pr-4 py-2 w-80 focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">✅ Completed</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
                <option value="processing">🔄 Processing</option>
              </select>
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
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

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-3 h-5 w-5 text-purple-600" />
              Recent Transactions
            </CardTitle>
            <Badge variant="outline" className="bg-purple-50 text-purple-600">
              {recentTransactions.length} transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Transaction</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Method</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Gateway</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-blue-600">{transaction.id}</div>
                        <div className="text-sm text-gray-500">{transaction.orderId}</div>
                        <div className="text-xs text-gray-400">{transaction.timestamp}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium">{transaction.customer}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-green-600">
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{transaction.method}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getStatusColor(transaction.status)} flex items-center space-x-1`}>
                        {getStatusIcon(transaction.status)}
                        <span>{transaction.status}</span>
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">{transaction.gateway}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {transaction.status === 'Failed' && (
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
            <p className="text-sm text-gray-600">Showing 1-10 of 15,420 transactions</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">← Previous</Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">...</Button>
              <Button variant="outline" size="sm">1542</Button>
              <Button variant="outline" size="sm">Next →</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGatewaysTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-3 h-5 w-5 text-indigo-600" />
            Payment Gateway Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Stripe', status: 'Active', uptime: '99.9%', transactions: 8945, color: 'green' },
              { name: 'bKash', status: 'Active', uptime: '99.7%', transactions: 3420, color: 'green' },
              { name: 'Nagad', status: 'Active', uptime: '99.5%', transactions: 1876, color: 'green' },
              { name: 'Rocket', status: 'Maintenance', uptime: '98.2%', transactions: 543, color: 'yellow' },
              { name: 'SSLCOMMERZ', status: 'Active', uptime: '99.8%', transactions: 892, color: 'green' },
              { name: 'PayPal', status: 'Inactive', uptime: '0%', transactions: 0, color: 'red' }
            ].map((gateway, index) => (
              <Card key={index} className={`border-l-4 ${
                gateway.color === 'green' ? 'border-l-green-500 bg-green-50' :
                gateway.color === 'yellow' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-red-500 bg-red-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">{gateway.name}</h3>
                    <Badge className={`${
                      gateway.color === 'green' ? 'bg-green-100 text-green-800' :
                      gateway.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {gateway.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{gateway.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transactions:</span>
                      <span className="font-medium">{gateway.transactions.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-blue-600" />
              Revenue by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Revenue Analytics Chart</p>
                <p className="text-sm text-gray-500">Payment method performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-3 h-5 w-5 text-green-600" />
              Success Rate Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Success Rate Chart</p>
                <p className="text-sm text-gray-500">Payment success trends over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">96.5%</div>
              <div className="text-sm text-gray-600 mt-1">Payment Success Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">2.3s</div>
              <div className="text-sm text-gray-600 mt-1">Average Processing Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">0.8%</div>
              <div className="text-sm text-gray-600 mt-1">Dispute Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <CreditCard className="mr-3 h-8 w-8 text-blue-600" />
              Payment Status Management
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              📍 Order Management → Payment Management → Payment Status
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last Updated: {new Date().toLocaleString()}
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

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="gateways" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Globe className="h-4 w-4 mr-2" />
              Gateways
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-3 px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          {renderTransactionsTab()}
        </TabsContent>

        <TabsContent value="gateways" className="mt-6">
          {renderGatewaysTab()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
