
import React from 'react';
import { Cpu, Code, Zap } from 'lucide-react';

export const FooterTechnologySection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-2 mb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <Cpu className="w-3 h-3 mr-1" />
            Technology
          </h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• AI-Powered Recommendations</p>
            <p className="text-xs text-gray-300">• Smart Search & Filters</p>
            <p className="text-xs text-gray-300">• Real-time Inventory</p>
            <p className="text-xs text-gray-300">• Advanced Analytics</p>
            <p className="text-xs text-gray-300">• Machine Learning</p>
          </div>
        </div>

        {/* Developer Resources */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <Code className="w-3 h-3 mr-1" />
            Developers
          </h4>
          <div className="space-y-1">
            <button onClick={() => window.open('/api-docs', '_blank')} className="text-xs text-gray-300 hover:text-white transition-colors block text-left">• API Documentation</button>
            <button onClick={() => window.open('/sdk-downloads', '_blank')} className="text-xs text-gray-300 hover:text-white transition-colors block text-left">• SDK Downloads</button>
            <button onClick={() => window.open('/integration-guides', '_blank')} className="text-xs text-gray-300 hover:text-white transition-colors block text-left">• Integration Guides</button>
            <button onClick={() => window.open('/developer-portal', '_blank')} className="text-xs text-gray-300 hover:text-white transition-colors block text-left">• Developer Portal</button>
            <button onClick={() => window.open('/tech-support', '_blank')} className="text-xs text-gray-300 hover:text-white transition-colors block text-left">• Tech Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};
