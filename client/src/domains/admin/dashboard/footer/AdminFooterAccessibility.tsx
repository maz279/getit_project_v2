
import React from 'react';
import { Accessibility, UserCheck, VolumeX, KeyboardIcon, Eye, Type } from 'lucide-react';

export const AdminFooterAccessibility: React.FC = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
        <Accessibility size={12} />
        <span>Accessibility</span>
      </h3>
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-center space-x-1">
          <UserCheck size={8} className="text-green-300" />
          <span>WCAG 2.1 AA Compliant</span>
        </div>
        <div className="flex items-center space-x-1">
          <VolumeX size={8} className="text-blue-300" />
          <span>Screen Reader Compatible</span>
        </div>
        <div className="flex items-center space-x-1">
          <KeyboardIcon size={8} className="text-purple-300" />
          <span>Keyboard Navigation</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye size={8} className="text-orange-300" />
          <span>High Contrast Mode</span>
        </div>
        <div className="flex items-center space-x-1">
          <Type size={8} className="text-yellow-300" />
          <span>Font Size Adjustment</span>
        </div>
      </div>
    </div>
  );
};
