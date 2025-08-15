
import React from 'react';
import { CheckCircle2, Truck, Route, Package, Clock, AlertCircle } from 'lucide-react';

interface StatusIconProps {
  status: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
    case 'out_for_delivery': return <Truck className="h-4 w-4" />;
    case 'in_transit': return <Route className="h-4 w-4" />;
    case 'picked_up': return <Package className="h-4 w-4" />;
    case 'delayed': return <Clock className="h-4 w-4" />;
    case 'failed': return <AlertCircle className="h-4 w-4" />;
    default: return <Package className="h-4 w-4" />;
  }
};
