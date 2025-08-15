
import React from 'react';

export const FooterEmergencySupport: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 24/7 Support */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-red-300 mb-2">Round-the-Clock Assistance</h4>
          <div className="space-y-1">
            <a href="tel:999" className="text-xs text-gray-300 hover:text-white transition-colors block">• Emergency Hotline: 999 (urgent delivery issues)</a>
            <p className="text-xs text-gray-300">• Customer Care: Available 6 AM - 12 AM</p>
            <p className="text-xs text-gray-300">• Technical Support: 24/7 online</p>
            <p className="text-xs text-gray-300">• Vendor Support: Business hours</p>
            <p className="text-xs text-gray-300">• Live Chat: Always available</p>
          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-purple-300 mb-2">Inclusive Design</h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• Screen Reader Compatible</p>
            <p className="text-xs text-gray-300">• Keyboard Navigation</p>
            <p className="text-xs text-gray-300">• High Contrast Mode</p>
            <p className="text-xs text-gray-300">• Font Size Adjustment</p>
            <p className="text-xs text-gray-300">• Multiple Language Support</p>
            <p className="text-xs text-gray-300">• Disability-Friendly Features</p>
          </div>
        </div>
      </div>
    </div>
  );
};
