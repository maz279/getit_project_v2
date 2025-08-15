
import React from 'react';
import { Building, Heart, Code, Layers, Cloud } from 'lucide-react';

export const AdminFooterCopyright: React.FC = () => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-600">
      <h3 className="text-xs font-bold text-amber-300 flex items-center space-x-1 mb-2">
        <Building size={12} />
        <span>Copyright & Attribution</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-300">
        <div className="flex items-center space-x-1">
          <Heart size={8} className="text-red-300" />
          <span>© 2025 GetIt Platform</span>
        </div>
        <div className="flex items-center space-x-1">
          <Code size={8} className="text-blue-300" />
          <span>GetIt Technology Team</span>
        </div>
        <div className="flex items-center space-x-1">
          <Layers size={8} className="text-purple-300" />
          <span>Microservices Architecture</span>
        </div>
        <div className="flex items-center space-x-1">
          <Cloud size={8} className="text-green-300" />
          <span>Hosted on AWS Infrastructure</span>
        </div>
      </div>
    </div>
  );
};
