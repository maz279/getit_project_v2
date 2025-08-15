
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { CreditCard, Shield, AlertTriangle, TrendingUp, Download, RefreshCw } from 'lucide-react';

export const BankAccountVerificationHeader: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-8 w-8 mr-3 text-blue-600" />
            Bank Account Verification Center
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive banking verification system for vendor account validation, compliance monitoring, and fraud prevention
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync with Banks
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Shield className="h-4 w-4 mr-2" />
            Run Compliance Check
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Account Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Automated and manual verification of vendor bank accounts with multi-layer validation
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Fraud Prevention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Advanced fraud detection, AML screening, and risk assessment for financial security
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
              Compliance Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Real-time compliance tracking, regulatory reporting, and audit trail management
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
