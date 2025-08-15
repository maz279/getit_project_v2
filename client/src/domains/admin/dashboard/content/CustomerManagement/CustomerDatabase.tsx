/**
 * CustomerDatabase - Comprehensive Customer Relationship Management
 * Amazon.com/Shopee.sg-Level Customer Management with Bangladesh Market Focus
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { 
  Search, Filter, Download, RefreshCw, Eye, Edit, Mail, Phone, MapPin,
  Star, Heart, ShoppingBag, TrendingUp, TrendingDown, Users, Crown,
  MessageSquare, Clock, Calendar, Award, Target, Activity, Gift
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Bangladesh customer segments and data
const customerSegments = {
  vip: { label: 'VIP Customers', count: 127, color: 'bg-yellow-100 text-yellow-800', growth: 15.2 },
  loyal: { label: 'Loyal Customers', count: 892, color: 'bg-green-100 text-green-800', growth: 12.8 },
  regular: { label: 'Regular Customers', count: 2456, color: 'bg-blue-100 text-blue-800', growth: 8.5 },
  new: { label: 'New Customers', count: 567, color: 'bg-purple-100 text-purple-800', growth: 23.7 },
  inactive: { label: 'Inactive', count: 234, color: 'bg-gray-100 text-gray-800', growth: -5.2 },
  churned: { label: 'Churned', count: 89, color: 'bg-red-100 text-red-800', growth: -12.5 }
};

const sampleCustomers = [
  {
    id: 'CUST-2024-001',
    name: 'মোহাম্মদ আবদুল করিম',
    email: 'karim@email.com',
    phone: '+8801712345678',
    avatar: null,
    segment: 'vip',
    joinDate: new Date('2023-03-15'),
    lastOrder: new Date('2024-07-04'),
    totalOrders: 47,
    totalSpent: 185000,
    averageOrderValue: 3936,
    lifetimeValue: 198000,
    loyaltyPoints: 15420,
    address: {
      division: 'Dhaka',
      district: 'Dhaka',
      area: 'Dhanmondi',
      fullAddress: 'House 25, Road 7, Dhanmondi, Dhaka-1205'
    },
    preferences: {
      language: 'Bengali',
      paymentMethod: 'bKash',
      notifications: true,
      categories: ['Electronics', 'Fashion']
    },
    behavior: {
      loginFrequency: 'Daily',
      sessionDuration: 25,
      mobileApp: true,
      socialMedia: ['Facebook', 'WhatsApp']
    },
    demographics: {
      age: 32,
      gender: 'Male',
      occupation: 'Business',
      income: 'High'
    }
  },
  {
    id: 'CUST-2024-002',
    name: 'ফাতিমা খাতুন',
    email: 'fatima@email.com',
    phone: '+8801987654321',
    avatar: null,
    segment: 'loyal',
    joinDate: new Date('2023-08-22'),
    lastOrder: new Date('2024-07-03'),
    totalOrders: 28,
    totalSpent: 89500,
    averageOrderValue: 3196,
    lifetimeValue: 125000,
    loyaltyPoints: 8950,
    address: {
      division: 'Chittagong',
      district: 'Chittagong',
      area: 'Nasirabad',
      fullAddress: 'Flat 3B, Bay View Apartment, Nasirabad, Chittagong-4000'
    },
    preferences: {
      language: 'Bengali',
      paymentMethod: 'Nagad',
      notifications: true,
      categories: ['Fashion', 'Beauty', 'Home']
    },
    behavior: {
      loginFrequency: 'Weekly',
      sessionDuration: 18,
      mobileApp: true,
      socialMedia: ['Facebook']
    },
    demographics: {
      age: 28,
      gender: 'Female',
      occupation: 'Teacher',
      income: 'Medium'
    }
  },
  {
    id: 'CUST-2024-003',
    name: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    phone: '+8801555123456',
    avatar: null,
    segment: 'regular',
    joinDate: new Date('2024-01-10'),
    lastOrder: new Date('2024-07-02'),
    totalOrders: 12,
    totalSpent: 45600,
    averageOrderValue: 3800,
    lifetimeValue: 58000,
    loyaltyPoints: 4560,
    address: {
      division: 'Sylhet',
      district: 'Sylhet',
      area: 'Zindabazar',
      fullAddress: 'House 42, Zindabazar, Sylhet-3100'
    },
    preferences: {
      language: 'English',
      paymentMethod: 'Cash on Delivery',
      notifications: false,
      categories: ['Electronics', 'Sports']
    },
    behavior: {
      loginFrequency: 'Monthly',
      sessionDuration: 12,
      mobileApp: false,
      socialMedia: ['WhatsApp']
    },
    demographics: {
      age: 35,
      gender: 'Male',
      occupation: 'Engineer',
      income: 'High'
    }
  },
  {
    id: 'CUST-2024-004',
    name: 'নাদিয়া আক্তার',
    email: 'nadia@email.com',
    phone: '+8801777888999',
    avatar: null,
    segment: 'new',
    joinDate: new Date('2024-06-15'),
    lastOrder: new Date('2024-07-01'),
    totalOrders: 3,
    totalSpent: 12800,
    averageOrderValue: 4267,
    lifetimeValue: 18000,
    loyaltyPoints: 1280,
    address: {
      division: 'Khulna',
      district: 'Khulna',
      area: 'Sonadanga',
      fullAddress: 'Road 5, Sonadanga Residential Area, Khulna-9000'
    },
    preferences: {
      language: 'Bengali',
      paymentMethod: 'Rocket',
      notifications: true,
      categories: ['Beauty', 'Fashion']
    },
    behavior: {
      loginFrequency: 'Weekly',
      sessionDuration: 22,
      mobileApp: true,
      socialMedia: ['Facebook', 'Instagram']
    },
    demographics: {
      age: 25,
      gender: 'Female',
      occupation: 'Student',
      income: 'Low'
    }
  },
  {
    id: 'CUST-2024-005',
    name: 'Rafiqul Islam',
    email: 'rafiq@email.com',
    phone: '+8801333444555',
    avatar: null,
    segment: 'inactive',
    joinDate: new Date('2023-11-08'),
    lastOrder: new Date('2024-04-15'),
    totalOrders: 8,
    totalSpent: 23400,
    averageOrderValue: 2925,
    lifetimeValue: 28000,
    loyaltyPoints: 2340,
    address: {
      division: 'Rajshahi',
      district: 'Rajshahi',
      area: 'Shaheb Bazar',
      fullAddress: 'Lane 3, Shaheb Bazar, Rajshahi-6000'
    },
    preferences: {
      language: 'Bengali',
      paymentMethod: 'bKash',
      notifications: false,
      categories: ['Books', 'Electronics']
    },
    behavior: {
      loginFrequency: 'Rarely',
      sessionDuration: 8,
      mobileApp: false,
      socialMedia: []
    },
    demographics: {
      age: 45,
      gender: 'Male',
      occupation: 'Farmer',
      income: 'Low'
    }
  }
];

const customerAnalytics = {
  acquisition: [
    { month: 'Jan', organic: 234, social: 156, paid: 89, referral: 67 },
    { month: 'Feb', organic: 189, social: 134, paid: 78, referral: 45 },
    { month: 'Mar', organic: 298, social: 189, paid: 134, referral: 89 },
    { month: 'Apr', organic: 267, social: 167, paid: 123, referral: 78 },
    { month: 'May', organic: 324, social: 198, paid: 156, referral: 92 },
    { month: 'Jun', organic: 298, social: 178, paid: 145, referral: 87 },
    { month: 'Jul', organic: 345, social: 212, paid: 167, referral: 98 }
  ],
  retention: [
    { period: '0-30 days', percentage: 78, customers: 1245 },
    { period: '31-60 days', percentage: 65, customers: 892 },
    { period: '61-90 days', percentage: 52, customers: 567 },
    { period: '91-180 days', percentage: 42, customers: 378 },
    { period: '181-365 days', percentage: 35, customers: 234 },
    { period: '365+ days', percentage: 28, customers: 156 }
  ],
  lifetimeValue: [
    { segment: 'VIP', value: 450000, count: 127 },
    { segment: 'Loyal', value: 125000, count: 892 },
    { segment: 'Regular', value: 45000, count: 2456 },
    { segment: 'New', value: 18000, count: 567 }
  ]
};

const bangladeshMarketInsights = {
  divisions: [
    { name: 'Dhaka', customers: 2450, percentage: 52, avgSpend: 56000 },
    { name: 'Chittagong', customers: 1234, percentage: 26, avgSpend: 48000 },
    { name: 'Sylhet', customers: 456, percentage: 10, avgSpend: 52000 },
    { name: 'Khulna', customers: 298, percentage: 6, avgSpend: 43000 },
    { name: 'Rajshahi', customers: 189, percentage: 4, avgSpend: 38000 },
    { name: 'Others', customers: 95, percentage: 2, avgSpend: 35000 }
  ],
  languages: [
    { language: 'Bengali', percentage: 78, customers: 3672 },
    { language: 'English', percentage: 18, customers: 847 },
    { language: 'Hindi', percentage: 3, customers: 141 },
    { language: 'Arabic', percentage: 1, customers: 47 }
  ],
  paymentPreferences: [
    { method: 'bKash', percentage: 42, customers: 1976 },
    { method: 'Nagad', percentage: 28, customers: 1318 },
    { method: 'Cash on Delivery', percentage: 15, customers: 706 },
    { method: 'Rocket', percentage: 12, customers: 565 },
    { method: 'Card Payment', percentage: 3, customers: 141 }
  ]
};

export function CustomerDatabase() {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('lastOrder');
  const [filterRegion, setFilterRegion] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('database');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bn-BD').format(num);
  };

  const getSegmentBadge = (segment: string) => {
    const segmentInfo = customerSegments[segment as keyof typeof customerSegments];
    return (
      <Badge className={segmentInfo?.color || 'bg-gray-100 text-gray-800'}>
        {segmentInfo?.label || segment}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredCustomers = sampleCustomers.filter(customer => {
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === 'all' || customer.address.division === filterRegion;
    return matchesSegment && matchesSearch && matchesRegion;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on customers:`, selectedCustomers);
    setSelectedCustomers([]);
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    setSelectedCustomers(
      selectedCustomers.length === filteredCustomers.length 
        ? []
        : filteredCustomers.map(customer => customer.id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive customer relationship management with Bangladesh market insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} disabled={refreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Customer Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(customerSegments).map(([segment, info]) => (
          <Card 
            key={segment}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSegment === segment ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedSegment(selectedSegment === segment ? 'all' : segment)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(info.count)}</div>
              <div className={`text-xs font-medium mt-1 ${info.color.split(' ')[1]}`}>
                {info.label}
              </div>
              <div className={`text-xs mt-1 ${info.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {info.growth > 0 ? '+' : ''}{info.growth}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database">Customer Database</TabsTrigger>
          <TabsTrigger value="analytics">Customer Analytics</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="insights">Bangladesh Insights</TabsTrigger>
        </TabsList>

        {/* Customer Database Tab */}
        <TabsContent value="database" className="space-y-6">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, phone, or customer ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastOrder">Last Order</SelectItem>
                      <SelectItem value="totalSpent">Total Spent</SelectItem>
                      <SelectItem value="joinDate">Join Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterRegion} onValueChange={setFilterRegion}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Region..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="Dhaka">Dhaka</SelectItem>
                      <SelectItem value="Chittagong">Chittagong</SelectItem>
                      <SelectItem value="Sylhet">Sylhet</SelectItem>
                      <SelectItem value="Khulna">Khulna</SelectItem>
                      <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedCustomers.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedCustomers.length} customer(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('segment')}>
                      <Users className="h-4 w-4 mr-2" />
                      Change Segment
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customers ({formatNumber(filteredCustomers.length)})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onCheckedChange={selectAllCustomers}
                  />
                  <span className="text-sm text-gray-500">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Checkbox 
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => toggleCustomerSelection(customer.id)}
                        />
                        
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.avatar || ''} alt={customer.name} />
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          {/* Customer Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h3 className="font-bold text-lg">{customer.name}</h3>
                                <p className="text-sm text-gray-500">{customer.id}</p>
                              </div>
                              {getSegmentBadge(customer.segment)}
                              {customer.segment === 'vip' && <Crown className="h-5 w-5 text-yellow-500" />}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{formatCurrency(customer.totalSpent)}</div>
                              <div className="text-sm text-gray-500">
                                Total Spent • {formatNumber(customer.totalOrders)} orders
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{customer.address.area}, {customer.address.division}</span>
                            </div>
                          </div>

                          {/* Customer Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Joined</div>
                                <div className="text-gray-500">{format(customer.joinDate, 'MMM yyyy')}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Last Order</div>
                                <div className="text-gray-500">{formatDistanceToNow(customer.lastOrder)} ago</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">CLV</div>
                                <div className="text-gray-500">{formatCurrency(customer.lifetimeValue)}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Gift className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Loyalty Points</div>
                                <div className="text-gray-500">{formatNumber(customer.loyaltyPoints)}</div>
                              </div>
                            </div>
                          </div>

                          {/* Preferences */}
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Language:</span>
                              <Badge variant="outline">{customer.preferences.language}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Payment:</span>
                              <Badge variant="outline">{customer.preferences.paymentMethod}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Categories:</span>
                              {customer.preferences.categories.slice(0, 2).map(cat => (
                                <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Customer Profile: {customer.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Personal Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Name: {customer.name}</div>
                                    <div>Email: {customer.email}</div>
                                    <div>Phone: {customer.phone}</div>
                                    <div>Age: {customer.demographics.age}</div>
                                    <div>Gender: {customer.demographics.gender}</div>
                                    <div>Occupation: {customer.demographics.occupation}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Address Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div>{customer.address.fullAddress}</div>
                                    <div>{customer.address.district}, {customer.address.division}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Purchase Statistics</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Total Orders: {formatNumber(customer.totalOrders)}</div>
                                    <div>Total Spent: {formatCurrency(customer.totalSpent)}</div>
                                    <div>Average Order Value: {formatCurrency(customer.averageOrderValue)}</div>
                                    <div>Lifetime Value: {formatCurrency(customer.lifetimeValue)}</div>
                                    <div>Loyalty Points: {formatNumber(customer.loyaltyPoints)}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Behavior & Preferences</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Login Frequency: {customer.behavior.loginFrequency}</div>
                                    <div>Avg Session: {customer.behavior.sessionDuration} minutes</div>
                                    <div>Mobile App User: {customer.behavior.mobileApp ? 'Yes' : 'No'}</div>
                                    <div>Preferred Language: {customer.preferences.language}</div>
                                    <div>Preferred Payment: {customer.preferences.paymentMethod}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerAnalytics.acquisition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="organic" stackId="a" fill="#1677ff" name="Organic" />
                    <Bar dataKey="social" stackId="a" fill="#52c41a" name="Social" />
                    <Bar dataKey="paid" stackId="a" fill="#faad14" name="Paid Ads" />
                    <Bar dataKey="referral" stackId="a" fill="#f759ab" name="Referral" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Retention Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerAnalytics.retention.map((period) => (
                    <div key={period.period} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{period.period}</span>
                        <div className="text-right">
                          <span className="font-bold">{period.percentage}%</span>
                          <span className="text-sm text-gray-500 ml-2">({formatNumber(period.customers)})</span>
                        </div>
                      </div>
                      <Progress value={period.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lifetime Value Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Lifetime Value by Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {customerAnalytics.lifetimeValue.map((segment) => (
                  <div key={segment.segment} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(segment.value)}</div>
                    <div className="text-sm text-gray-600 mt-1">{segment.segment} Customers</div>
                    <div className="text-xs text-gray-500 mt-1">{formatNumber(segment.count)} customers</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segment Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(customerSegments).map(([key, info]) => ({
                        name: info.label,
                        value: info.count,
                        color: info.color.includes('yellow') ? '#faad14' : 
                               info.color.includes('green') ? '#52c41a' :
                               info.color.includes('blue') ? '#1677ff' :
                               info.color.includes('purple') ? '#722ed1' :
                               info.color.includes('red') ? '#f5222d' : '#d9d9d9'
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {Object.entries(customerSegments).map(([key, info], index) => (
                        <Cell key={`cell-${index}`} fill={
                          info.color.includes('yellow') ? '#faad14' : 
                          info.color.includes('green') ? '#52c41a' :
                          info.color.includes('blue') ? '#1677ff' :
                          info.color.includes('purple') ? '#722ed1' :
                          info.color.includes('red') ? '#f5222d' : '#d9d9d9'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Segment Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Segment Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(customerSegments).map(([key, info]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          info.color.includes('yellow') ? 'bg-yellow-400' : 
                          info.color.includes('green') ? 'bg-green-400' :
                          info.color.includes('blue') ? 'bg-blue-400' :
                          info.color.includes('purple') ? 'bg-purple-400' :
                          info.color.includes('red') ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{info.label}</div>
                          <div className="text-sm text-gray-500">{formatNumber(info.count)} customers</div>
                        </div>
                      </div>
                      <div className={`text-right ${info.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center">
                          {info.growth > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="font-bold">{info.growth > 0 ? '+' : ''}{info.growth}%</span>
                        </div>
                        <div className="text-sm text-gray-500">This month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bangladesh Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Customer Distribution by Division
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bangladeshMarketInsights.divisions.map((division) => (
                    <div key={division.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{division.name}</span>
                      <div className="flex items-center space-x-2 flex-1 mx-4">
                        <Progress value={division.percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 w-12">{division.percentage}%</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatNumber(division.customers)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(division.avgSpend)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Language Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bangladeshMarketInsights.languages.map((lang) => (
                    <div key={lang.language} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{lang.language}</span>
                        <div className="text-right">
                          <span className="font-bold">{lang.percentage}%</span>
                          <span className="text-sm text-gray-500 ml-2">({formatNumber(lang.customers)})</span>
                        </div>
                      </div>
                      <Progress value={lang.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {bangladeshMarketInsights.paymentPreferences.map((method) => (
                  <div key={method.method} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{method.percentage}%</div>
                    <div className="text-sm text-gray-600 mt-1">{method.method}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatNumber(method.customers)} customers</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomerDatabase;