
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterMainSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {/* Column 1: About GetIt */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-blue-300 mb-4">About GetIt</h4>
        <div className="space-y-2">
          <Link to="/about-us" className="text-sm text-gray-300 hover:text-white transition-colors block">About Us</Link>
          <Link to="/about-us#mission-vision" className="text-sm text-gray-300 hover:text-white transition-colors block">Our Mission</Link>
          <Link to="/about-us#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors block">How It Works</Link>
          <Link to="/about-us#success-stories" className="text-sm text-gray-300 hover:text-white transition-colors block">Success Stories</Link>
          <Link to="/about-us#careers" className="text-sm text-gray-300 hover:text-white transition-colors block">Careers</Link>
          <Link to="/about-us#press-media" className="text-sm text-gray-300 hover:text-white transition-colors block">Press & Media</Link>
          <Link to="/about-us#investor-relations" className="text-sm text-gray-300 hover:text-white transition-colors block">Investor Relations</Link>
          <Link to="/about-us#corporate-social-responsibility" className="text-sm text-gray-300 hover:text-white transition-colors block">Corporate Social Responsibility</Link>
        </div>
      </div>

      {/* Column 2: For Customers */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-green-300 mb-4">Shop With Confidence</h4>
        <div className="space-y-2">
          <Link to="/categories" className="text-sm text-gray-300 hover:text-white transition-colors block">Browse Categories</Link>
          <Link to="/offers" className="text-sm text-gray-300 hover:text-white transition-colors block">Today's Deals</Link>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Mobile App Download</a>
          <Link to="/order-tracking" className="text-sm text-gray-300 hover:text-white transition-colors block">Track Your Order</Link>
          <Link to="/returns-refunds" className="text-sm text-gray-300 hover:text-white transition-colors block">Return & Refund Policy</Link>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Customer Reviews</a>
          <Link to="/wishlist" className="text-sm text-gray-300 hover:text-white transition-colors block">Wishlist & Favorites</Link>
          <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Gift Cards & Vouchers</a>
        </div>
      </div>

      {/* Column 3: For Vendors */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-purple-300 mb-4">Sell On GetIt</h4>
        <div className="space-y-2">
          <Link to="/vendor/register" className="text-sm text-gray-300 hover:text-white transition-colors block">Become a Vendor</Link>
          <Link to="/vendor/register" className="text-sm text-gray-300 hover:text-white transition-colors block">Vendor Registration</Link>
          <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Seller Center Login</Link>
          <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Vendor Support</Link>
          <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Commission Structure</Link>
          <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Marketing Tools</Link>
          <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Performance Analytics</Link>
          <Link to="/seller-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Vendor Success Program</Link>
        </div>
      </div>

      {/* Column 4: Customer Support */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-yellow-300 mb-4">We're Here to Help</h4>
        <div className="space-y-2">
          <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Help Center</Link>
          <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Contact Us</Link>
          <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Live Chat Support</Link>
          <a href="https://wa.me/8801700123456" className="text-sm text-gray-300 hover:text-white transition-colors block">WhatsApp: +880-1700-123456</a>
          <a href="tel:09678123456" className="text-sm text-gray-300 hover:text-white transition-colors block">Customer Service: 09678-123456</a>
          <a href="mailto:support@getit.com.bd" className="text-sm text-gray-300 hover:text-white transition-colors block">Email: support@getit.com.bd</a>
          <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">Submit a Ticket</Link>
          <Link to="/help-center" className="text-sm text-gray-300 hover:text-white transition-colors block">FAQ & Guidelines</Link>
        </div>
      </div>
    </div>
  );
};
