
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { 
  AlertTriangle, 
  Calendar, 
  Mail, 
  Phone, 
  Star, 
  TrendingDown,
  FileText,
  Eye,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { SuspendedVendor } from './types';

interface SuspendedVendorsOverviewTabProps {
  vendors: SuspendedVendor[];
}

export const SuspendedVendorsOverviewTab: React.FC<SuspendedVendorsOverviewTabProps> = ({ vendors }) => {
  const getSuspensionTypeColor = (type: string) => {
    switch (type) {
      case 'temporary': return 'bg-orange-100 text-orange-800';
      case 'permanent': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppealStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      {vendor.businessName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{vendor.businessName}</CardTitle>
                    <p className="text-sm text-gray-600">{vendor.contactPerson}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1" />
                        {vendor.email}
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {vendor.phone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getSuspensionTypeColor(vendor.suspensionType)}>
                    {vendor.suspensionType.replace('_', ' ')}
                  </Badge>
                  <Badge className={getSeverityColor(vendor.severityLevel)}>
                    {vendor.severityLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Suspension Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-2" />
                      Suspended: {new Date(vendor.suspensionDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      {vendor.violationType.replace('_', ' ')}
                    </div>
                    {vendor.reinstateEligibleDate && (
                      <div className="flex items-center text-green-600">
                        <RotateCcw className="h-3 w-3 mr-2" />
                        Eligible: {new Date(vendor.reinstateEligibleDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Performance Metrics</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium">{vendor.totalOrdersBeforeSuspension.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">৳{vendor.totalRevenueBeforeSuspension.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{vendor.averageRating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Issues & Compliance</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Complaints:</span>
                      <span className="font-medium text-red-600">{vendor.customerComplaintsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Issues:</span>
                      <span className="font-medium text-red-600">{vendor.qualityIssuesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compliance Score:</span>
                      <span className={`font-medium ${vendor.complianceScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {vendor.complianceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Suspension Reason</h4>
                    <p className="text-sm text-gray-600">{vendor.suspensionReason}</p>
                    
                    {vendor.appealStatus !== 'none' && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Appeal Status:</span>
                          <Badge className={getAppealStatusColor(vendor.appealStatus)}>
                            {vendor.appealStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    {vendor.reviewStatus === 'approved_for_reinstatement' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reinstate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
