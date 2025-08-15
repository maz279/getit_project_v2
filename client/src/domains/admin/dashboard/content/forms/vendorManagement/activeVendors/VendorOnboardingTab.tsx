
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { mockVendorOnboarding } from './mockData';

export const VendorOnboardingTab: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'additional_info_required': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      case 'additional_info_required': return <AlertTriangle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Onboarding Queue Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <UserPlus className="mr-3 h-5 w-5 text-blue-600" />
              Vendor Onboarding Queue
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Onboarding Applications */}
      <div className="grid gap-6">
        {mockVendorOnboarding.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{application.businessName}</h3>
                    <p className="text-gray-600">{application.contactPerson}</p>
                    <p className="text-sm text-gray-500">{application.category}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                  {getStatusIcon(application.status)}
                  <span>{application.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{application.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{application.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-500">
                        {application.currentStep}/{application.totalSteps}
                      </span>
                    </div>
                    <Progress value={(application.currentStep / application.totalSteps) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Documents</span>
                      <span className="text-sm text-gray-500">
                        {application.documentsUploaded}/{application.requiredDocuments}
                      </span>
                    </div>
                    <Progress value={(application.documentsUploaded / application.requiredDocuments) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              {application.assignedReviewer && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Assigned Reviewer:</strong> {application.assignedReviewer}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Est. Completion:</strong> {new Date(application.estimatedCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {application.notes && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Notes:</strong> {application.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {application.status === 'under_review' && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {application.status === 'additional_info_required' && (
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Request Info
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
