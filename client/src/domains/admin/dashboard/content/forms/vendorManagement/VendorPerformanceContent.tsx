
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const VendorPerformanceContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Vendor Performance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Vendor performance tracking and analytics system will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
