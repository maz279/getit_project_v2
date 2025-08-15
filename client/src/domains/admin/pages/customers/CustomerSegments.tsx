/**
 * Customer Segments - Customer segmentation and targeting
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  Users, Plus, Edit, Filter, Target, TrendingUp, Mail, Gift,
  ShoppingBag, DollarSign, Calendar, MapPin, BarChart3, PieChart,
  AlertCircle, Settings, Download, Tag, UserCheck, Clock
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { Switch } from '@/shared/ui/switch';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import {
  PieChart as RechartsChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// Sample segments data
const segmentsData = [
  {
    id: 'SEG001',
    name: 'VIP Customers',
    description: 'High-value customers with lifetime value > BDT 2L',
    customers: 456,
    avgOrderValue: 'BDT 12,450',
    totalRevenue: 'BDT 56.8L',
    growthRate: '+23%',
    criteria: ['Total Spent > BDT 2,00,000', 'Order Frequency > 5/month', 'Active in last 30 days'],
    tags: ['high_value', 'frequent_buyer'],
    color: '#8B5CF6',
    status: 'active'
  },
  {
    id: 'SEG002',
    name: 'Frequent Shoppers',
    description: 'Customers who shop at least 3 times per month',
    customers: 2345,
    avgOrderValue: 'BDT 5,670',
    totalRevenue: 'BDT 1.3Cr',
    growthRate: '+15%',
    criteria: ['Order Frequency >= 3/month', 'Active in last 60 days'],
    tags: ['loyal', 'engaged'],
    color: '#3B82F6',
    status: 'active'
  },
  {
    id: 'SEG003',
    name: 'New Customers',
    description: 'Customers who joined in the last 30 days',
    customers: 1234,
    avgOrderValue: 'BDT 3,450',
    totalRevenue: 'BDT 42.5L',
    growthRate: '+45%',
    criteria: ['Account Age < 30 days', 'First Purchase Made'],
    tags: ['new', 'onboarding'],
    color: '#10B981',
    status: 'active'
  },
  {
    id: 'SEG004',
    name: 'At Risk',
    description: 'Previously active customers who haven\'t ordered in 60+ days',
    customers: 890,
    avgOrderValue: 'BDT 4,890',
    totalRevenue: 'BDT 0',
    growthRate: '-100%',
    criteria: ['Last Order > 60 days', 'Previous Order Count > 3'],
    tags: ['at_risk', 'win_back'],
    color: '#F59E0B',
    status: 'active'
  },
  {
    id: 'SEG005',
    name: 'Electronics Enthusiasts',
    description: 'Customers who primarily buy electronics',
    customers: 3456,
    avgOrderValue: 'BDT 15,670',
    totalRevenue: 'BDT 5.4Cr',
    growthRate: '+18%',
    criteria: ['Electronics Orders > 70%', 'Total Spent > BDT 50,000'],
    tags: ['category_electronics', 'tech_savvy'],
    color: '#EF4444',
    status: 'active'
  }
];

// Segment distribution data
const segmentDistribution = [
  { name: 'VIP Customers', value: 456, percentage: 3 },
  { name: 'Frequent Shoppers', value: 2345, percentage: 15 },
  { name: 'Regular Customers', value: 8765, percentage: 58 },
  { name: 'New Customers', value: 1234, percentage: 8 },
  { name: 'At Risk', value: 890, percentage: 6 },
  { name: 'Inactive', value: 1544, percentage: 10 }
];

// Segment performance data
const segmentPerformance = [
  { segment: 'VIP', revenue: 568, orders: 3456, aov: 12450 },
  { segment: 'Frequent', revenue: 1300, orders: 22940, aov: 5670 },
  { segment: 'Regular', revenue: 2100, orders: 61355, aov: 3425 },
  { segment: 'New', revenue: 425, orders: 1232, aov: 3450 },
  { segment: 'At Risk', revenue: 0, orders: 0, aov: 0 }
];

const CustomerSegments = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSegmentDetails, setShowSegmentDetails] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    criteriaType: 'all',
    criteria: []
  });

  const criteriaOptions = [
    { category: 'Purchase Behavior', options: [
      'Total Spent', 'Order Count', 'Average Order Value', 'Order Frequency'
    ]},
    { category: 'Customer Activity', options: [
      'Last Order Date', 'Account Age', 'Last Login', 'Page Views'
    ]},
    { category: 'Demographics', options: [
      'Location', 'Age Group', 'Gender', 'Language Preference'
    ]},
    { category: 'Product Preferences', options: [
      'Category Preference', 'Brand Preference', 'Price Range', 'Payment Method'
    ]}
  ];

  return (
    <AdminLayout
      currentPage="Customer Segments"
      breadcrumbItems={[
        { label: 'Customers', href: '/admin/customers' },
        { label: 'Customer Segments' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Customer Segmentation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage customer segments for targeted marketing
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Segments
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Segment
            </Button>
          </div>
        </div>

        {/* Segment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-gray-500 mt-1">Active segments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Segmented Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">13,234</div>
              <p className="text-xs text-gray-500 mt-1">87% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Segment Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT 4.8Cr</div>
              <p className="text-xs text-green-600 mt-1">+18% vs last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Campaigns Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500 mt-1">Targeting segments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Segments List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Manage your customer segments and targeting rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentsData.map((segment) => (
                    <div 
                      key={segment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setSelectedSegment(segment);
                        setShowSegmentDetails(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${segment.color}20` }}
                          >
                            <Users className="w-5 h-5" style={{ color: segment.color }} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {segment.name}
                              {segment.status === 'active' && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {segment.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{segment.customers}</div>
                          <div className="text-sm text-gray-500">customers</div>
                          <div className="text-xs text-green-600 font-medium mt-1">
                            {segment.growthRate}
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Avg Order Value:</span>
                          <p className="font-medium">{segment.avgOrderValue}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Revenue:</span>
                          <p className="font-medium">{segment.totalRevenue}</p>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation();
                          }}>
                            <Mail className="w-4 h-4 mr-2" />
                            Campaign
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Segment Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>Revenue contribution by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={segmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (Lakhs)" />
                    <Bar dataKey="aov" fill="#10B981" name="AOV (BDT)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Segment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>Breakdown by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsChart>
                    <Pie
                      data={segmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {segmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  {segmentDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'][index] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Create Targeted Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Segment Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Gift className="w-4 h-4 mr-2" />
                  Send Segment Offers
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Automation Rules
                </Button>
              </CardContent>
            </Card>

            {/* Win-Back Alert */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>890 customers at risk!</strong> Consider launching a win-back campaign for customers who haven't ordered in 60+ days.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Create Segment Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Customer Segment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="segment-name">Segment Name *</Label>
                <Input 
                  id="segment-name"
                  placeholder="e.g., High-Value Fashion Buyers"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({...newSegment, name: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="segment-description">Description</Label>
                <Textarea 
                  id="segment-description"
                  placeholder="Describe the segment and its purpose..."
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({...newSegment, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Criteria Logic</Label>
                <RadioGroup 
                  value={newSegment.criteriaType} 
                  onValueChange={(value) => setNewSegment({...newSegment, criteriaType: value})}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">Match ALL criteria (AND)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="any" />
                    <Label htmlFor="any">Match ANY criteria (OR)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Segment Criteria</Label>
                <div className="space-y-4 mt-3">
                  {criteriaOptions.map((group) => (
                    <div key={group.category}>
                      <h4 className="font-medium text-sm mb-2">{group.category}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {group.options.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox id={option} />
                            <Label htmlFor={option} className="font-normal text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertDescription>
                  Based on current criteria, approximately <strong>2,345 customers</strong> will be included in this segment.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button>Create Segment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Segment Details Dialog */}
        <Dialog open={showSegmentDetails} onOpenChange={setShowSegmentDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Segment Details</DialogTitle>
            </DialogHeader>
            {selectedSegment && (
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="criteria">Criteria</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Segment Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedSegment.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span>Jun 15, 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span>Jun 28, 2024</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Customers:</span>
                          <span className="font-medium">{selectedSegment.customers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Order Value:</span>
                          <span className="font-medium">{selectedSegment.avgOrderValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Revenue:</span>
                          <span className="font-medium">{selectedSegment.totalRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Growth Rate:</span>
                          <span className="font-medium text-green-600">{selectedSegment.growthRate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Segment Description</h4>
                    <p className="text-sm text-gray-600">{selectedSegment.description}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Segment
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="criteria">
                  <div className="space-y-4">
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        Customers must match ALL of the following criteria to be included in this segment.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      {selectedSegment.criteria.map((criterion: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Filter className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{criterion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="customers">
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Customer list view would be displayed here</p>
                  </div>
                </TabsContent>

                <TabsContent value="campaigns">
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Campaign history would be displayed here</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CustomerSegments;