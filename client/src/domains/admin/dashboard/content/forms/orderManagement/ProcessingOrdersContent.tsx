
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Checkbox } from '@/shared/ui/checkbox';
import { Progress } from '@/shared/ui/progress';
import { 
  Package, 
  Clock, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  Edit, 
  Filter,
  Search,
  RefreshCw,
  Download,
  Printer,
  Settings,
  Play,
  Pause,
  SkipForward,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';

export const ProcessingOrdersContent: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Mock processing orders data
  const processingOrders = [
    {
      id: 'ORD-2024-001',
      orderNumber: '#12345',
      customer: {
        name: 'Sarah Ahmed',
        email: 'sarah@email.com',
        phone: '+8801712345678'
      },
      status: 'preparing',
      priority: 'high',
      assignee: 'John Doe',
      totalAmount: 2850,
      items: 3,
      orderDate: '2024-01-15T10:30:00Z',
      processingStarted: '2024-01-15T14:00:00Z',
      estimatedCompletion: '2024-01-16T12:00:00Z',
      progress: 45,
      shippingAddress: {
        street: '123 Main St',
        city: 'Dhaka',
        area: 'Dhanmondi',
        postalCode: '1205',
        country: 'Bangladesh'
      },
      items_detail: [
        { name: 'Smartphone Case', quantity: 2, status: 'picked' },
        { name: 'Screen Protector', quantity: 1, status: 'preparing' }
      ],
      notes: 'Customer requested express delivery',
      tags: ['Express', 'VIP Customer']
    },
    {
      id: 'ORD-2024-002',
      orderNumber: '#12346',
      customer: {
        name: 'Mohammad Rahman',
        email: 'rahman@email.com',
        phone: '+8801823456789'
      },
      status: 'quality-check',
      priority: 'medium',
      assignee: 'Jane Smith',
      totalAmount: 1650,
      items: 2,
      orderDate: '2024-01-15T09:15:00Z',
      processingStarted: '2024-01-15T13:30:00Z',
      estimatedCompletion: '2024-01-16T10:00:00Z',
      progress: 75,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Chittagong',
        area: 'Agrabad',
        postalCode: '4100',
        country: 'Bangladesh'
      },
      items_detail: [
        { name: 'T-Shirt', quantity: 1, status: 'quality-check' },
        { name: 'Jeans', quantity: 1, status: 'ready' }
      ],
      notes: '',
      tags: ['Regular']
    },
    {
      id: 'ORD-2024-003',
      orderNumber: '#12347',
      customer: {
        name: 'Fatima Khan',
        email: 'fatima@email.com',
        phone: '+8801934567890'
      },
      status: 'packaging',
      priority: 'low',
      assignee: 'Mike Johnson',
      totalAmount: 3200,
      items: 5,
      orderDate: '2024-01-14T14:20:00Z',
      processingStarted: '2024-01-15T11:00:00Z',
      estimatedCompletion: '2024-01-16T16:00:00Z',
      progress: 90,
      shippingAddress: {
        street: '789 Pine Rd',
        city: 'Sylhet',
        area: 'Zindabazar',
        postalCode: '3100',
        country: 'Bangladesh'
      },
      items_detail: [
        { name: 'Kitchen Set', quantity: 1, status: 'packaging' },
        { name: 'Utensils', quantity: 4, status: 'ready' }
      ],
      notes: 'Fragile items - handle with care',
      tags: ['Fragile', 'Bulk Order']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'quality-check': return 'bg-blue-100 text-blue-800';
      case 'packaging': return 'bg-purple-100 text-purple-800';
      case 'ready-to-ship': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = processingOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || order.assignee === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  // Processing stages for workflow
  const processingStages = [
    { key: 'preparing', label: 'Preparing', count: 12 },
    { key: 'quality-check', label: 'Quality Check', count: 8 },
    { key: 'packaging', label: 'Packaging', count: 15 },
    { key: 'ready-to-ship', label: 'Ready to Ship', count: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processing Orders</h1>
          <p className="text-gray-600 mt-1">Manage orders currently being processed</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {processingStages.map((stage) => (
          <Card key={stage.key} className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === stage.key ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setStatusFilter(stage.key)}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100">
                  {stage.key === 'preparing' && <Clock className="h-6 w-6 text-blue-600" />}
                  {stage.key === 'quality-check' && <CheckCircle className="h-6 w-6 text-blue-600" />}
                  {stage.key === 'packaging' && <Package className="h-6 w-6 text-blue-600" />}
                  {stage.key === 'ready-to-ship' && <Truck className="h-6 w-6 text-blue-600" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stage.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Processing Queue</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Management</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="settings">Processing Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by order number or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="quality-check">Quality Check</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="ready-to-ship">Ready to Ship</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      <SelectItem value="John Doe">John Doe</SelectItem>
                      <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedOrders.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{selectedOrders.length} selected</Badge>
                  <Button size="sm" variant="outline">Bulk Update Status</Button>
                  <Button size="sm" variant="outline">Assign to User</Button>
                  <Button size="sm" variant="outline">Set Priority</Button>
                  <Button size="sm" variant="outline">Print Labels</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Queue ({filteredOrders.length} orders)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedOrders.length === filteredOrders.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status & Progress</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Timing</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => handleSelectOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-blue-600">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{order.items} items • ৳{order.totalAmount.toLocaleString()}</div>
                            <div className="flex gap-1">
                              {order.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {order.customer.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.shippingAddress.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <div className="w-full">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{order.progress}%</span>
                              </div>
                              <Progress value={order.progress} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{order.assignee}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Started: {new Date(order.processingStarted).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              ETA: {new Date(order.estimatedCompletion).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processingStages.map((stage, index) => (
                    <div key={stage.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{stage.label}</h4>
                          <p className="text-sm text-gray-600">{stage.count} orders</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['John Doe', 'Jane Smith', 'Mike Johnson'].map((assignee) => (
                    <div key={assignee} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{assignee}</h4>
                        <p className="text-sm text-gray-600">12 orders processed today</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-600 font-medium">95% efficiency</div>
                        <div className="text-xs text-gray-500">Avg. 2.5h/order</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orders Processed</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Processing Time</span>
                    <span className="font-semibold">2.3h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efficiency Rate</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">On-Time Completion</span>
                    <span className="font-semibold text-green-600">96%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Quality Check: 3 delayed orders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Packaging: Staff shortage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Preparing: Running smoothly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause All Processing
                  </Button>
                  <Button className="w-full" variant="outline">
                    <SkipForward className="h-4 w-4 mr-2" />
                    Rush Priority Orders
                  </Button>
                  <Button className="w-full" variant="outline">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Alert Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-assign orders</h4>
                      <p className="text-sm text-gray-600">Automatically assign orders to available staff</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Priority processing</h4>
                      <p className="text-sm text-gray-600">Process high priority orders first</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Quality check required</h4>
                      <p className="text-sm text-gray-600">Require quality check for all orders</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum processing time (hours)</label>
                    <Input type="number" defaultValue="24" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality check time limit (minutes)</label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Packaging time limit (minutes)</label>
                    <Input type="number" defaultValue="45" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
