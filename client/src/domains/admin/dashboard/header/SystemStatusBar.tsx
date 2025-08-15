
import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Languages, 
  DollarSign 
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip';

interface SystemStatusBarProps {
  systemStatus: {
    overall: string;
    database: string;
    paymentGateways: string;
    apiStatus: string;
    serverLoad: string;
    activeUsers: string;
  };
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  systemStatus,
  language,
  setLanguage,
  currency,
  setCurrency
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-4 py-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-6">
          {/* System Status Indicators - Compressed */}
          <div className="hidden lg:flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">System: {systemStatus.overall}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between space-x-4">
                    <span>Database:</span>
                    <span className="text-green-400">{systemStatus.database}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <span>Payment:</span>
                    <span className="text-green-400">{systemStatus.paymentGateways}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <span>API:</span>
                    <span className="text-green-400">{systemStatus.apiStatus}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
            
            <div className="flex items-center space-x-1">
              <Users size={10} />
              <span className="text-xs">Active: {systemStatus.activeUsers}</span>
            </div>
          </div>
        </div>

        {/* Current Time & Language/Currency - Compressed */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1">
            <Clock size={10} />
            <span className="text-xs">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Language & Currency Selector */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-6 px-2 text-xs">
                  <Languages size={10} className="mr-1" />
                  {language === 'en' ? 'EN' : 'বাং'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white z-50">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English {language === 'en' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('bn')}>
                  বাংলা {language === 'bn' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-6 px-2 text-xs">
                  <DollarSign size={10} className="mr-1" />
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white z-50">
                <DropdownMenuItem onClick={() => setCurrency('BDT')}>
                  BDT {currency === 'BDT' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrency('USD')}>
                  USD {currency === 'USD' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
