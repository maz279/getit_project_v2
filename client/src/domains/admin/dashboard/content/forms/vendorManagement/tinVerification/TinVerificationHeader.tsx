
import React from 'react';
import { Receipt, Shield, AlertTriangle, Search, Settings, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export const TinVerificationHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Receipt className="h-6 w-6 mr-3 text-green-600" />
            TIN Verification & Tax Compliance
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive Tax Identification Number verification and tax compliance management system
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Verification Rules
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Tax Authorities
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by TIN number, vendor name, or business name..."
            className="pl-10 pr-4 py-3"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Expiring Soon
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Shield className="h-4 w-4 mr-2" />
            Auto-Verify
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Receipt className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>
    </div>
  );
};
