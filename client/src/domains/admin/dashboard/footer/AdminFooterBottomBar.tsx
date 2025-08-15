
import React from 'react';
import { RefreshCw, Timer, Users, Globe, Monitor } from 'lucide-react';

export const AdminFooterBottomBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-blue-900 border-t border-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-1 lg:space-y-0 text-xs text-gray-400">
          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <RefreshCw size={8} className="text-green-300" />
                <span>Last Updated: June 23, 2025 at 2:45 PM</span>
              </span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center space-x-1">
                <Timer size={8} className="text-yellow-300" />
                <span>Session: Expires in 45 min</span>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-3">
            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
              <span className="flex items-center space-x-1">
                <Users size={8} className="text-blue-300" />
                <span>User: john.doe@getit.com.bd</span>
              </span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center space-x-1">
                <Globe size={8} className="text-purple-300" />
                <span>IP: 103.xxx.xxx.xxx (Dhaka)</span>
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-3">
              <span className="flex items-center space-x-1">
                <Monitor size={8} className="text-cyan-300" />
                <span>1920x1080</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
