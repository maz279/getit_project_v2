
import React from 'react';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, Settings, FileCheck, Building } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export const TradeLicenseHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-3 text-blue-600" />
            Trade License Verification & Compliance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive business registration and regulatory compliance verification system
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Verification Settings
          </Button>
          <Button variant="outline" size="sm">
            <Building className="h-4 w-4 mr-2" />
            Regulatory Rules
          </Button>
          <Button>
            <FileCheck className="h-4 w-4 mr-2" />
            Bulk Verification
          </Button>
        </div>
      </div>

      {/* Quick Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by license number, business name, or vendor..."
            className="pl-4 pr-4 py-3"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Clock className="h-4 w-4 mr-2" />
            Expiring Soon
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <CheckCircle className="h-4 w-4 mr-2" />
            Quick Approve
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <XCircle className="h-4 w-4 mr-2" />
            Non-Compliant
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <AlertTriangle className="h-4 w-4 mr-2" />
            High Risk
          </Button>
        </div>
      </div>
    </div>
  );
};
