
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Eye, 
  Edit, 
  MessageSquare, 
  Ban, 
  CheckCircle, 
  Star,
  Package,
  TrendingUp,
  Clock,
  Store
} from 'lucide-react';
import { ActiveVendor } from './types';

interface VendorsOverviewTabProps {
  vendors: ActiveVendor[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'suspended': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getVerificationColor = (status: string) => {
  switch (status) {
    case 'verified': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'under_review': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const VendorsOverviewTab: React.FC<VendorsOverviewTabProps> = ({ vendors }) => {
  return (
    <div className="space-y-6">
      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-3 h-5 w-5 text-green-600" />
            Active Vendors Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Vendor Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Products</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Store className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{vendor.businessName}</div>
                          <div className="text-sm text-gray-500">{vendor.contactPerson}</div>
                          <div className="text-xs text-gray-400">{vendor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.category}</div>
                        <div className="text-sm text-gray-500">{vendor.subCategory}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status}
                        </Badge>
                        <Badge className={getVerificationColor(vendor.verificationStatus)} variant="outline">
                          {vendor.verificationStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{vendor.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({vendor.reviewCount})</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {vendor.onTimeDelivery}% On-time • {vendor.responseRate}% Response
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">৳{vendor.monthlyRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">This month</div>
                        <div className="text-xs text-gray-400">{vendor.commissionRate}% commission</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.activeProducts}</div>
                        <div className="text-sm text-gray-500">of {vendor.totalProducts} total</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Edit Vendor">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Contact Vendor">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {vendor.status === 'active' ? (
                          <Button size="sm" variant="outline" className="text-red-600" title="Suspend">
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-green-600" title="Activate">
                            <CheckCircle className="h-4 w-4" />
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Vendor Onboarding</h3>
                <p className="text-sm text-green-600 mt-1">Add new vendor partners</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Start Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800">Performance Review</h3>
                <p className="text-sm text-blue-600 mt-1">Evaluate vendor metrics</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">Pending Actions</h3>
                <p className="text-sm text-orange-600 mt-1">Review pending items</p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Clock className="h-4 w-4 mr-2" />
                Review Queue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
