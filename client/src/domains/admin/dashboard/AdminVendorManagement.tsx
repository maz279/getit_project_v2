
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Search, Filter, Eye, Edit, Ban, CheckCircle, XCircle } from 'lucide-react';

export const AdminVendorManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const vendors = [
    {
      id: 1,
      name: 'TechZone Bangladesh',
      email: 'contact@techzone.bd',
      phone: '+880 1234567890',
      status: 'active',
      joinDate: '2024-01-15',
      totalSales: '৳2,45,000',
      products: 156,
      rating: 4.8,
      kycStatus: 'verified'
    },
    {
      id: 2,
      name: 'Fashion Hub BD',
      email: 'info@fashionhub.bd',
      phone: '+880 1987654321',
      status: 'pending',
      joinDate: '2024-03-20',
      totalSales: '৳1,20,000',
      products: 89,
      rating: 4.6,
      kycStatus: 'pending'
    },
    {
      id: 3,
      name: 'Home Essentials',
      email: 'support@homeessentials.bd',
      phone: '+880 1122334455',
      status: 'suspended',
      joinDate: '2023-11-10',
      totalSales: '৳89,000',
      products: 45,
      rating: 4.2,
      kycStatus: 'rejected'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add New Vendor
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">KYC</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Products</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-sm text-gray-500">Joined: {vendor.joinDate}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900">{vendor.email}</div>
                        <div className="text-sm text-gray-500">{vendor.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getKycStatusColor(vendor.kycStatus)}>
                        {vendor.kycStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {vendor.totalSales}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {vendor.products}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-gray-900">{vendor.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit size={14} />
                        </Button>
                        {vendor.status === 'active' ? (
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Ban size={14} />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-green-600">
                            <CheckCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
