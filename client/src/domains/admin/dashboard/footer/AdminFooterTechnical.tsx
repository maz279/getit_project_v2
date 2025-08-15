
import React from 'react';
import { Server, Settings, Hash, Database, Cloud, RefreshCw, Calendar } from 'lucide-react';

export const AdminFooterTechnical: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-purple-300 flex items-center space-x-1">
        <Server size={12} />
        <span>Technical Information</span>
      </h3>
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Settings size={8} className="text-blue-300" />
            <span>Platform Version:</span>
          </span>
          <span className="text-green-300 font-medium">2.0.1</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Hash size={8} className="text-cyan-300" />
            <span>Build Number:</span>
          </span>
          <span className="text-green-300 font-medium">20250623.001</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Database size={8} className="text-purple-300" />
            <span>Database:</span>
          </span>
          <span className="text-green-300 font-medium">PostgreSQL 14.2</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Cloud size={8} className="text-orange-300" />
            <span>Environment:</span>
          </span>
          <span className="text-green-300 font-medium">Production</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <RefreshCw size={8} className="text-emerald-300" />
            <span>Last Update:</span>
          </span>
          <span className="text-yellow-300 font-medium">June 20, 2025</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Calendar size={8} className="text-red-300" />
            <span>Next Maintenance:</span>
          </span>
          <span className="text-yellow-300 font-medium">June 30, 2025</span>
        </div>
      </div>
    </div>
  );
};
