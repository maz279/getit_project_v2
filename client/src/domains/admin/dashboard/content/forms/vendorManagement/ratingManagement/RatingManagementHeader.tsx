
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Star, Shield, BarChart3, Download, RefreshCw, Settings, AlertTriangle } from 'lucide-react';

export const RatingManagementHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Star className="mr-3 h-8 w-8 text-yellow-600" />
            Rating Management System
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            ⭐ Vendor Management → Vendor Performance → Rating Management
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Comprehensive vendor and product rating system with moderation, analytics, and dispute resolution
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Flagged Reviews (12)
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rating Insights
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
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
