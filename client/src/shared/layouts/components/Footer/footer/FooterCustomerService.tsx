
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterCustomerService: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-blue-300 mb-4">Customer Service</h4>
      <div className="space-y-2">
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Help Center</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Live Chat Support</Link>
        <Link to="/order-tracking" className="text-sm text-gray-300 hover:text-white transition-colors block">Order Tracking</Link>
        <Link to="/returns-refunds" className="text-sm text-gray-300 hover:text-white transition-colors block">Return & Refunds</Link>
        <Link to="/returns-refunds" className="text-sm text-gray-300 hover:text-white transition-colors block">Exchange Policy</Link>
        <Link to="/returns-refunds" className="text-sm text-gray-300 hover:text-white transition-colors block">Warranty Claims</Link>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Product Reviews</a>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Report an Issue</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Buyer Protection</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">FAQ</Link>
      </div>
    </div>
  );
};
