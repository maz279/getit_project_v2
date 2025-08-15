
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart3 } from 'lucide-react';

export const TinAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            TIN Analytics & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Advanced analytics for TIN processing, compliance trends, and verification metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
