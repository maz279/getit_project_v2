
import React from 'react';
import { DollarSign, RefreshCw, Download, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          Revenue Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Comprehensive revenue tracking and performance analytics</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>
    </div>
  );
};
