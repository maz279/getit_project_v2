import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, Eye, Star, 
  TrendingUp, Users, Filter, Search, Download, Bell,
  Shield, Flag, Zap, Target, Award, BarChart3, Settings,
  MessageSquare, Image, FileText, Calendar, User
} from 'lucide-react';

export const ProductModerationOverview: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const moderationStats = {
    pending: 127,
    approved: 856,
    rejected: 43,
    flagged: 15,
    reviewTime: 2.4,
    accuracy: 98.5,
    escalated: 8
  };

  const pendingProducts = [
    {
      id: 'PRD-2024-1001',
      name: 'Samsung Galaxy S24 Ultra 256GB',
      vendor: 'Tech Solutions BD',
      category: 'Electronics > Mobile Phones',
      price: '৳125,000',
      submittedAt: '2024-07-05 10:30:00',
      priority: 'high',
      flags: ['price-verification', 'image-quality'],
      score: 85,
      status: 'pending-review'
    },
    {
      id: 'PRD-2024-1002',
      name: 'Premium Cotton Saree Collection',
      vendor: 'Heritage Fashion BD',
      category: 'Fashion > Women > Traditional',
      price: '৳3,500',
      submittedAt: '2024-07-05 09:15:00',
      priority: 'medium',
      flags: ['content-review'],
      score: 92,
      status: 'content-review'
    },
    {
      id: 'PRD-2024-1003',
      name: 'Organic Honey 500g',
      vendor: 'Natural Products BD',
      category: 'Food & Beverages > Organic',
      price: '৳850',
      submittedAt: '2024-07-05 08:45:00',
      priority: 'low',
      flags: ['certification-check'],
      score: 95,
      status: 'quality-check'
    }
  ];

  const recentActions = [
    {
      id: 1,
      action: 'Approved',
      product: 'iPhone 15 Pro Max',
      moderator: 'Rashida Ahmed',
      time: '5 minutes ago',
      type: 'approval'
    },
    {
      id: 2,
      action: 'Rejected',
      product: 'Fake Designer Bag',
      moderator: 'Karim Hassan',
      time: '12 minutes ago',
      type: 'rejection',
      reason: 'Counterfeit product'
    },
    {
      id: 3,
      action: 'Flagged',
      product: 'Miracle Weight Loss Pills',
      moderator: 'Automated System',
      time: '25 minutes ago',
      type: 'flag',
      reason: 'Misleading claims'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-review': return 'bg-orange-100 text-orange-800';
      case 'content-review': return 'bg-blue-100 text-blue-800';
      case 'quality-check': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Moderation Center</h1>
          <p className="text-gray-600 mt-2">Amazon.com/Shopee.sg-level product quality management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bell className="h-4 w-4 mr-2" />
            View Alerts
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>High Priority:</strong> 15 products flagged for urgent review. 
          <Button variant="link" className="p-0 ml-2 text-orange-800 underline">
            Review Now →
          </Button>
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{moderationStats.pending}</div>
            <p className="text-xs text-muted-foreground">+23 since yesterday</p>
            <Progress value={65} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved (24h)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{moderationStats.approved}</div>
            <p className="text-xs text-muted-foreground">98.5% accuracy rate</p>
            <Progress value={98} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{moderationStats.rejected}</div>
            <p className="text-xs text-muted-foreground">Need vendor revision</p>
            <Progress value={15} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{moderationStats.reviewTime}h</div>
            <p className="text-xs text-muted-foreground">Target: {"< 2.5h"}</p>
            <Progress value={85} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending Queue</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Advanced Filtering and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filtering & Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <Label htmlFor="search">Search Products</Label>
                  <Input id="search" placeholder="Product name, ID, vendor..." />
                </div>
                <div>
                  <Label htmlFor="status">Status Filter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="content-review">Content Review</SelectItem>
                      <SelectItem value="quality-check">Quality Check</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority Filter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="select-all" />
                  <Label htmlFor="select-all">Select All ({pendingProducts.length})</Label>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Bulk Approve</Button>
                  <Button variant="outline" size="sm">Bulk Reject</Button>
                  <Button variant="outline" size="sm">Assign Reviewer</Button>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Review Queue */}
          <div className="space-y-4">
            {pendingProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Information */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox />
                        <h4 className="font-bold text-xl">{product.name}</h4>
                        <Badge className={getPriorityColor(product.priority)}>
                          {product.priority}
                        </Badge>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div><strong>Product ID:</strong> {product.id}</div>
                        <div><strong>Vendor:</strong> {product.vendor}</div>
                        <div><strong>Category:</strong> {product.category}</div>
                        <div><strong>Price:</strong> {product.price}</div>
                        <div><strong>Submitted:</strong> {product.submittedAt}</div>
                        <div className="flex items-center">
                          <strong className="mr-2">Quality Score:</strong>
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-bold text-yellow-600">{product.score}/100</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.flags.map((flag, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            <Flag className="h-3 w-3 mr-1" />
                            {flag}
                          </Badge>
                        ))}
                      </div>

                      {/* Review Notes */}
                      <div className="mt-4">
                        <Label htmlFor={`notes-${product.id}`}>Review Notes</Label>
                        <Textarea 
                          id={`notes-${product.id}`}
                          placeholder="Add review comments, feedback, or recommendations..."
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Review Actions */}
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h5 className="font-semibold mb-3">Quick Review Actions</h5>
                        <div className="space-y-2">
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Instantly
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Detailed Review
                          </Button>
                          <Button size="sm" variant="outline" className="w-full text-red-600 border-red-300">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Product
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            <Flag className="h-4 w-4 mr-2" />
                            Escalate Issue
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h5 className="font-semibold mb-3">Assign Reviewer</h5>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Reviewer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reviewer1">Rashida Ahmed (Electronics)</SelectItem>
                            <SelectItem value="reviewer2">Karim Hassan (Fashion)</SelectItem>
                            <SelectItem value="reviewer3">Fatima Khan (General)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" className="w-full mt-2">Assign</Button>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h5 className="font-semibold mb-3">Priority Level</h5>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={product.priority} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          {/* Flag Management Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical Flags</p>
                    <p className="text-2xl font-bold text-red-600">8</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Policy Violations</p>
                    <p className="text-2xl font-bold text-orange-600">15</p>
                  </div>
                  <Flag className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-yellow-600">23</p>
                  </div>
                  <Eye className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolved Today</p>
                    <p className="text-2xl font-bold text-blue-600">45</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flag Creation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Flag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="product-search">Product Search</Label>
                  <Input id="product-search" placeholder="Search by product ID, name, or vendor..." />
                </div>
                <div>
                  <Label htmlFor="flag-type">Flag Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flag type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counterfeit">Counterfeit Product</SelectItem>
                      <SelectItem value="misleading">Misleading Description</SelectItem>
                      <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                      <SelectItem value="copyright">Copyright Violation</SelectItem>
                      <SelectItem value="safety">Safety Concern</SelectItem>
                      <SelectItem value="pricing">Pricing Issue</SelectItem>
                      <SelectItem value="quality">Quality Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="flag-description">Flag Description</Label>
                <Textarea 
                  id="flag-description" 
                  placeholder="Provide detailed description of the issue..."
                  className="mt-1"
                />
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-remove" />
                  <Label htmlFor="auto-remove">Auto-remove product upon flag</Label>
                </div>
                <Button>Create Flag</Button>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Flagged Products Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Flag Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">iPhone 15 Pro Clone</p>
                        <p className="text-sm text-gray-500">PRD-2024-2001</p>
                      </div>
                    </TableCell>
                    <TableCell>Tech Deals BD</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Counterfeit</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>
                    </TableCell>
                    <TableCell>2024-07-05</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm" variant="destructive">Remove</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Miracle Weight Loss Pills</p>
                        <p className="text-sm text-gray-500">PRD-2024-2002</p>
                      </div>
                    </TableCell>
                    <TableCell>Health Solutions</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Misleading Claims</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">Escalated</Badge>
                    </TableCell>
                    <TableCell>2024-07-04</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm" variant="destructive">Remove</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Escalation Management */}
          <Card>
            <CardHeader>
              <CardTitle>Escalation Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Escalate Flag</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="escalate-product">Product ID</Label>
                      <Input id="escalate-product" placeholder="Enter product ID" />
                    </div>
                    <div>
                      <Label htmlFor="escalate-to">Escalate To</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select escalation level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="senior-moderator">Senior Moderator</SelectItem>
                          <SelectItem value="legal-team">Legal Team</SelectItem>
                          <SelectItem value="compliance-officer">Compliance Officer</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="escalation-reason">Escalation Reason</Label>
                      <Textarea 
                        id="escalation-reason" 
                        placeholder="Explain why this requires escalation..."
                      />
                    </div>
                    <Button className="w-full">Escalate Issue</Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Bulk Flag Actions</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bulk-action">Select Action</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose bulk action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resolve-all">Resolve All Selected</SelectItem>
                          <SelectItem value="escalate-all">Escalate All Selected</SelectItem>
                          <SelectItem value="remove-all">Remove All Products</SelectItem>
                          <SelectItem value="assign-reviewer">Assign to Reviewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bulk-notes">Action Notes</Label>
                      <Textarea 
                        id="bulk-notes" 
                        placeholder="Add notes for bulk action..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">Preview Changes</Button>
                      <Button className="flex-1">Execute Action</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flag Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Flag Analytics & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-semibold">Most Common Flag</h5>
                  <p className="text-2xl font-bold text-red-600 mt-2">Counterfeit Products</p>
                  <p className="text-sm text-gray-500">35% of all flags</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-semibold">Average Resolution Time</h5>
                  <p className="text-2xl font-bold text-blue-600 mt-2">4.2 hours</p>
                  <p className="text-sm text-gray-500">-15% from last week</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h5 className="font-semibold">Flag Accuracy Rate</h5>
                  <p className="text-2xl font-bold text-green-600 mt-2">92.8%</p>
                  <p className="text-sm text-gray-500">+2.3% improvement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Dashboard Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="quarter">Last 3 months</SelectItem>
                      <SelectItem value="year">Last 12 months</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="moderator-filter">Moderator</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Moderators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Moderators</SelectItem>
                      <SelectItem value="rashida">Rashida Ahmed</SelectItem>
                      <SelectItem value="karim">Karim Hassan</SelectItem>
                      <SelectItem value="fatima">Fatima Khan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-filter">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="food">Food & Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                    <p className="text-xs text-green-500">+2.3% from last month</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={94} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Review Time</p>
                    <p className="text-2xl font-bold text-blue-600">2.4h</p>
                    <p className="text-xs text-blue-500">-0.3h improvement</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={85} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-purple-600">98.5%</p>
                    <p className="text-xs text-purple-500">+1.2% this week</p>
                  </div>
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={98} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Escalation Rate</p>
                    <p className="text-2xl font-bold text-orange-600">5.8%</p>
                    <p className="text-xs text-red-500">+1.1% increase</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
                <Progress value={6} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">This Week vs Last Week</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Products Reviewed</p>
                        <p className="text-xl font-bold">1,247 <span className="text-sm text-green-500">(+12%)</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Approvals</p>
                        <p className="text-xl font-bold">1,175 <span className="text-sm text-green-500">(+15%)</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rejections</p>
                        <p className="text-xl font-bold">62 <span className="text-sm text-red-500">(-8%)</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Flags Created</p>
                        <p className="text-xl font-bold">28 <span className="text-sm text-orange-500">(+5%)</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Category Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Electronics</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={95} className="w-20 h-2" />
                          <span className="text-sm font-medium">95%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fashion</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={92} className="w-20 h-2" />
                          <span className="text-sm font-medium">92%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Food & Beverages</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={88} className="w-20 h-2" />
                          <span className="text-sm font-medium">88%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentActions.map((action) => (
                    <div key={action.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="mt-1">
                        {action.type === 'approval' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {action.type === 'rejection' && <XCircle className="h-4 w-4 text-red-500" />}
                        {action.type === 'flag' && <Flag className="h-4 w-4 text-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.action}: {action.product}</p>
                        <p className="text-xs text-gray-500">{action.moderator} • {action.time}</p>
                        {action.reason && <p className="text-xs text-gray-600 mt-1">Reason: {action.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Report Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input id="report-name" placeholder="Enter report name..." />
                  </div>
                  <div>
                    <Label htmlFor="metrics">Select Metrics</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="approval-rate" />
                        <Label htmlFor="approval-rate" className="text-sm">Approval Rate</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="review-time" />
                        <Label htmlFor="review-time" className="text-sm">Review Time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quality-score" />
                        <Label htmlFor="quality-score" className="text-sm">Quality Score</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="escalation-rate" />
                        <Label htmlFor="escalation-rate" className="text-sm">Escalation Rate</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="groupby">Group By</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="priority">Priority Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">Preview Report</Button>
                    <Button className="flex-1">Generate & Save</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="alert-name">Alert Name</Label>
                    <Input id="alert-name" placeholder="e.g., Low Approval Rate Alert" />
                  </div>
                  <div>
                    <Label htmlFor="metric-type">Metric to Monitor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approval-rate">Approval Rate</SelectItem>
                        <SelectItem value="review-time">Average Review Time</SelectItem>
                        <SelectItem value="quality-score">Quality Score</SelectItem>
                        <SelectItem value="escalation-rate">Escalation Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="threshold">Threshold</Label>
                      <Input id="threshold" placeholder="e.g., 90" />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="below">Below</SelectItem>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notification-method">Notification Method</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="email-alert" />
                        <Label htmlFor="email-alert" className="text-sm">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sms-alert" />
                        <Label htmlFor="sms-alert" className="text-sm">SMS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dashboard-alert" />
                        <Label htmlFor="dashboard-alert" className="text-sm">Dashboard</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="slack-alert" />
                        <Label htmlFor="slack-alert" className="text-sm">Slack</Label>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Create Alert</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Moderation Rules Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Automated Moderation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Quality Score Thresholds</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-approve">Auto-approve score threshold</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" defaultValue="90" className="w-20" />
                        <span className="text-sm text-gray-500">/ 100</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reject">Auto-reject score threshold</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" defaultValue="40" className="w-20" />
                        <span className="text-sm text-gray-500">/ 100</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="flag-threshold">Auto-flag score threshold</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" defaultValue="60" className="w-20" />
                        <span className="text-sm text-gray-500">/ 100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Automation Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-auto-approve">Enable auto-approval</Label>
                      <Switch id="enable-auto-approve" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-auto-reject">Enable auto-rejection</Label>
                      <Switch id="enable-auto-reject" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-auto-flag">Enable auto-flagging</Label>
                      <Switch id="enable-auto-flag" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-manual-review">Require manual review for high-value items</Label>
                      <Switch id="require-manual-review" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <Button>Save Automation Settings</Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Filtering Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Content Filtering & Policy Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Prohibited Keywords</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="forbidden-words">Banned Words/Phrases</Label>
                      <Textarea 
                        id="forbidden-words"
                        placeholder="Enter prohibited words or phrases, one per line..."
                        defaultValue="counterfeit&#10;fake&#10;replica&#10;unauthorized copy&#10;miracle cure&#10;guaranteed weight loss"
                        className="h-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="flagged-words">Words Requiring Review</Label>
                      <Textarea 
                        id="flagged-words"
                        placeholder="Enter words that trigger manual review..."
                        defaultValue="medical&#10;therapeutic&#10;clinical&#10;prescription&#10;professional grade"
                        className="h-24"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Price Validation Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="max-price-variation">Max price variation from market</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" defaultValue="30" className="flex-1" />
                        <span className="text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="min-price-threshold">Minimum price threshold</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">৳</span>
                        <Input type="number" defaultValue="50" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="high-value-threshold">High-value review threshold</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">৳</span>
                        <Input type="number" defaultValue="100000" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Image Validation Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Minimum image resolution</Label>
                        <Select defaultValue="800x600">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="640x480">640x480</SelectItem>
                            <SelectItem value="800x600">800x600</SelectItem>
                            <SelectItem value="1024x768">1024x768</SelectItem>
                            <SelectItem value="1920x1080">1920x1080</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Maximum file size</Label>
                        <Select defaultValue="5mb">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2mb">2 MB</SelectItem>
                            <SelectItem value="5mb">5 MB</SelectItem>
                            <SelectItem value="10mb">10 MB</SelectItem>
                            <SelectItem value="20mb">20 MB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Enable AI content detection</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require watermark removal</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Check for duplicate images</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <Button>Save Content Rules</Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Assignment Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Reviewer Assignment & Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Assignment Rules</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="assignment-method">Assignment Method</Label>
                      <Select defaultValue="round-robin">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round-robin">Round Robin</SelectItem>
                          <SelectItem value="expertise-based">Expertise Based</SelectItem>
                          <SelectItem value="workload-balanced">Workload Balanced</SelectItem>
                          <SelectItem value="manual">Manual Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="max-concurrent">Max concurrent reviews per moderator</Label>
                      <Input type="number" defaultValue="25" />
                    </div>
                    <div>
                      <Label htmlFor="escalation-time">Auto-escalation time (hours)</Label>
                      <Input type="number" defaultValue="24" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category Specialists</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Electronics → Rashida Ahmed</span>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Fashion → Karim Hassan</span>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Food & Beverages → Fatima Khan</span>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Workflow Settings</h4>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Require secondary review for rejections</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Enable reviewer comments requirement</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto-notify vendors on status change</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Enable review time tracking</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-sla">Review SLA (hours)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Input type="number" defaultValue="2" placeholder="Standard" />
                          <span className="text-xs text-gray-500">Standard</span>
                        </div>
                        <div>
                          <Input type="number" defaultValue="1" placeholder="High Priority" />
                          <span className="text-xs text-gray-500">High Priority</span>
                        </div>
                        <div>
                          <Input type="number" defaultValue="0.5" placeholder="Critical" />
                          <span className="text-xs text-gray-500">Critical</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <Button>Save Workflow Settings</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification & Alert Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">System Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Queue backlog alerts</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>SLA breach warnings</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Quality score drops</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>High-priority item alerts</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Escalation Notifications</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="escalation-email">Escalation Email Recipients</Label>
                      <Textarea 
                        id="escalation-email"
                        placeholder="Enter email addresses, one per line..."
                        className="h-20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="alert-frequency">Alert Frequency</Label>
                      <Select defaultValue="immediate">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="hourly">Hourly Digest</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <Button>Save Notification Settings</Button>
              </div>
            </CardContent>
          </Card>

          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">API Integration Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="ai-service">AI Analysis Service</Label>
                      <Select defaultValue="openai">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                          <SelectItem value="google">Google Cloud AI</SelectItem>
                          <SelectItem value="aws">AWS Comprehend</SelectItem>
                          <SelectItem value="custom">Custom Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="image-analysis">Image Analysis Provider</Label>
                      <Select defaultValue="google-vision">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google-vision">Google Vision AI</SelectItem>
                          <SelectItem value="aws-rekognition">AWS Rekognition</SelectItem>
                          <SelectItem value="azure-computer-vision">Azure Computer Vision</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable real-time analysis</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="batch-size">Processing batch size</Label>
                      <Input type="number" defaultValue="50" />
                    </div>
                    <div>
                      <Label htmlFor="cache-duration">Cache duration (minutes)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div>
                      <Label htmlFor="retry-attempts">Max retry attempts</Label>
                      <Input type="number" defaultValue="3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable performance monitoring</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t flex space-x-2">
                <Button>Save Configuration</Button>
                <Button variant="outline">Reset to Defaults</Button>
                <Button variant="outline">Export Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {/* Team Overview Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Moderators</p>
                    <p className="text-2xl font-bold text-blue-600">12</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Performance</p>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                  </div>
                  <Award className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews Today</p>
                    <p className="text-2xl font-bold text-purple-600">1,247</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Training Due</p>
                    <p className="text-2xl font-bold text-orange-600">3</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Member Management */}
          <Card>
            <CardHeader>
              <CardTitle>Team Member Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <Input placeholder="Search team members..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Add New Moderator
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moderator</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Reviews Today</TableHead>
                    <TableHead>Approval Rate</TableHead>
                    <TableHead>Avg Review Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          RA
                        </div>
                        <div>
                          <p className="font-medium">Rashida Ahmed</p>
                          <p className="text-sm text-gray-500">Senior Moderator</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Electronics</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">127</span>
                        <span className="text-sm text-green-500 ml-2">+15%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress value={96} className="w-16 h-2 mr-2" />
                        <span className="text-sm font-medium">96.2%</span>
                      </div>
                    </TableCell>
                    <TableCell>2.1h</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          KH
                        </div>
                        <div>
                          <p className="font-medium">Karim Hassan</p>
                          <p className="text-sm text-gray-500">Moderator</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Fashion</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">89</span>
                        <span className="text-sm text-green-500 ml-2">+8%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress value={92} className="w-16 h-2 mr-2" />
                        <span className="text-sm font-medium">92.4%</span>
                      </div>
                    </TableCell>
                    <TableCell>2.6h</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          FK
                        </div>
                        <div>
                          <p className="font-medium">Fatima Khan</p>
                          <p className="text-sm text-gray-500">Junior Moderator</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>General</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">156</span>
                        <span className="text-sm text-green-500 ml-2">+22%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Progress value={88} className="w-16 h-2 mr-2" />
                        <span className="text-sm font-medium">88.7%</span>
                      </div>
                    </TableCell>
                    <TableCell>3.2h</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">Break</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Performance Analytics & KPI Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance KPI Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Weekly KPI Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Reviews Completed</p>
                        <p className="text-xl font-bold">8,247 <span className="text-sm text-green-500">(+12%)</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Accuracy Rate</p>
                        <p className="text-xl font-bold">94.2% <span className="text-sm text-green-500">(+2.1%)</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Review Time</p>
                        <p className="text-xl font-bold">2.4h <span className="text-sm text-green-500">(-0.3h)</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quality Score</p>
                        <p className="text-xl font-bold">4.8/5 <span className="text-sm text-green-500">(+0.2)</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Top Performers This Week</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-gold-500" />
                          <span className="text-sm font-medium">Rashida Ahmed</span>
                        </div>
                        <span className="text-sm">96.2% accuracy</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-silver-500" />
                          <span className="text-sm font-medium">Karim Hassan</span>
                        </div>
                        <span className="text-sm">92.4% accuracy</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-bronze-500" />
                          <span className="text-sm font-medium">Fatima Khan</span>
                        </div>
                        <span className="text-sm">88.7% accuracy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training & Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Upcoming Training</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">AI-Powered Moderation Tools</p>
                          <p className="text-xs text-gray-500">July 8, 2025 • 2:00 PM</p>
                        </div>
                        <Badge variant="outline">Required</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Bangladesh E-commerce Laws</p>
                          <p className="text-xs text-gray-500">July 10, 2025 • 10:00 AM</p>
                        </div>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Advanced Product Authentication</p>
                          <p className="text-xs text-gray-500">July 12, 2025 • 3:00 PM</p>
                        </div>
                        <Badge variant="outline">Required</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Certification Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Product Authentication</span>
                        <div className="flex items-center">
                          <Progress value={75} className="w-16 h-2 mr-2" />
                          <span className="text-sm">9/12</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Policy Compliance</span>
                        <div className="flex items-center">
                          <Progress value={100} className="w-16 h-2 mr-2" />
                          <span className="text-sm">12/12</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI Tools Certification</span>
                        <div className="flex items-center">
                          <Progress value={42} className="w-16 h-2 mr-2" />
                          <span className="text-sm">5/12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Review Form */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Review Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Conduct Performance Review</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reviewer-select">Select Team Member</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose team member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rashida">Rashida Ahmed</SelectItem>
                          <SelectItem value="karim">Karim Hassan</SelectItem>
                          <SelectItem value="fatima">Fatima Khan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review-period">Review Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly Review</SelectItem>
                          <SelectItem value="quarterly">Quarterly Review</SelectItem>
                          <SelectItem value="annual">Annual Review</SelectItem>
                          <SelectItem value="probation">Probation Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="overall-rating">Overall Performance Rating</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent (5/5)</SelectItem>
                          <SelectItem value="good">Good (4/5)</SelectItem>
                          <SelectItem value="satisfactory">Satisfactory (3/5)</SelectItem>
                          <SelectItem value="needs-improvement">Needs Improvement (2/5)</SelectItem>
                          <SelectItem value="unsatisfactory">Unsatisfactory (1/5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="strengths">Key Strengths</Label>
                      <Textarea 
                        id="strengths"
                        placeholder="Describe the team member's key strengths and achievements..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="improvements">Areas for Improvement</Label>
                      <Textarea 
                        id="improvements"
                        placeholder="Identify areas where the team member can improve..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="goals">Goals for Next Period</Label>
                      <Textarea 
                        id="goals"
                        placeholder="Set specific goals and objectives for the upcoming period..."
                      />
                    </div>
                    <Button className="w-full">Submit Performance Review</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Team Schedule Management</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shift-assignment">Shift Assignment</Label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <Select defaultValue="rashida">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rashida">Rashida Ahmed</SelectItem>
                              <SelectItem value="karim">Karim Hassan</SelectItem>
                              <SelectItem value="fatima">Fatima Khan</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="morning">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning (9AM-5PM)</SelectItem>
                              <SelectItem value="evening">Evening (5PM-1AM)</SelectItem>
                              <SelectItem value="night">Night (1AM-9AM)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">Assign</Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Current Week Schedule</Label>
                      <div className="border rounded-lg p-3 mt-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Monday</span>
                            <span>Rashida (M), Karim (E), Fatima (N)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tuesday</span>
                            <span>Karim (M), Fatima (E), Rashida (N)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wednesday</span>
                            <span>Fatima (M), Rashida (E), Karim (N)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="workload-balance">Workload Distribution</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Rashida Ahmed</span>
                          <div className="flex items-center">
                            <Progress value={85} className="w-20 h-2 mr-2" />
                            <span className="text-sm">25/30</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Karim Hassan</span>
                          <div className="flex items-center">
                            <Progress value={70} className="w-20 h-2 mr-2" />
                            <span className="text-sm">21/30</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fatima Khan</span>
                          <div className="flex items-center">
                            <Progress value={60} className="w-20 h-2 mr-2" />
                            <span className="text-sm">18/30</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">Auto-Balance</Button>
                      <Button className="flex-1">Save Schedule</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals and Objectives Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Team Goals & Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Current Quarter Goals</h4>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Increase Approval Rate</span>
                        <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                      </div>
                      <div className="flex items-center">
                        <Progress value={75} className="flex-1 mr-2" />
                        <span className="text-sm">75%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Target: 95% | Current: 94.2%</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Reduce Review Time</span>
                        <Badge className="bg-green-100 text-green-800">Achieved</Badge>
                      </div>
                      <div className="flex items-center">
                        <Progress value={100} className="flex-1 mr-2" />
                        <span className="text-sm">100%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Target: {"< 2.5h"} | Current: 2.4h</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Team Training Completion</span>
                        <Badge className="bg-orange-100 text-orange-800">Behind</Badge>
                      </div>
                      <div className="flex items-center">
                        <Progress value={45} className="flex-1 mr-2" />
                        <span className="text-sm">45%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Target: 100% | Current: 45%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Create New Goal</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input id="goal-title" placeholder="Enter goal title..." />
                    </div>
                    <div>
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea 
                        id="goal-description"
                        placeholder="Describe the goal and success criteria..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="target-date">Target Date</Label>
                        <Input type="date" id="target-date" />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="assigned-members">Assign to Team Members</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="assign-rashida" />
                          <Label htmlFor="assign-rashida" className="text-sm">Rashida Ahmed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="assign-karim" />
                          <Label htmlFor="assign-karim" className="text-sm">Karim Hassan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="assign-fatima" />
                          <Label htmlFor="assign-fatima" className="text-sm">Fatima Khan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="assign-all" />
                          <Label htmlFor="assign-all" className="text-sm">All Team</Label>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Create Goal</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};