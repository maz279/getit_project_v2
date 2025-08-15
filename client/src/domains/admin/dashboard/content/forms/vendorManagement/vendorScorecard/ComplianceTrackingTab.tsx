
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Shield, AlertTriangle, CheckCircle, FileText, Calendar, Download } from 'lucide-react';

export const ComplianceTrackingTab: React.FC = () => {
  const complianceData = [
    {
      id: 1,
      vendorName: 'TechCorp Solutions',
      overallCompliance: 95,
      status: 'compliant',
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10',
      requirements: [
        { name: 'Business Registration', status: 'compliant', expiryDate: '2025-03-15', progress: 100 },
        { name: 'Tax Compliance', status: 'compliant', expiryDate: '2024-12-31', progress: 100 },
        { name: 'Quality Certification', status: 'compliant', expiryDate: '2024-09-20', progress: 100 },
        { name: 'Insurance Coverage', status: 'warning', expiryDate: '2024-02-28', progress: 85 },
        { name: 'Safety Standards', status: 'compliant', expiryDate: '2025-01-15', progress: 100 }
      ]
    },
    {
      id: 2,
      vendorName: 'Fashion Forward Co.',
      overallCompliance: 78,
      status: 'warning',
      lastAudit: '2024-01-05',
      nextAudit: '2024-04-05',
      requirements: [
        { name: 'Business Registration', status: 'compliant', expiryDate: '2024-11-30', progress: 100 },
        { name: 'Tax Compliance', status: 'non_compliant', expiryDate: '2024-01-31', progress: 40 },
        { name: 'Quality Certification', status: 'warning', expiryDate: '2024-03-10', progress: 70 },
        { name: 'Insurance Coverage', status: 'compliant', expiryDate: '2024-08-15', progress: 100 },
        { name: 'Safety Standards', status: 'warning', expiryDate: '2024-02-20', progress: 75 }
      ]
    },
    {
      id: 3,
      vendorName: 'Home Essentials',
      overallCompliance: 65,
      status: 'non_compliant',
      lastAudit: '2024-01-08',
      nextAudit: '2024-02-08',
      requirements: [
        { name: 'Business Registration', status: 'compliant', expiryDate: '2024-06-30', progress: 100 },
        { name: 'Tax Compliance', status: 'non_compliant', expiryDate: '2023-12-31', progress: 20 },
        { name: 'Quality Certification', status: 'non_compliant', expiryDate: '2023-11-15', progress: 30 },
        { name: 'Insurance Coverage', status: 'warning', expiryDate: '2024-03-01', progress: 60 },
        { name: 'Safety Standards', status: 'non_compliant', expiryDate: '2023-10-30', progress: 25 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'non_compliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Compliance Tracking</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Audit
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {complianceData.filter(v => v.status === 'compliant').length}
              </div>
              <div className="text-sm text-gray-600">Fully Compliant</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {complianceData.filter(v => v.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">Needs Attention</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {complianceData.filter(v => v.status === 'non_compliant').length}
              </div>
              <div className="text-sm text-gray-600">Non-Compliant</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Compliance Status */}
      <div className="space-y-6">
        {complianceData.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{vendor.vendorName}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Last Audit: {vendor.lastAudit} • Next: {vendor.nextAudit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(vendor.status)}>
                    {vendor.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {vendor.overallCompliance}%
                    </div>
                    <div className="text-xs text-gray-500">Overall</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendor.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(requirement.status)}
                      <div className="flex-1">
                        <div className="font-medium">{requirement.name}</div>
                        <div className="text-sm text-gray-600">
                          Expires: {requirement.expiryDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium">{requirement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(requirement.progress)}`}
                            style={{ width: `${requirement.progress}%` }}
                          />
                        </div>
                      </div>
                      <Badge className={getStatusColor(requirement.status)} variant="outline">
                        {requirement.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Documents
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Review
                  </Button>
                </div>
                <div className="text-xs text-gray-500">
                  {vendor.status === 'non_compliant' && (
                    <span className="text-red-600 font-medium">Immediate Action Required</span>
                  )}
                  {vendor.status === 'warning' && (
                    <span className="text-yellow-600 font-medium">Review Recommended</span>
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
