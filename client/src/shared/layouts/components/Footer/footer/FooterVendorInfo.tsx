
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterVendorInfo: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-blue-300 mb-4">For Vendors</h4>
      <div className="space-y-2">
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Seller Center</Link>
        <Link to="/vendor/register" className="text-sm text-gray-300 hover:text-white transition-colors block">Start Selling</Link>
        <Link to="/vendor/register" className="text-sm text-gray-300 hover:text-white transition-colors block">Vendor Registration</Link>
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Seller University</Link>
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Marketing Tools</Link>
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Analytics Dashboard</Link>
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Commission Structure</Link>
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Payment Gateway</Link>
        <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Bulk Upload Tools</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Seller Support</Link>
      </div>
    </div>
  );
};
