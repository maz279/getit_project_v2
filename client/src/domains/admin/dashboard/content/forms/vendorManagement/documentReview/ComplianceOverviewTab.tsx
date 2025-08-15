
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const ComplianceOverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Overall Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
          <Progress value={94.2} className="mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">2,234</div>
              <div className="text-sm text-gray-500">Compliant</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">127</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">234</div>
              <div className="text-sm text-gray-500">Non-Compliant</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Active Compliance Rules
            </span>
            <Button size="sm">Manage Rules</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Business License Validity</div>
                  <div className="text-sm text-gray-500">Must be valid and not expired</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Bank Statement Age</div>
                  <div className="text-sm text-gray-500">Must not be older than 3 months</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium">Identity Verification</div>
                  <div className="text-sm text-gray-500">Valid government-issued ID required</div>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Document Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">KYC Documents</span>
              <div className="flex items-center space-x-2">
                <Progress value={96} className="w-32" />
                <span className="text-sm font-medium">96%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Business Documents</span>
              <div className="flex items-center space-x-2">
                <Progress value={94} className="w-32" />
                <span className="text-sm font-medium">94%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Financial Documents</span>
              <div className="flex items-center space-x-2">
                <Progress value={89} className="w-32" />
                <span className="text-sm font-medium">89%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quality Certificates</span>
              <div className="flex items-center space-x-2">
                <Progress value={92} className="w-32" />
                <span className="text-sm font-medium">92%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
