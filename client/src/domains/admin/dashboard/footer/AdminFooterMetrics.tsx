
import React from 'react';
import { BarChart3 } from 'lucide-react';

export const AdminFooterMetrics: React.FC = () => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-600">
      <h3 className="text-xs font-bold text-red-300 flex items-center space-x-1 mb-2">
        <BarChart3 size={12} />
        <span>Real-time Platform Metrics</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="text-center">
          <div className="text-blue-300 font-bold text-xs">12,456</div>
          <div className="text-gray-400">Vendors</div>
        </div>
        <div className="text-center">
          <div className="text-green-300 font-bold text-xs">456,789</div>
          <div className="text-gray-400">Customers</div>
        </div>
        <div className="text-center">
          <div className="text-purple-300 font-bold text-xs">2,345,678</div>
          <div className="text-gray-400">Products</div>
        </div>
        <div className="text-center">
          <div className="text-orange-300 font-bold text-xs">8,234</div>
          <div className="text-gray-400">Orders Today</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-300 font-bold text-xs">15,67,890</div>
          <div className="text-gray-400">Revenue (BDT)</div>
        </div>
        <div className="text-center">
          <div className="text-cyan-300 font-bold text-xs">99.97%</div>
          <div className="text-gray-400">Uptime</div>
        </div>
      </div>
    </div>
  );
};
