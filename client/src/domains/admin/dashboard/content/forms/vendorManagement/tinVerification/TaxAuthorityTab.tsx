
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Building } from 'lucide-react';

export const TaxAuthorityTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-indigo-600" />
            Tax Authority Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Management of tax authorities, verification APIs, and regulatory compliance requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
