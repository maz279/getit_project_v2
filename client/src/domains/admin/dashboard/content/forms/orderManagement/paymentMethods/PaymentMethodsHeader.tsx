
import React from 'react';
import { Button } from '@/shared/ui/button';
import { 
  CreditCard,
  Clock,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';

export const PaymentMethodsHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <CreditCard className="mr-3 h-8 w-8 text-purple-600" />
            Payment Methods Management
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            📍 Order Management → Payment Management → Payment Methods
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last Updated: {new Date().toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
      </div>
    </div>
  );
};
