
import React from 'react';

export const FooterSecondarySection: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Methods */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-green-300 mb-2">Secure Payment Options</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-gray-300 mb-1">Local Mobile Banking</p>
              <div className="flex space-x-1 mb-1">
                <div className="w-10 h-6 bg-pink-500 rounded text-xs flex items-center justify-center font-bold text-white">bKash</div>
                <div className="w-10 h-6 bg-orange-500 rounded text-xs flex items-center justify-center font-bold text-white">Nagad</div>
                <div className="w-10 h-6 bg-purple-600 rounded text-xs flex items-center justify-center font-bold text-white">Rocket</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-300 mb-1">International Methods</p>
              <div className="flex space-x-1 mb-1">
                <div className="w-10 h-6 bg-blue-600 rounded text-xs flex items-center justify-center font-bold text-white">VISA</div>
                <div className="w-10 h-6 bg-red-600 rounded text-xs flex items-center justify-center font-bold text-white">MC</div>
                <div className="w-10 h-6 bg-blue-500 rounded text-xs flex items-center justify-center font-bold text-white">PayPal</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">Cash on Delivery (COD) • Bank Transfer</p>
          </div>
        </div>

        {/* Shipping Partners */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-blue-300 mb-2">Trusted Delivery Network</h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• Pathao (Same-day delivery in Dhaka)</p>
            <p className="text-xs text-gray-300">• Paperfly (Nationwide coverage)</p>
            <p className="text-xs text-gray-300">• Sundarban Courier (Economy shipping)</p>
            <p className="text-xs text-gray-300">• RedX (Technology-focused delivery)</p>
            <p className="text-xs text-gray-300">• eCourier (E-commerce specialized)</p>
            <p className="text-xs text-gray-300">• Pickup Points (500+ locations nationwide)</p>
          </div>
        </div>

        {/* Security & Trust */}
        <div className="space-y-2">
          <h4 className="text-base font-bold text-red-300 mb-2">Your Security, Our Priority</h4>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">• PCI DSS Compliant</p>
            <p className="text-xs text-gray-300">• SSL Secured Transactions</p>
            <p className="text-xs text-gray-300">• 256-bit Encryption</p>
            <p className="text-xs text-gray-300">• Fraud Protection</p>
            <p className="text-xs text-gray-300">• Secure Checkout</p>
            <p className="text-xs text-gray-300">• Data Privacy Protected</p>
            <p className="text-xs text-gray-300">• Bangladesh Bank Approved</p>
          </div>
        </div>
      </div>
    </div>
  );
};
