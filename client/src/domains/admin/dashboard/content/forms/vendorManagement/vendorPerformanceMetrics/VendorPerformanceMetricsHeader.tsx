
import React from 'react';
import { Button } from '@/shared/ui/button';
import { TrendingUp, BarChart3, Download, RefreshCw, Settings, AlertTriangle } from 'lucide-react';

export const VendorPerformanceMetricsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="mr-3 h-8 w-8 text-blue-600" />
            Vendor Performance Metrics
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📊 Vendor Management → Vendor Performance → Performance Metrics
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" />
            Comprehensive vendor performance monitoring, KPI tracking, and benchmarking system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts (23)
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure KPIs
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};
