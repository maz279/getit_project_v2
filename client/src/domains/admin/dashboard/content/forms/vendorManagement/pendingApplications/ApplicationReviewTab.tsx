
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  Download,
  Eye
} from 'lucide-react';

export const ApplicationReviewTab: React.FC = () => {
  const [selectedApplication, setSelectedApplication] = useState<string>('app-001');
  const [reviewAction, setReviewAction] = useState<string>('');
  const [reviewComments, setReviewComments] = useState<string>('');

  return (
    <div className="space-y-6">
      {/* Application Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Application for Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedApplication} onValueChange={setSelectedApplication}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an application to review" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="app-001">VA-2024-001 - TechnoMart Electronics</SelectItem>
              <SelectItem value="app-002">VA-2024-002 - Fashion Hub BD</SelectItem>
              <SelectItem value="app-003">VA-2024-003 - Organic Foods Ltd</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5 text-blue-600" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Business Name</Label>
                <p className="font-medium">TechnoMart Electronics</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Business Type</Label>
                <p className="font-medium">Retailer</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Category</Label>
                <p className="font-medium">Electronics</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Sub-Category</Label>
                <p className="font-medium">Mobile Phones & Accessories</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Business Address</Label>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                <div>
                  <p>123 Electronics Street</p>
                  <p>Dhaka, Dhaka Division 1000</p>
                  <p>Bangladesh</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Established</Label>
                <p className="font-medium">2020</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Employees</Label>
                <p className="font-medium">25</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Annual Revenue</Label>
                <p className="font-medium">৳5,000,000</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Trade License</Label>
                <p className="font-medium">TL-DHK-2023-001</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Contact Person</Label>
              <p className="font-medium">Ahmed Rahman</p>
            </div>
            
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="font-medium">ahmed@technomart.com</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="font-medium">+880-1711-123456</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <Label className="text-sm font-medium text-gray-600">Application Date</Label>
                <p className="font-medium">January 15, 2024</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Current Status</Label>
              <Badge className="bg-yellow-100 text-yellow-800 mt-1">Under Review</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-600" />
            Documents Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Trade License', status: 'verified', file: 'Trade License.pdf' },
              { name: 'Tax Certificate', status: 'pending', file: 'Tax Certificate.pdf' },
              { name: 'Bank Statement', status: 'verified', file: 'Bank Statement.pdf' },
              { name: 'Identity Proof', status: 'verified', file: 'NID Copy.pdf' },
              { name: 'Address Proof', status: 'pending', file: 'Utility Bill.pdf' }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.file}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reviewAction">Review Action</Label>
            <Select value={reviewAction} onValueChange={setReviewAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select review action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve Application</SelectItem>
                <SelectItem value="reject">Reject Application</SelectItem>
                <SelectItem value="request_documents">Request Additional Documents</SelectItem>
                <SelectItem value="hold">Put on Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reviewComments">Review Comments</Label>
            <Textarea
              id="reviewComments"
              placeholder="Enter your review comments here..."
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex space-x-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Review
            </Button>
            <Button variant="outline" className="flex-1">
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
