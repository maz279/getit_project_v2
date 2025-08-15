
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { XCircle } from 'lucide-react';

export const ExpiredTinTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-600" />
            Expired & Problem TINs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Management of expired TINs, renewal reminders, and compliance issue resolution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
