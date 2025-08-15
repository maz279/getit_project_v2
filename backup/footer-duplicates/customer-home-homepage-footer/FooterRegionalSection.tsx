
import React from 'react';

export const FooterRegionalSection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Areas */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-green-300 mb-2">Nationwide Coverage</h4>
          <div className="grid grid-cols-2 gap-1">
            <p className="text-xs text-gray-300">• Dhaka Division</p>
            <p className="text-xs text-gray-300">• Chittagong Division</p>
            <p className="text-xs text-gray-300">• Rajshahi Division</p>
            <p className="text-xs text-gray-300">• Sylhet Division</p>
            <p className="text-xs text-gray-300">• Barisal Division</p>
            <p className="text-xs text-gray-300">• Khulna Division</p>
            <p className="text-xs text-gray-300">• Rangpur Division</p>
            <p className="text-xs text-gray-300">• Mymensingh Division</p>
          </div>
        </div>

        {/* Language Support */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-purple-300 mb-2">Multi-Language Platform</h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• বাংলা (Bengali)</p>
            <p className="text-xs text-gray-300">• English</p>
            <p className="text-xs text-gray-400 mt-1">Customer support available in both languages</p>
          </div>
        </div>
      </div>
    </div>
  );
};
