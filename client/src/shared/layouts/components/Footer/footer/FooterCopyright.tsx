
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterCopyright: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="border-t border-gray-700 pt-2">
      {/* Copyright Information */}
      <div className="text-center mb-2">
        <p className="text-xs text-gray-400 mb-1">
          © {currentYear} GetIt Bangladesh Limited. All Rights Reserved.
        </p>
        <p className="text-xs text-blue-400 mb-2">
          Developed with ❤️ in Bangladesh | Empowering Local Businesses
        </p>
      </div>

      {/* Quick Links Bottom Bar */}
      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 pb-2">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>|</span>
        <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
        <span>|</span>
        <Link to="/offers" className="hover:text-white transition-colors">Deals</Link>
        <span>|</span>
        <Link to="/order-tracking" className="hover:text-white transition-colors">Track Order</Link>
        <span>|</span>
        <Link to="/help-center" className="hover:text-white transition-colors">Help</Link>
        <span>|</span>
        <a href="#" className="hover:text-white transition-colors">Download App</a>
        <span>|</span>
        <a href="#" className="hover:text-white transition-colors">বাংলা</a>
      </div>

      {/* Technical Implementation Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Responsive • Fast • SEO-friendly • WCAG 2.1 • Multi-language
        </p>
      </div>
    </div>
  );
};
