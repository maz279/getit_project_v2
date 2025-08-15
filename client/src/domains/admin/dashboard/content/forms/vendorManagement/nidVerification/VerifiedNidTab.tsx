
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CheckCircle } from 'lucide-react';

export const VerifiedNidTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Verified NID Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Display of all verified National ID records with compliance monitoring and renewal tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
