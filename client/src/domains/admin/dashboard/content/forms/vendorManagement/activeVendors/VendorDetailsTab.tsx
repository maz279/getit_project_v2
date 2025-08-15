
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  CreditCard, 
  Shield,
  Star,
  TrendingUp,
  Package
} from 'lucide-react';
import { ActiveVendor } from './types';

interface VendorDetailsTabProps {
  vendors: ActiveVendor[];
}

export const VendorDetailsTab: React.FC<VendorDetailsTabProps> = ({ vendors }) => {
  // Show detailed view for first vendor as example
  const selectedVendor = vendors[0];

  if (!selectedVendor) return <div>No vendor selected</div>;

  return (
    <div className="space-y-6">
      {/* Vendor Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedVendor.businessName}</h2>
                <p className="text-gray-600">{selectedVendor.contactPerson}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">{selectedVendor.status}</Badge>
              <Badge className="bg-blue-100 text-blue-800">{selectedVendor.verificationStatus}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedVendor.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{selectedVendor.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{selectedVendor.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">{new Date(selectedVendor.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Business License</p>
              <p className="font-medium">{selectedVendor.businessLicense}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tax ID</p>
              <p className="font-medium">{selectedVendor.taxId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{selectedVendor.category} - {selectedVendor.subCategory}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">KYC Status</p>
              <Badge className={selectedVendor.kycStatus === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {selectedVendor.kycStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rating</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-medium">{selectedVendor.rating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order Fulfillment</span>
              <span className="font-medium">{selectedVendor.performanceMetrics.orderFulfillmentRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On-time Delivery</span>
              <span className="font-medium">{selectedVendor.onTimeDelivery}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Rate</span>
              <span className="font-medium">{selectedVendor.responseRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Return Rate</span>
              <span className="font-medium">{selectedVendor.returnRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Information */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-xl font-bold text-green-600">৳{selectedVendor.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-bold">৳{selectedVendor.totalSales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="font-medium">{selectedVendor.commissionRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="font-medium">৳{selectedVendor.paymentInfo.pendingPayments.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Account</p>
              <p className="font-medium">{selectedVendor.bankAccount.bankName}</p>
              <p className="text-sm text-gray-500">{selectedVendor.bankAccount.accountNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-orange-600" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedVendor.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{doc.type}</p>
                  <p className="text-sm text-gray-500">Uploaded: {doc.uploadDate}</p>
                </div>
                <Badge className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {doc.verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            ))}
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Request Additional Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
