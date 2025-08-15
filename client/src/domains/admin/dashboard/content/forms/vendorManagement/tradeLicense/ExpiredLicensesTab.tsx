
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { XCircle } from 'lucide-react';

export const ExpiredLicensesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-600" />
            Expired Trade Licenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Management of expired licenses with renewal reminders and compliance actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
