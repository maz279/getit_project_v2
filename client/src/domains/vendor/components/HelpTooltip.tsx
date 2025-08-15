/**
 * HelpTooltip Component - Contextual Help for Vendor Registration
 * Amazon.com/Shopee.sg Level Help System
 */

import React from 'react';
import { HelpCircle, Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

interface HelpTooltipProps {
  content: string;
  type?: 'info' | 'help' | 'warning';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

const iconMap = {
  info: Info,
  help: HelpCircle,
  warning: AlertCircle,
};

const colorMap = {
  info: 'text-blue-500 hover:text-blue-700',
  help: 'text-gray-500 hover:text-gray-700',
  warning: 'text-orange-500 hover:text-orange-700',
};

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  type = 'help',
  side = 'top',
  className = '',
}) => {
  const Icon = iconMap[type];
  const iconColor = colorMap[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center w-4 h-4 ml-1 ${iconColor} ${className}`}
          >
            <Icon className="w-4 h-4" />
            <span className="sr-only">Help information</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HelpTooltip;