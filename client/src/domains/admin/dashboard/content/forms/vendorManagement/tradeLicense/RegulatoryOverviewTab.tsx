
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Building } from 'lucide-react';

export const RegulatoryOverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-indigo-600" />
            Regulatory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Overview of regulatory requirements, authority contacts, and compliance guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
