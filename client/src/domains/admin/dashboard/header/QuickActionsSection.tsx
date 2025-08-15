
import React from 'react';
import { 
  Plus, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Wrench, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

export const QuickActionsSection: React.FC = () => {
  const quickActions = [
    { icon: Plus, label: 'Add Product', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: CheckCircle, label: 'Approve Vendor', color: 'bg-green-500 hover:bg-green-600' },
    { icon: DollarSign, label: 'Process Payout', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: FileText, label: 'Generate Report', color: 'bg-orange-500 hover:bg-orange-600' },
    { icon: Wrench, label: 'Maintenance', color: 'bg-gray-500 hover:bg-gray-600' },
    { icon: AlertTriangle, label: 'Emergency Stop', color: 'bg-red-500 hover:bg-red-600' }
  ];

  return (
    <div className="hidden xl:flex items-center space-x-2">
      {quickActions.slice(0, 4).map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className={`${action.color} text-white px-3 py-2`}
              >
                <IconComponent size={12} className="mr-2" />
                <span className="hidden 2xl:inline">{action.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {action.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
