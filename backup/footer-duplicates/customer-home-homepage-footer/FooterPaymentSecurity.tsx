
import React from 'react';

export const FooterPaymentSecurity: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-green-300 mb-4">Payment & Security</h4>
      <div className="space-y-2">
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Payment Methods</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Digital Wallets</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Installment Plans</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Gift Cards</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Security Center</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Fraud Protection</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Account Security</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Data Protection</a>
      </div>
    </div>
  );
};
