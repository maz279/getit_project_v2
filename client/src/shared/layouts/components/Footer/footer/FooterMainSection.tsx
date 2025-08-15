
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Users, Target, Award } from 'lucide-react';

// Custom navigation handler to avoid async listener conflicts
const handleAnchorNavigation = (href: string, e?: React.MouseEvent) => {
  if (e) {
    e.preventDefault();
  }
  
  const [pathname, hash] = href.split('#');
  
  // If we're already on the target page, just scroll to anchor
  if (window.location.pathname === pathname) {
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    return;
  }
  
  // Navigate to page first, then scroll after a delay
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  if (hash) {
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
};

export const FooterMainSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
      {/* Column 1: About GetIt */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
          <Building2 className="w-3 h-3 mr-1" />
          About GetIt
        </h4>
        <div className="space-y-1">
          <Link to="/about-us" className="text-xs text-gray-300 hover:text-white transition-colors block">📖 About Us</Link>
          <a onClick={(e) => handleAnchorNavigation('/about-us#mission-vision', e)} href="/about-us#mission-vision" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">🎯 Our Mission & Vision</a>
          <a onClick={(e) => handleAnchorNavigation('/about-us#company-values', e)} href="/about-us#company-values" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">⭐ Company Values</a>
          <a onClick={(e) => handleAnchorNavigation('/about-us#technology', e)} href="/about-us#technology" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">🚀 Our Technology</a>
          <a onClick={(e) => handleAnchorNavigation('/about-us#how-it-works', e)} href="/about-us#how-it-works" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">⚙️ How It Works</a>
          <a onClick={(e) => handleAnchorNavigation('/about-us#success-stories', e)} href="/about-us#success-stories" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">📈 Success Stories</a>
          <a onClick={(e) => handleAnchorNavigation('/about-us#careers', e)} href="/about-us#careers" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">💼 Careers</a>
          <a onClick={(e) => handleAnchorNavigation('/about-us#press-media', e)} href="/about-us#press-media" className="text-xs text-gray-300 hover:text-white transition-colors block cursor-pointer">📰 Press & Media</a>
        </div>
      </div>

      {/* Column 2: For Customers */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
          <Users className="w-3 h-3 mr-1" />
          Shop With Confidence
        </h4>
        <div className="space-y-1">
          <Link to="/categories" className="text-xs text-gray-300 hover:text-white transition-colors block">Browse Categories</Link>
          <Link to="/offers" className="text-xs text-gray-300 hover:text-white transition-colors block">Today's Deals</Link>
          <Link to="/mobile-app" className="text-xs text-gray-300 hover:text-white transition-colors block">Mobile App</Link>
          <Link to="/order-tracking" className="text-xs text-gray-300 hover:text-white transition-colors block">Track Order</Link>
          <Link to="/returns-refunds" className="text-xs text-gray-300 hover:text-white transition-colors block">Returns</Link>
        </div>
      </div>

      {/* Column 3: For Vendors */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
          <Target className="w-3 h-3 mr-1" />
          Sell On GetIt
        </h4>
        <div className="space-y-1">
          <Link to="/vendor/register" className="text-xs text-gray-300 hover:text-white transition-colors block">Become a Vendor</Link>
          <Link to="/seller-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Seller Center</Link>
          <Link to="/help-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Vendor Support</Link>
          <Link to="/seller-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Commission Info</Link>
          <Link to="/seller-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Marketing Tools</Link>
        </div>
      </div>

      {/* Column 4: Customer Support */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
          <Award className="w-3 h-3 mr-1" />
          We're Here to Help
        </h4>
        <div className="space-y-2">
          <Link to="/help-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Help Center</Link>
          <Link to="/help-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Contact Us</Link>
          <Link to="/help-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Live Chat Support</Link>
          <a href="https://wa.me/8801700123456" className="text-xs text-gray-300 hover:text-white transition-colors block">WhatsApp: +880-1700-123456</a>
          <a href="tel:09678123456" className="text-xs text-gray-300 hover:text-white transition-colors block">Customer Service: 09678-123456</a>
          <a href="mailto:support@getit.com.bd" className="text-xs text-gray-300 hover:text-white transition-colors block">Email: support@getit.com.bd</a>
          <Link to="/help-center" className="text-xs text-gray-300 hover:text-white transition-colors block">Submit a Ticket</Link>
          <Link to="/help-center" className="text-xs text-gray-300 hover:text-white transition-colors block">FAQ & Guidelines</Link>
        </div>
      </div>
    </div>
  );
};
