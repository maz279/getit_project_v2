
import React from 'react';
import { Button } from '@/shared/ui/button';
import { ClipboardCheck, Star, FileText, Download, RefreshCw, Settings, Plus } from 'lucide-react';

export const VendorScorecardHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ClipboardCheck className="mr-3 h-8 w-8 text-green-600" />
            Vendor Scorecard System
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📋 Vendor Management → Vendor Performance → Vendor Scorecard
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Star className="h-3 w-3 mr-1" />
            Comprehensive vendor evaluation, rating, and assessment management system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Assessment Forms
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Rating Criteria
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
