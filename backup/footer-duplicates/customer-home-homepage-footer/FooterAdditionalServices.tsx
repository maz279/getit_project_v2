
import React from 'react';

export const FooterAdditionalServices: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Solutions */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-green-300 mb-2">Enterprise Services</h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• GetIt for Business</p>
            <p className="text-xs text-gray-300">• Bulk Order Solutions</p>
            <p className="text-xs text-gray-300">• Corporate Accounts</p>
            <p className="text-xs text-gray-300">• API Integration</p>
            <p className="text-xs text-gray-300">• White-label Solutions</p>
            <p className="text-xs text-gray-300">• Marketplace Development</p>
          </div>
        </div>

        {/* Value-Added Services */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-blue-300 mb-2">Enhanced Shopping Experience</h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• Personal Shopping Assistant</p>
            <p className="text-xs text-gray-300">• Virtual Try-On (selected categories)</p>
            <p className="text-xs text-gray-300">• Product Customization</p>
            <p className="text-xs text-gray-300">• Installation Services</p>
            <p className="text-xs text-gray-300">• Extended Warranty</p>
            <p className="text-xs text-gray-300">• Product Insurance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
