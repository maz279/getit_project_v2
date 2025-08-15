
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { PendingVendorApplication } from './types';

interface ApplicationsOverviewTabProps {
  applications: PendingVendorApplication[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'under_review': return 'bg-yellow-100 text-yellow-800';
    case 'pending_documents': return 'bg-orange-100 text-orange-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ApplicationsOverviewTab: React.FC<ApplicationsOverviewTabProps> = ({ applications }) => {
  return (
    <div className="space-y-6">
      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-3 h-5 w-5 text-blue-600" />
            Pending Vendor Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Application Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Business Info</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Documents</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{application.applicationNumber}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {application.contactPerson}
                        </div>
                        <div className="text-xs text-gray-400">{application.email}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(application.registrationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{application.businessName}</div>
                        <div className="text-sm text-gray-500">{application.category}</div>
                        <div className="text-xs text-gray-400">{application.subCategory}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {application.businessAddress.city}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <Badge className={getStatusColor(application.applicationStatus)}>
                          {application.applicationStatus.replace('_', ' ')}
                        </Badge>
                        {application.assignedReviewer && (
                          <div className="text-xs text-gray-500">
                            Assigned: {application.assignedReviewer}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {application.documentsSubmitted.length} uploaded
                        </div>
                        <div className="flex space-x-1">
                          {Object.entries(application.verificationDocuments).map(([key, verified]) => (
                            <div
                              key={key}
                              className={`w-3 h-3 rounded-full ${
                                verified ? 'bg-green-400' : 'bg-gray-300'
                              }`}
                              title={key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Object.values(application.verificationDocuments).filter(Boolean).length}/
                          {Object.keys(application.verificationDocuments).length} verified
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getPriorityColor(application.priority)}>
                        {application.priority}
                      </Badge>
                      {application.priority === 'urgent' && (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" title="View Application">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Add Comment">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {application.applicationStatus === 'under_review' && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600" title="Approve">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" title="Reject">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
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
