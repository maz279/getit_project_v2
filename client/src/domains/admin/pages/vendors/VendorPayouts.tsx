/**
 * Vendor Payouts - Comprehensive vendor payment and commission management
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  DollarSign, TrendingUp, Calendar, Download, Filter, Search,
  CreditCard, Building, CheckCircle, Clock, AlertCircle, ArrowUpRight,
  FileText, Send, Eye, RefreshCw, Calculator, Wallet
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { DatePicker } from '@/shared/ui/date-picker';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Payout summary data
const payoutSummary = {
  totalPending: 'BDT 12,45,670',
  totalPaid: 'BDT 45,78,900',
  nextPayoutDate: '2024-07-15',
  vendorsAwaitingPayout: 145,
  averagePayoutAmount: 'BDT 8,590'
};

// Recent payouts data
const recentPayouts = [
  {
    id: 'PAY001',
    vendorId: 'V001',
    vendorName: 'Dhaka Electronics Hub',
    amount: 'BDT 45,670',
    commission: 'BDT 5,480',
    netAmount: 'BDT 40,190',
    status: 'completed',
    date: '2024-06-30',
    method: 'Bank Transfer',
    bankAccount: '****4567'
  },
  {
    id: 'PAY002',
    vendorId: 'V002',
    vendorName: 'Fashion Paradise BD',
    amount: 'BDT 67,890',
    commission: 'BDT 6,789',
    netAmount: 'BDT 61,101',
    status: 'processing',
    date: '2024-07-01',
    method: 'bKash',
    bankAccount: '01712****78'
  },
  {
    id: 'PAY003',
    vendorId: 'V004',
    vendorName: 'Home Decor Gallery',
    amount: 'BDT 23,450',
    commission: 'BDT 2,579',
    netAmount: 'BDT 20,871',
    status: 'pending',
    date: '2024-07-15',
    method: 'Bank Transfer',
    bankAccount: '****8901'
  },
  {
    id: 'PAY004',
    vendorId: 'V006',
    vendorName: 'Fresh Mart Grocery',
    amount: 'BDT 34,560',
    commission: 'BDT 5,184',
    netAmount: 'BDT 29,376',
    status: 'failed',
    date: '2024-06-28',
    method: 'Nagad',
    bankAccount: '01812****89'
  }
];

// Payout trends data
const payoutTrends = [
  { month: 'Jan', payouts: 2450000, vendors: 125 },
  { month: 'Feb', payouts: 2780000, vendors: 132 },
  { month: 'Mar', payouts: 3120000, vendors: 140 },
  { month: 'Apr', payouts: 3450000, vendors: 148 },
  { month: 'May', payouts: 3890000, vendors: 156 },
  { month: 'Jun', payouts: 4250000, vendors: 165 },
];

// Commission breakdown
const commissionBreakdown = [
  { category: 'Electronics', rate: '8%', totalCommission: 'BDT 3,45,670' },
  { category: 'Fashion', rate: '12%', totalCommission: 'BDT 5,67,890' },
  { category: 'Home & Living', rate: '10%', totalCommission: 'BDT 2,34,560' },
  { category: 'Food & Grocery', rate: '15%', totalCommission: 'BDT 4,56,780' },
  { category: 'Others', rate: '10%', totalCommission: 'BDT 1,23,450' }
];

// Vendor earnings data
const vendorEarnings = [
  {
    vendorId: 'V001',
    vendorName: 'Dhaka Electronics Hub',
    totalSales: 'BDT 4,56,780',
    commission: 'BDT 36,542',
    netEarnings: 'BDT 4,20,238',
    pendingAmount: 'BDT 45,670',
    lastPayout: '2024-06-15'
  },
  {
    vendorId: 'V002',
    vendorName: 'Fashion Paradise BD',
    totalSales: 'BDT 6,78,900',
    commission: 'BDT 81,468',
    netEarnings: 'BDT 5,97,432',
    pendingAmount: 'BDT 67,890',
    lastPayout: '2024-06-20'
  },
  {
    vendorId: 'V003',
    vendorName: 'Fresh Foods Market',
    totalSales: 'BDT 2,34,560',
    commission: 'BDT 35,184',
    netEarnings: 'BDT 1,99,376',
    pendingAmount: 'BDT 0',
    lastPayout: '2024-06-30'
  }
];

const VendorPayouts = () => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout
      currentPage="Vendor Payouts"
      breadcrumbItems={[
        { label: 'Vendors', href: '/admin/vendors' },
        { label: 'Vendor Payouts' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Vendor Payout Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Process vendor payments and manage commission settlements
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Process Payouts
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{payoutSummary.totalPending}</div>
              <p className="text-xs text-gray-500 mt-1">{payoutSummary.vendorsAwaitingPayout} vendors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid (MTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{payoutSummary.totalPaid}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Next Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{payoutSummary.nextPayoutDate}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payoutSummary.averagePayoutAmount}</div>
              <p className="text-xs text-gray-500 mt-1">Per vendor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Commission Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8-15%</div>
              <p className="text-xs text-gray-500 mt-1">By category</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">Pending Payouts</TabsTrigger>
            <TabsTrigger value="history">Payout History</TabsTrigger>
            <TabsTrigger value="earnings">Vendor Earnings</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Payouts Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Vendor Payouts</CardTitle>
                    <CardDescription>Review and process pending payments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate All
                    </Button>
                    <Button size="sm" disabled={selectedVendors.length === 0}>
                      <Send className="w-4 h-4 mr-2" />
                      Process Selected ({selectedVendors.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search-pending">Search Vendors</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="search-pending"
                        placeholder="Search by vendor name or ID..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="min-amount">Min Amount</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="BDT 0"
                      className="mt-1 w-32"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Sales Amount</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Net Payout</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorEarnings.filter(v => v.pendingAmount !== 'BDT 0').map((vendor) => (
                      <TableRow key={vendor.vendorId}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.vendorName}</div>
                            <div className="text-sm text-gray-500">{vendor.vendorId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Jun 16 - Jun 30</div>
                            <div className="text-gray-500">15 days</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {vendor.totalSales}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -{vendor.commission}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {vendor.pendingAmount}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Bank Transfer</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payouts are processed every 15 days. Minimum payout amount is BDT 1,000.
                    Vendors must have completed KYC verification to receive payments.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>Track all processed payments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono text-sm">{payout.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payout.vendorName}</div>
                            <div className="text-sm text-gray-500">{payout.vendorId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payout.amount}</TableCell>
                        <TableCell className="text-red-600">-{payout.commission}</TableCell>
                        <TableCell className="font-bold">{payout.netAmount}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{payout.method}</div>
                            <div className="text-gray-500">{payout.bankAccount}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payout.date}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Earnings Tab */}
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Earnings Overview</CardTitle>
                <CardDescription>Detailed earnings breakdown by vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Net Earnings</TableHead>
                      <TableHead className="text-right">Pending Amount</TableHead>
                      <TableHead>Last Payout</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorEarnings.map((vendor) => (
                      <TableRow key={vendor.vendorId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.vendorName}</div>
                            <div className="text-sm text-gray-500">{vendor.vendorId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{vendor.totalSales}</TableCell>
                        <TableCell className="text-right text-red-600">-{vendor.commission}</TableCell>
                        <TableCell className="text-right font-bold">{vendor.netEarnings}</TableCell>
                        <TableCell className="text-right">
                          {vendor.pendingAmount === 'BDT 0' ? (
                            <span className="text-gray-500">No pending</span>
                          ) : (
                            <span className="font-medium text-orange-600">{vendor.pendingAmount}</span>
                          )}
                        </TableCell>
                        <TableCell>{vendor.lastPayout}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Vendor Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">BDT 13,70,240</div>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">BDT 1,53,194</div>
                      <p className="text-xs text-gray-500 mt-1">Platform earnings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Net Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">BDT 12,17,046</div>
                      <p className="text-xs text-gray-500 mt-1">To vendors</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commission Structure</CardTitle>
                  <CardDescription>Platform commission rates by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Commission Rate</TableHead>
                        <TableHead className="text-right">Total Commission (MTD)</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionBreakdown.map((item) => (
                        <TableRow key={item.category}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{item.rate}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">{item.totalCommission}</TableCell>
                          <TableCell className="text-center">
                            <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission Distribution</CardTitle>
                  <CardDescription>Visual breakdown of commission by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Electronics', value: 345670, fill: '#3B82F6' },
                          { name: 'Fashion', value: 567890, fill: '#10B981' },
                          { name: 'Home & Living', value: 234560, fill: '#F59E0B' },
                          { name: 'Food & Grocery', value: 456780, fill: '#8B5CF6' },
                          { name: 'Others', value: 123450, fill: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {commissionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `BDT ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Trends</CardTitle>
                  <CardDescription>Monthly payout volume and vendor count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={payoutTrends}>
                      <defs>
                        <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="payouts" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorPayouts)"
                        name="Payout Amount (BDT)"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="vendors" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Active Vendors"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payout Methods</CardTitle>
                    <CardDescription>Distribution by payment method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { method: 'Bank Transfer', percentage: 45, amount: 'BDT 19,10,250' },
                        { method: 'bKash', percentage: 30, amount: 'BDT 12,73,500' },
                        { method: 'Nagad', percentage: 15, amount: 'BDT 6,36,750' },
                        { method: 'Rocket', percentage: 10, amount: 'BDT 4,24,500' }
                      ].map((method) => (
                        <div key={method.method} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{method.method}</span>
                            <span className="font-medium">{method.amount}</span>
                          </div>
                          <Progress value={method.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payout Statistics</CardTitle>
                    <CardDescription>Key metrics and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Processing Time</span>
                        <span className="font-medium">2.5 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-medium text-green-600">98.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Failed Transactions</span>
                        <span className="font-medium text-red-600">1.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Transaction Value</span>
                        <span className="font-medium">BDT 8,590</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peak Payout Day</span>
                        <span className="font-medium">15th of month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Pending Payouts
              </Button>
              <Button variant="outline" className="justify-start">
                <Send className="w-4 h-4 mr-2" />
                Process Batch Payment
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Generate Statements
              </Button>
              <Button variant="outline" className="justify-start">
                <Wallet className="w-4 h-4 mr-2" />
                Update Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VendorPayouts;