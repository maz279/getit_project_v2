
import React from 'react';

export const FooterRegionalSection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Areas */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-green-300 mb-4">Nationwide Coverage</h4>
          <div className="grid grid-cols-2 gap-2">
            <p className="text-sm text-gray-300">• Dhaka Division</p>
            <p className="text-sm text-gray-300">• Chittagong Division</p>
            <p className="text-sm text-gray-300">• Rajshahi Division</p>
            <p className="text-sm text-gray-300">• Sylhet Division</p>
            <p className="text-sm text-gray-300">• Barisal Division</p>
            <p className="text-sm text-gray-300">• Khulna Division</p>
            <p className="text-sm text-gray-300">• Rangpur Division</p>
            <p className="text-sm text-gray-300">• Mymensingh Division</p>
          </div>
        </div>

        {/* Language Support */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-purple-300 mb-4">Multi-Language Platform</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">• বাংলা (Bengali)</p>
            <p className="text-sm text-gray-300">• English</p>
            <p className="text-xs text-gray-400 mt-3">Customer support available in both languages</p>
          </div>
        </div>
      </div>
    </div>
  );
};
