
import React from 'react';
import { Button } from '@/shared/ui/button';
import { BarChart3, Download, RefreshCw, Settings, TrendingUp } from 'lucide-react';

export const OrderReportsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
            Order Reports & Analytics
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📦 Order Management → Order Analytics → Order Reports
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Comprehensive insights into order performance, customer behavior, and business trends
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
