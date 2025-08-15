
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { AlertTriangle } from 'lucide-react';

export const FraudDetectionTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Fraud Detection & Prevention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Advanced fraud detection algorithms, suspicious activity monitoring, and risk assessment tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
