
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export const VendorOnboardingContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Vendor Onboarding</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vendor Onboarding Process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Vendor onboarding management system will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
