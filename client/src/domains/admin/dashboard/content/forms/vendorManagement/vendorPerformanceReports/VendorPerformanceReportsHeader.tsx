
import React from 'react';
import { Button } from '@/shared/ui/button';
import { FileText, BarChart3, Download, RefreshCw, Settings, AlertTriangle, Plus } from 'lucide-react';

export const VendorPerformanceReportsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            Vendor Performance Reports
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📊 Vendor Management → Vendor Performance → Performance Reports
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" />
            Comprehensive vendor performance reporting system similar to Amazon Seller Central & Shopee Seller Centre
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Active Alerts (23)
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Report Settings
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>
    </div>
  );
};
