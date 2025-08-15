
import React from 'react';
import { Link } from 'react-router-dom';

export const FooterCopyright: React.FC = () => {
  return (
    <div className="border-t border-gray-700 pt-6">
      {/* Copyright Information */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-400 mb-2">
          © 2024 GetIt Bangladesh Limited. All Rights Reserved.
        </p>
        <p className="text-sm text-blue-300 mb-3">
          Developed with ❤️ in Bangladesh | Empowering Local Businesses | Supporting Digital Economy
        </p>
      </div>

      {/* Quick Links Bottom Bar */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 pb-4">
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
          Responsive design • Fast loading • SEO-friendly • Accessibility compliant (WCAG 2.1) • Multi-language support
        </p>
      </div>
    </div>
  );
};
