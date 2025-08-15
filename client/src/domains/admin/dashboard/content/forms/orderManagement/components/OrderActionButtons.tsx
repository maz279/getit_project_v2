
import React from 'react';
import { RefreshCw, Download, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const OrderActionButtons: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Create Order
      </Button>
    </div>
  );
};
