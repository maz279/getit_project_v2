
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Search, Plus, Truck, Star, TrendingUp, Clock, Package, AlertCircle } from 'lucide-react';

export const CourierPartnersContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for courier partners
  const courierPartners = [
    {
      id: 1,
      name: 'FastTrack Express',
      logo: '🚚',
      status: 'active',
      rating: 4.8,
      deliveries: 15420,
      onTimeRate: 96.5,
      avgDeliveryTime: '2.3 days',
      costPerDelivery: '$8.50',
      coverage: 'Nationwide',
      specialties: ['Same Day', 'Express']
    },
    {
      id: 2,
      name: 'Global Logistics',
      logo: '🌍',
      status: 'active',
      rating: 4.6,
      deliveries: 28750,
      onTimeRate: 94.2,
      avgDeliveryTime: '3.1 days',
      costPerDelivery: '$6.75',
      coverage: 'International',
      specialties: ['International', 'Bulk']
    },
    {
      id: 3,
      name: 'City Runners',
      logo: '🏃',
      status: 'active',
      rating: 4.9,
      deliveries: 8900,
      onTimeRate: 98.1,
      avgDeliveryTime: '4 hours',
      costPerDelivery: '$12.00',
      coverage: 'Urban Areas',
      specialties: ['Same Day', 'Food']
    },
    {
      id: 4,
      name: 'Economy Shipping',
      logo: '📦',
      status: 'inactive',
      rating: 4.2,
      deliveries: 5650,
      onTimeRate: 89.7,
      avgDeliveryTime: '5.2 days',
      costPerDelivery: '$4.25',
      coverage: 'Regional',
      specialties: ['Economy', 'Standard']
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courier Partners</h1>
          <p className="text-gray-600">Manage delivery partners and shipping services</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Truck className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">4</div>
            <div className="text-sm text-gray-500">Active Partners</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Package className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">58.7K</div>
            <div className="text-sm text-gray-500">Total Deliveries</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">95.1%</div>
            <div className="text-sm text-gray-500">Avg On-Time Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Clock className="h-8 w-8 text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">2.9</div>
            <div className="text-sm text-gray-500">Avg Delivery Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Partners Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courier Partners ({courierPartners.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>On-Time Rate</TableHead>
                    <TableHead>Avg Delivery</TableHead>
                    <TableHead>Cost/Delivery</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courierPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{partner.logo}</div>
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-gray-500">
                              {partner.specialties.join(', ')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={partner.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{partner.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{partner.deliveries.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className={`font-medium ${
                            partner.onTimeRate >= 95 
                              ? 'text-green-600' 
                              : partner.onTimeRate >= 90 
                                ? 'text-yellow-600' 
                                : 'text-red-600'
                          }`}>
                            {partner.onTimeRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{partner.avgDeliveryTime}</TableCell>
                      <TableCell className="font-medium">{partner.costPerDelivery}</TableCell>
                      <TableCell>{partner.coverage}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courierPartners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{partner.logo}</div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-gray-500">
                            {partner.deliveries.toLocaleString()} deliveries
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{partner.onTimeRate}%</div>
                        <div className="text-sm text-gray-500">On-time</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courierPartners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{partner.logo}</div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-gray-500">
                            Avg: {partner.avgDeliveryTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-blue-600">{partner.costPerDelivery}</div>
                        <div className="text-sm text-gray-500">per delivery</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Contract management features coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Advanced analytics features coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
