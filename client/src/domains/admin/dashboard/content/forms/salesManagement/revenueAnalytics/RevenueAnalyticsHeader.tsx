
import React from 'react';
import { Button } from '@/shared/ui/button';
import { DollarSign, Download, RefreshCw, Settings, TrendingUp } from 'lucide-react';

export const RevenueAnalyticsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <DollarSign className="mr-3 h-8 w-8 text-green-600" />
            Revenue Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            💰 Sales Management → Revenue Analytics → Advanced Analytics
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Comprehensive revenue insights, forecasting, and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
