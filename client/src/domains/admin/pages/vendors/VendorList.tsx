/**
 * Vendor List - Comprehensive vendor management interface
 * Amazon.com/Shopee.sg-level implementation for Bangladesh market
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/domains/admin/dashboard/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { 
  Store, Search, Filter, Download, Plus, Edit, Eye, Ban, CheckCircle,
  MapPin, Phone, Mail, Calendar, Star, TrendingUp, AlertCircle, MoreVertical
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/shared/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

// Sample vendor data
const vendorsData = [
  {
    id: 'V001',
    name: 'Dhaka Electronics Hub',
    owner: 'Rahman Ahmed',
    email: 'rahman@dhelectronics.com',
    phone: '+880 1712-345678',
    location: 'Dhaka',
    status: 'active',
    kycStatus: 'verified',
    joinDate: '2023-05-15',
    products: 156,
    totalSales: 'BDT 45,67,890',
    rating: 4.5,
    commission: '12%',
    logo: null
  },
  {
    id: 'V002',
    name: 'Fashion Paradise BD',
    owner: 'Fatima Khatun',
    email: 'fatima@fashionparadise.bd',
    phone: '+880 1812-456789',
    location: 'Chittagong',
    status: 'active',
    kycStatus: 'verified',
    joinDate: '2023-06-20',
    products: 342,
    totalSales: 'BDT 67,89,450',
    rating: 4.8,
    commission: '10%',
    logo: null
  },
  {
    id: 'V003',
    name: 'Fresh Foods Market',
    owner: 'Karim Sheikh',
    email: 'karim@freshfoods.com',
    phone: '+880 1912-567890',
    location: 'Sylhet',
    status: 'suspended',
    kycStatus: 'pending',
    joinDate: '2024-01-10',
    products: 89,
    totalSales: 'BDT 23,45,670',
    rating: 3.9,
    commission: '15%',
    logo: null
  },
  {
    id: 'V004',
    name: 'Home Decor Gallery',
    owner: 'Ayesha Begum',
    email: 'ayesha@homedecor.bd',
    phone: '+880 1612-678901',
    location: 'Rajshahi',
    status: 'active',
    kycStatus: 'verified',
    joinDate: '2023-08-05',
    products: 234,
    totalSales: 'BDT 34,56,780',
    rating: 4.6,
    commission: '11%',
    logo: null
  },
  {
    id: 'V005',
    name: 'Tech Solutions BD',
    owner: 'Hasan Ali',
    email: 'hasan@techsolutions.com',
    phone: '+880 1512-789012',
    location: 'Khulna',
    status: 'pending',
    kycStatus: 'reviewing',
    joinDate: '2024-06-01',
    products: 0,
    totalSales: 'BDT 0',
    rating: 0,
    commission: '13%',
    logo: null
  }
];

const VendorList = () => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVendors(vendorsData.map(v => v.id));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleSelectVendor = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, vendorId]);
    } else {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800">KYC Verified</Badge>;
      case 'pending':
        return <Badge variant="outline">KYC Pending</Badge>;
      case 'reviewing':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout
      currentPage="Vendor List"
      breadcrumbItems={[
        { label: 'Vendors', href: '/admin/vendors' },
        { label: 'Vendor List' }
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Vendor Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and monitor all registered vendors on the platform
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-gray-500 mt-1">+15 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">298</div>
              <Progress value={87} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">23</div>
              <p className="text-xs text-gray-500 mt-1">Requires action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT 4.5Cr</div>
              <p className="text-xs text-green-600 mt-1">+23% growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Vendors</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger id="location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="dhaka">Dhaka</SelectItem>
                    <SelectItem value="chittagong">Chittagong</SelectItem>
                    <SelectItem value="sylhet">Sylhet</SelectItem>
                    <SelectItem value="rajshahi">Rajshahi</SelectItem>
                    <SelectItem value="khulna">Khulna</SelectItem>
                    <SelectItem value="barisal">Barisal</SelectItem>
                    <SelectItem value="rangpur">Rangpur</SelectItem>
                    <SelectItem value="mymensingh">Mymensingh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Vendor List</CardTitle>
              {selectedVendors.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Ban className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedVendors.length === vendorsData.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Vendor Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorsData.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedVendors.includes(vendor.id)}
                        onCheckedChange={(checked) => handleSelectVendor(vendor.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={vendor.logo || undefined} />
                          <AvatarFallback>{vendor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-gray-500">ID: {vendor.id} • {vendor.owner}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {vendor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {vendor.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(vendor.status)}
                        {getKYCBadge(vendor.kycStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{vendor.rating || 'N/A'}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {vendor.products} products
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{vendor.totalSales}</div>
                        <div className="text-sm text-gray-500">
                          Commission: {vendor.commission}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Store className="w-4 h-4 mr-2" />
                            View Store
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Performance Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend Vendor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing 1 to 5 of 342 vendors
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Approve Pending Vendors
              </Button>
              <Button variant="outline" className="justify-start">
                <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                Review KYC Documents
              </Button>
              <Button variant="outline" className="justify-start">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Send Bulk Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VendorList;