
import React from 'react';
import { Button } from '@/shared/ui/button';
import { RefreshCw, Download, Settings, Clock } from 'lucide-react';

export const RefundProcessingHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <RefreshCw className="mr-3 h-8 w-8 text-blue-600" />
            Refund Processing Management
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📍 Order Management → Payment Management → Refund Processing
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last Updated: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            Refund Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
