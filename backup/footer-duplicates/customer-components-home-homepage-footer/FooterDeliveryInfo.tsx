
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterDeliveryInfo: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-blue-300 mb-4">Delivery & Logistics</h4>
      <div className="space-y-2">
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">Delivery Information</Link>
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">Same Day Delivery</Link>
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">Express Shipping</Link>
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">International Shipping</Link>
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">Delivery Areas</Link>
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">Shipping Calculator</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Delivery Issues</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Missing Package</Link>
        <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Damaged Items</Link>
        <Link to="/delivery-info" className="text-sm text-gray-300 hover:text-white transition-colors block">Schedule Delivery</Link>
      </div>
    </div>
  );
};
