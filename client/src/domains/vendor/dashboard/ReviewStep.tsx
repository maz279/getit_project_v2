
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle, ArrowLeft, Send, Store, User, Mail, Phone, MapPin, Calendar, Users, FileText } from 'lucide-react';

interface ReviewStepProps {
  data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    businessType: string;
    description: string;
    establishedYear: string;
    employeeCount: string;
    expectedMonthlyRevenue: string;
    productCategories: string[];
    tradeLicense: File | null;
    nidCopy: File | null;
    bankStatement: File | null;
  };
  onSubmit: () => void;
  onPrev: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onSubmit, onPrev }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Almost Done!</h3>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-medium">{data.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner Name</p>
              <p className="font-medium">{data.ownerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{data.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{data.address}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Business Type</p>
                <p className="font-medium capitalize">{data.businessType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Established</p>
                <p className="font-medium">{data.establishedYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="font-medium">{data.employeeCount}</p>
              </div>
            </div>

            {data.expectedMonthlyRevenue && (
              <div>
                <p className="text-sm text-gray-600">Expected Monthly Revenue</p>
                <p className="font-medium">{data.expectedMonthlyRevenue}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Product Categories</p>
              <div className="flex flex-wrap gap-2">
                {data.productCategories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium text-sm">{data.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Trade License</span>
                {data.tradeLicense ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span>National ID Copy</span>
                {data.nidCopy ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span>Bank Statement</span>
                {data.bankStatement ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                ) : (
                  <Badge variant="secondary">Optional</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms and Conditions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-800 mb-3">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Your application will be reviewed within 24-48 hours</li>
            <li>• We'll verify your documents and business information</li>
            <li>• You'll receive an email notification once approved</li>
            <li>• After approval, you can start listing products immediately</li>
            <li>• Our seller support team will guide you through the setup process</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onSubmit} className="min-w-[140px] bg-green-600 hover:bg-green-700">
          <Send className="w-4 h-4 mr-2" />
          Submit Application
        </Button>
      </div>
    </div>
  );
};
