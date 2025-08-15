
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart3 } from 'lucide-react';

export const BankingAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Banking Analytics & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Comprehensive banking analytics, verification trends, fraud statistics, and compliance reporting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
