
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
  AlertTriangle,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Building,
  Globe,
  Mail,
  Phone,
  History
} from 'lucide-react';

export const FailedPaymentsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [selectedReason, setSelectedReason] = useState('all');

  // Mock failed payment data
  const failedPaymentStats = {
    totalFailedToday: 127,
    totalFailedThisWeek: 543,
    totalFailedThisMonth: 2156,
    failureRate: 3.8,
    totalAmountLost: 89750,
    averageFailedAmount: 185.4,
    topFailureReason: 'Insufficient Funds',
    recoveryRate: 24.5
  };

  const failureReasons = [
    { reason: 'Insufficient Funds', count: 387, percentage: 35.8, color: 'red' },
    { reason: 'Card Declined', count: 298, percentage: 27.6, color: 'orange' },
    { reason: 'Invalid Card Details', count: 165, percentage: 15.3, color: 'yellow' },
    { reason: 'Network Timeout', count: 134, percentage: 12.4, color: 'blue' },
    { reason: 'Bank Processing Error', count: 97, percentage: 9.0, color: 'purple' }
  ];

  const recentFailedPayments = [
    {
      id: 'TXN-F001234',
      orderId: 'ORD-2024-5678',
      customer: 'Ahmed Rahman',
      email: 'ahmed.rahman@email.com',
      phone: '+8801712345678',
      amount: 2340,
      currency: 'BDT',
      method: 'Credit Card',
      reason: 'Insufficient Funds',
      timestamp: '2024-06-26 14:30:25',
      gateway: 'Stripe',
      retryCount: 2,
      lastRetry: '2024-06-26 16:45:12',
      canRetry: true,
      customerNotified: true
    },
    {
      id: 'TXN-F001235',
      orderId: 'ORD-2024-5679',
      customer: 'Sarah Khan',
      email: 'sarah.khan@email.com',
      phone: '+8801798765432',
      amount: 1890,
      currency: 'BDT',
      method: 'bKash',
      reason: 'Card Declined',
      timestamp: '2024-06-26 14:28:15',
      gateway: 'bKash',
      retryCount: 1,
      lastRetry: '2024-06-26 15:30:00',
      canRetry: true,
      customerNotified: false
    },
    {
      id: 'TXN-F001236',
      orderId: 'ORD-2024-5680',
      customer: 'Mohammad Ali',
      email: 'mohammad.ali@email.com',
      phone: '+8801856789012',
      amount: 3450,
      currency: 'BDT',
      method: 'Bank Transfer',
      reason: 'Bank Processing Error',
      timestamp: '2024-06-26 14:25:40',
      gateway: 'Dutch Bangla Bank',
      retryCount: 0,
      lastRetry: null,
      canRetry: false,
      customerNotified: true
    }
  ];

  const recoveryActions = [
    {
      action: 'Auto Retry',
      description: 'Automatically retry failed payments after 1 hour',
      status: 'Active',
      successRate: '32%'
    },
    {
      action: 'Customer Email',
      description: 'Send payment failure notification to customer',
      status: 'Active',
      successRate: '18%'
    },
    {
      action: 'SMS Reminder',
      description: 'Send SMS reminder for payment completion',
      status: 'Active',
      successRate: '15%'
    },
    {
      action: 'Alternative Payment',
      description: 'Suggest alternative payment methods',
      status: 'Inactive',
      successRate: '28%'
    }
  ];

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'insufficient funds':
        return 'bg-red-100 text-red-800';
      case 'card declined':
        return 'bg-orange-100 text-orange-800';
      case 'invalid card details':
        return 'bg-yellow-100 text-yellow-800';
      case 'network timeout':
        return 'bg-blue-100 text-blue-800';
      case 'bank processing error':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Failed Payment Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Failed Today</p>
                <p className="text-3xl font-bold text-red-800">{failedPaymentStats.totalFailedToday}</p>
                <p className="text-xs text-red-600 font-medium flex items-center mt-1">
                  <TrendingDown size={12} className="mr-1" />
                  {failedPaymentStats.failureRate}% failure rate
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold text-orange-800">{failedPaymentStats.totalFailedThisWeek}</p>
                <p className="text-xs text-orange-600 font-medium flex items-center mt-1">
                  <Calendar size={12} className="mr-1" />
                  Last 7 days
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Amount Lost</p>
                <p className="text-3xl font-bold text-purple-800">৳ {failedPaymentStats.totalAmountLost.toLocaleString()}</p>
                <p className="text-xs text-purple-600 font-medium flex items-center mt-1">
                  <DollarSign size={12} className="mr-1" />
                  Avg: ৳ {failedPaymentStats.averageFailedAmount}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Recovery Rate</p>
                <p className="text-3xl font-bold text-green-800">{failedPaymentStats.recoveryRate}%</p>
                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                  <CheckCircle2 size={12} className="mr-1" />
                  Successfully recovered
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failure Reasons and Recovery Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-3 h-5 w-5 text-red-600" />
              Top Failure Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failureReasons.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" style={{ 
                      backgroundColor: `hsl(${index * 40 + 10}, 60%, 50%)` 
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-800">{item.reason}</p>
                      <p className="text-sm text-gray-500">{item.count} failures</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-3 h-5 w-5 text-blue-600" />
              Recovery Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recoveryActions.map((action, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{action.action}</h4>
                    <Badge className={action.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {action.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Success Rate: <strong>{action.successRate}</strong></span>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFailedPaymentsTab = () => (
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
                  className="pl-10 pr-4 py-2 w-80 focus:ring-2 focus:ring-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="all">All Reasons</option>
                <option value="insufficient-funds">💰 Insufficient Funds</option>
                <option value="card-declined">💳 Card Declined</option>
                <option value="invalid-details">❌ Invalid Details</option>
                <option value="network-timeout">🌐 Network Timeout</option>
                <option value="bank-error">🏦 Bank Error</option>
              </select>
              <select 
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
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

      {/* Failed Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <XCircle className="mr-3 h-5 w-5 text-red-600" />
              Failed Payments
            </CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-600">
              {recentFailedPayments.length} failed payments
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
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Failure Reason</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Retry Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentFailedPayments.map((payment, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-red-600">{payment.id}</div>
                        <div className="text-sm text-gray-500">{payment.orderId}</div>
                        <div className="text-xs text-gray-400">{payment.timestamp}</div>
                        <div className="text-xs text-gray-500 mt-1">{payment.gateway}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{payment.customer}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {payment.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {payment.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-red-600">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{payment.method}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getReasonColor(payment.reason)}`}>
                        {payment.reason}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500">Retries:</span> {payment.retryCount}
                        </div>
                        {payment.lastRetry && (
                          <div className="text-xs text-gray-400">
                            Last: {payment.lastRetry}
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          {payment.customerNotified ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Notified
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Notified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {payment.canRetry && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!payment.customerNotified && (
                            <Button variant="outline" size="sm" className="text-xs">
                              <Mail className="h-4 w-4 mr-1" />
                              Notify
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-xs">
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">Showing 1-10 of 2,156 failed payments</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">← Previous</Button>
              <Button variant="outline" size="sm" className="bg-red-600 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">...</Button>
              <Button variant="outline" size="sm">216</Button>
              <Button variant="outline" size="sm">Next →</Button>
            </div>
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
              <BarChart3 className="mr-3 h-5 w-5 text-red-600" />
              Failure Trends (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center border-2 border-dashed border-red-200">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Failure Trends Chart</p>
                <p className="text-sm text-gray-500">Payment failure patterns over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-3 h-5 w-5 text-orange-600" />
              Failure by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg flex items-center justify-center border-2 border-dashed border-orange-200">
              <div className="text-center">
                <PieChart className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Payment Method Analysis</p>
                <p className="text-sm text-gray-500">Failure distribution by method</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">24.5%</div>
              <div className="text-sm text-gray-600 mt-1">Overall Recovery Rate</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">1.2 hrs</div>
              <div className="text-sm text-gray-600 mt-1">Average Recovery Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">৳ 21,890</div>
              <div className="text-sm text-gray-600 mt-1">Amount Recovered Today</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600 mt-1">Customers Notified</div>
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
              <XCircle className="mr-3 h-8 w-8 text-red-600" />
              Failed Payments Management
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              📍 Order Management → Payment Management → Failed Payments
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
            <Button className="bg-red-600 hover:bg-red-700">
              <Settings className="h-4 w-4 mr-2" />
              Recovery Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="overview" className="py-3 px-4 data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="payments" className="py-3 px-4 data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
              <FileText className="h-4 w-4 mr-2" />
              Failed Payments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-3 px-4 data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          {renderFailedPaymentsTab()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
