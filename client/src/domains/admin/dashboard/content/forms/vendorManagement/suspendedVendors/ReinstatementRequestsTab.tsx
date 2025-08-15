
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Calendar,
  User,
  AlertCircle,
  Download
} from 'lucide-react';
import { ReinstatementRequest } from './types';

interface ReinstatementRequestsTabProps {
  requests: ReinstatementRequest[];
}

export const ReinstatementRequestsTab: React.FC<ReinstatementRequestsTabProps> = ({ requests }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'under_review': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reinstatement Requests</h3>
          <p className="text-sm text-gray-600">Review and process vendor reinstatement applications</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Requests
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{request.businessName}</span>
                    {getStatusIcon(request.status)}
                  </CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Requested: {new Date(request.requestDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      Vendor ID: {request.vendorId}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                    <p className="text-sm text-gray-600 mb-3">{request.reason}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monitoring Period:</span>
                        <span className="font-medium">{request.monitoringPeriod} days</span>
                      </div>
                      {request.reviewedBy && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reviewed By:</span>
                          <span className="font-medium">{request.reviewedBy}</span>
                        </div>
                      )}
                      {request.reviewDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Review Date:</span>
                          <span className="font-medium">{new Date(request.reviewDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Evidence Submitted</h4>
                    <div className="space-y-1">
                      {request.evidenceSubmitted.map((evidence, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">{evidence}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Correction Plan</h4>
                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">{request.correctionPlan}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Reinstatement Conditions</h4>
                    <div className="space-y-2">
                      {request.conditions.map((condition, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {request.reviewNotes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                      <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded">{request.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Request Progress:</span>
                    <Progress 
                      value={
                        request.status === 'pending' ? 25 :
                        request.status === 'under_review' ? 50 :
                        request.status === 'approved' ? 100 :
                        request.status === 'rejected' ? 100 : 0
                      } 
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Clock className="h-4 w-4 mr-2" />
                          Start Review
                        </Button>
                      </>
                    )}
                    {request.status === 'under_review' && (
                      <>
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
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
