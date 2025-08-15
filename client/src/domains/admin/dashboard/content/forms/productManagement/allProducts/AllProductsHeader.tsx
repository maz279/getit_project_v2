
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Package, Plus, Upload, Download, RefreshCw, Settings, BarChart3, AlertTriangle } from 'lucide-react';

export const AllProductsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Package className="mr-3 h-8 w-8 text-blue-600" />
            All Products Management
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📦 Product Management → Product Catalog → All Products
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" />
            Comprehensive product catalog management, inventory tracking, and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts (5)
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
    </div>
  );
};
