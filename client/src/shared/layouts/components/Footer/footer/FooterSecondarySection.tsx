
import React from 'react';
import { CreditCard, Truck, Shield } from 'lucide-react';

export const FooterSecondarySection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-2 mb-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <CreditCard className="w-3 h-3 mr-1" />
            Secure Payment Options
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-300 mb-1">Local Mobile Banking</p>
              <div className="flex space-x-1 mb-1">
                <div className="w-10 h-6 bg-pink-500 rounded text-xs flex items-center justify-center font-bold text-white">bKash</div>
                <div className="w-10 h-6 bg-orange-500 rounded text-xs flex items-center justify-center font-bold text-white">Nagad</div>
                <div className="w-10 h-6 bg-purple-600 rounded text-xs flex items-center justify-center font-bold text-white">Rocket</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-300 mb-1">International</p>
              <div className="flex space-x-1 mb-1">
                <div className="w-10 h-6 bg-blue-600 rounded text-xs flex items-center justify-center font-bold text-white">VISA</div>
                <div className="w-10 h-6 bg-red-600 rounded text-xs flex items-center justify-center font-bold text-white">MC</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">COD • Bank Transfer</p>
          </div>
        </div>

        {/* Shipping Partners */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <Truck className="w-3 h-3 mr-1" />
            Delivery Network
          </h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• Pathao (Same-day Dhaka)</p>
            <p className="text-xs text-gray-300">• Paperfly (Nationwide)</p>
            <p className="text-xs text-gray-300">• RedX (Express)</p>
            <p className="text-xs text-gray-300">• eCourier (E-commerce)</p>
            <p className="text-xs text-gray-300">• 500+ Pickup Points</p>
          </div>
        </div>

        {/* Security & Trust */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            Security & Trust
          </h4>
          <div className="space-y-1">
            <p className="text-2xs text-gray-400">• PCI DSS Compliant</p>
            <p className="text-2xs text-gray-400">• SSL Secured</p>
            <p className="text-2xs text-gray-400">• 256-bit Encryption</p>
            <p className="text-2xs text-gray-400">• Fraud Protection</p>
            <p className="text-2xs text-gray-400">• Bangladesh Bank Approved</p>
          </div>
        </div>
      </div>
    </div>
  );
};
