
import React from 'react';

export const FooterSpecialPrograms: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-8 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Loyalty & Rewards */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-green-300 mb-4">GetIt Rewards Program</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">• Points & Cashback</p>
            <p className="text-sm text-gray-300">• Member Exclusive Deals</p>
            <p className="text-sm text-gray-300">• Birthday Rewards</p>
            <p className="text-sm text-gray-300">• Referral Program</p>
            <p className="text-sm text-gray-300">• VIP Membership Benefits</p>
          </div>
        </div>

        {/* Community Initiatives */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-blue-300 mb-4">Making a Difference</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">• Support Local Brands</p>
            <p className="text-sm text-gray-300">• Women Entrepreneurs Program</p>
            <p className="text-sm text-gray-300">• Rural Vendor Support</p>
            <p className="text-sm text-gray-300">• Education Initiatives</p>
            <p className="text-sm text-gray-300">• Environmental Responsibility</p>
            <p className="text-sm text-gray-300">• Digital Bangladesh Mission</p>
          </div>
        </div>
      </div>
    </div>
  );
};
