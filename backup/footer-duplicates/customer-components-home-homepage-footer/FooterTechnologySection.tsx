
import React from 'react';

export const FooterTechnologySection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Platform Features */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-purple-300 mb-4">Advanced Technology</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">• AI-Powered Recommendations</p>
            <p className="text-sm text-gray-300">• Smart Search & Filters</p>
            <p className="text-sm text-gray-300">• Real-time Inventory</p>
            <p className="text-sm text-gray-300">• Advanced Analytics</p>
            <p className="text-sm text-gray-300">• Machine Learning</p>
            <p className="text-sm text-gray-300">• Multi-vendor Management</p>
          </div>
        </div>

        {/* Developer Resources */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-yellow-300 mb-4">For Developers</h4>
          <div className="space-y-2">
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">• API Documentation</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">• SDK Downloads</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">• Integration Guides</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">• Developer Portal</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">• Technical Support</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">• Sandbox Environment</a>
          </div>
        </div>
      </div>
    </div>
  );
};
