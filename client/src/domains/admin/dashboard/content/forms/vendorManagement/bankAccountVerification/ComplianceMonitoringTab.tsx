
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Shield } from 'lucide-react';

export const ComplianceMonitoringTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Banking Compliance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Regulatory compliance tracking, AML screening, sanctions checks, and audit trail management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
