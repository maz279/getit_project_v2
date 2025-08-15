import React from 'react';
import { Link } from 'react-router-dom';

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
import { 
  Building2, Users, Target, Award, CreditCard, Truck, Shield, Globe, 
  FileText, Briefcase, MessageCircle, Cpu, Gift, Phone, Copyright,
  MapPin, Heart, Zap, Users2, ShoppingBag, Headphones, Star, Lock,
  Smartphone, Banknote, Package, CheckCircle
} from 'lucide-react';

// Brand Icons Component for better organization
const BrandIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "w-8 h-5" }) => {
  const brands = {
    bkash: <div className={`bg-pink-500 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>bKash</div>,
    nagad: <div className={`bg-orange-500 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>Nagad</div>,
    rocket: <div className={`bg-purple-600 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>Rocket</div>,
    visa: <div className={`bg-blue-600 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>VISA</div>,
    mastercard: <div className={`bg-red-600 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>MC</div>,
    pathao: <div className={`bg-green-600 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>Pathao</div>,
    paperfly: <div className={`bg-blue-700 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>Paperfly</div>,
    redx: <div className={`bg-red-700 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>RedX</div>,
    ecourier: <div className={`bg-indigo-600 rounded text-xs flex items-center justify-center font-bold text-white ${className}`}>eCourier</div>
  };
  
  return brands[type] || <div className={className}>{type}</div>;
};

export const GridFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Grid Layout - 4x4 Grid (16 equal sections) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Section 1: About GetIt - Blue Gradient */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <div className="w-4 h-4 mr-2 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 rounded flex items-center justify-center border border-white">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              About GetIt
            </h4>
            <div className="text-xs text-blue-100 leading-relaxed">
              <Link to="/about-us" className="hover:text-white transition-colors">🏢 About Us</Link>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#mission-vision', e)} href="/about-us#mission-vision" className="hover:text-white transition-colors cursor-pointer">🎯 Our Mission</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#how-it-works', e)} href="/about-us#how-it-works" className="hover:text-white transition-colors cursor-pointer">⚙️ How It Works</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#success-stories', e)} href="/about-us#success-stories" className="hover:text-white transition-colors cursor-pointer">📈 Success Stories</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#careers', e)} href="/about-us#careers" className="hover:text-white transition-colors cursor-pointer">💼 Careers</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#our-team', e)} href="/about-us#our-team" className="hover:text-white transition-colors cursor-pointer">👥 Our Team</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#company-values', e)} href="/about-us#company-values" className="hover:text-white transition-colors cursor-pointer">⭐ Company Values</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#achievements', e)} href="/about-us#achievements" className="hover:text-white transition-colors cursor-pointer">🏅 Achievements</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#sustainability', e)} href="/about-us#sustainability" className="hover:text-white transition-colors cursor-pointer">🌱 Sustainability</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#press-media', e)} href="/about-us#press-media" className="hover:text-white transition-colors cursor-pointer">📰 Press & Media</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#community', e)} href="/about-us#community" className="hover:text-white transition-colors cursor-pointer">❤️ Community Impact</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#innovation', e)} href="/about-us#innovation" className="hover:text-white transition-colors cursor-pointer">💡 Innovation Hub</a>
              <span className="text-blue-200 mx-2">•</span>
              <a onClick={(e) => handleAnchorNavigation('/about-us#awards', e)} href="/about-us#awards" className="hover:text-white transition-colors cursor-pointer">🏆 Awards</a>
            </div>
          </div>

          {/* Section 2: Customer Shopping - Green Gradient */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop & Browse
            </h4>
            <div className="text-xs text-green-100 leading-relaxed">
              <Link to="/categories" className="hover:text-white transition-colors">🏪 Browse Categories</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/offers" className="hover:text-white transition-colors">🔥 Today's Deals</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/order-tracking" className="hover:text-white transition-colors">📦 Track Order</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/returns-refunds" className="hover:text-white transition-colors">↩️ Returns</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/wishlist" className="hover:text-white transition-colors">❤️ Wishlist</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/bestsellers" className="hover:text-white transition-colors">⭐ Best Sellers</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/new-arrivals" className="hover:text-white transition-colors">✨ New Arrivals</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/flash-sales" className="hover:text-white transition-colors">⚡ Flash Sales</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/gift-cards" className="hover:text-white transition-colors">🎁 Gift Cards</Link>
              <span className="text-green-200 mx-2">•</span>
              <Link to="/reviews" className="hover:text-white transition-colors">📝 Product Reviews</Link>
            </div>
          </div>

          {/* Section 3: Vendor Services - Purple Gradient */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Sell On GetIt
            </h4>
            <div className="text-xs text-purple-100 leading-relaxed">
              <Link to="/vendor/register" className="hover:text-white transition-colors">🚀 Become a Vendor</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/seller-center" className="hover:text-white transition-colors">💼 Seller Center</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/vendor-support" className="hover:text-white transition-colors">🛠️ Vendor Support</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/commission-info" className="hover:text-white transition-colors">💰 Commission Info</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/marketing-tools" className="hover:text-white transition-colors">📊 Marketing Tools</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/seller-analytics" className="hover:text-white transition-colors">📈 Seller Analytics</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/inventory-management" className="hover:text-white transition-colors">📦 Inventory Management</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/vendor-training" className="hover:text-white transition-colors">🎓 Vendor Training</Link>
              <span className="text-purple-200 mx-2">•</span>
              <Link to="/seller-protection" className="hover:text-white transition-colors">🛡️ Seller Protection</Link>
            </div>
          </div>

          {/* Section 4: Customer Support - Orange Gradient */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Headphones className="w-4 h-4 mr-2" />
              Customer Support
            </h4>
            <div className="text-xs text-orange-100 leading-relaxed">
              <Link to="/help-center" className="hover:text-white transition-colors">❓ Help Center</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/live-chat" className="hover:text-white transition-colors">💬 Live Chat Support</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/contact-us" className="hover:text-white transition-colors">📞 Contact Us</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/submit-ticket" className="hover:text-white transition-colors">🎫 Submit a Ticket</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/faq" className="hover:text-white transition-colors">📋 FAQ & Guidelines</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/order-issues" className="hover:text-white transition-colors">⚠️ Order Issues</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/warranty-claims" className="hover:text-white transition-colors">🔧 Warranty Claims</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/feedback" className="hover:text-white transition-colors">📝 Feedback</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/complaints" className="hover:text-white transition-colors">⚡ Complaints</Link>
            </div>
          </div>

          {/* Section 5: Mobile Banking - Pink Gradient */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Banking
            </h4>
            <div className="text-xs text-pink-100 leading-relaxed">
              <Link to="/payment/bkash" className="hover:text-white transition-colors">💳 bKash Payment</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/payment/nagad" className="hover:text-white transition-colors">📱 Nagad Wallet</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/payment/rocket" className="hover:text-white transition-colors">🚀 Rocket Mobile</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/payment/upay" className="hover:text-white transition-colors">💸 Upay Service</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/payment/sure-cash" className="hover:text-white transition-colors">💰 SureCash</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/mobile-banking-offers" className="hover:text-white transition-colors">🎁 Instant Cashback</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/payment-security" className="hover:text-white transition-colors">🔒 Secure Payments</Link>
              <span className="text-pink-200 mx-2">•</span>
              <Link to="/transaction-history" className="hover:text-white transition-colors">📊 Transaction History</Link>
            </div>
          </div>

          {/* Section 6: International Cards - Red Gradient */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              International Cards
            </h4>
            <div className="text-xs text-red-100 leading-relaxed">
              <Link to="/payment/visa" className="hover:text-white transition-colors">💳 Visa Cards</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/mastercard" className="hover:text-white transition-colors">💎 Mastercard</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/american-express" className="hover:text-white transition-colors">🏛️ American Express</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/paypal" className="hover:text-white transition-colors">💙 PayPal</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/bank-transfer" className="hover:text-white transition-colors">🏦 Bank Transfer</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/cod" className="hover:text-white transition-colors">📦 Cash on Delivery</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/ssl-security" className="hover:text-white transition-colors">🔐 SSL Secured</Link>
              <span className="text-red-200 mx-2">•</span>
              <Link to="/payment/protection" className="hover:text-white transition-colors">🛡️ Payment Protection</Link>
            </div>
          </div>

          {/* Section 7: Express Delivery - Teal Gradient */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Express Delivery
            </h4>
            <div className="text-xs text-teal-100 leading-relaxed">
              <Link to="/delivery/pathao" className="hover:text-white transition-colors">🛵 Pathao Delivery</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/redx" className="hover:text-white transition-colors">📮 RedX Express</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/pandago" className="hover:text-white transition-colors">🐼 Pandago Service</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/same-day" className="hover:text-white transition-colors">⚡ Same-Day Dhaka</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/next-day" className="hover:text-white transition-colors">📅 Next-Day Delivery</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/nationwide" className="hover:text-white transition-colors">🌍 Nationwide Shipping</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/tracking" className="hover:text-white transition-colors">📍 Live Tracking</Link>
              <span className="text-teal-200 mx-2">•</span>
              <Link to="/delivery/schedule" className="hover:text-white transition-colors">⏰ Scheduled Delivery</Link>
            </div>
          </div>

          {/* Section 8: Security & Trust - Indigo Gradient */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security & Trust
            </h4>
            <div className="text-xs text-indigo-100 leading-relaxed">
              <Link to="/security/pci-compliance" className="hover:text-white transition-colors">✅ PCI DSS Compliant</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/ssl-certificate" className="hover:text-white transition-colors">🔒 SSL Secured</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/encryption" className="hover:text-white transition-colors">🛡️ 256-bit Encryption</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/fraud-protection" className="hover:text-white transition-colors">🌟 Fraud Protection</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/data-privacy" className="hover:text-white transition-colors">🔐 Data Privacy</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/secure-checkout" className="hover:text-white transition-colors">💳 Secure Checkout</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/buyer-protection" className="hover:text-white transition-colors">🛡️ Buyer Protection</Link>
              <span className="text-indigo-200 mx-2">•</span>
              <Link to="/security/trust-badges" className="hover:text-white transition-colors">🏆 Trust Certificates</Link>
            </div>
          </div>

          {/* Section 9: Regional Services - Cyan Gradient */}
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Regional Services
            </h4>
            <div className="text-xs text-cyan-100 leading-relaxed">
              <Link to="/region/dhaka" className="hover:text-white transition-colors">🏢 Dhaka Metro Service</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/region/chittagong" className="hover:text-white transition-colors">🏙️ Chittagong Division</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/region/sylhet" className="hover:text-white transition-colors">🌆 Sylhet Region Hub</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/region/rajshahi" className="hover:text-white transition-colors">🏛️ Rajshahi Zone</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/region/khulna" className="hover:text-white transition-colors">🌊 Khulna Division</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/pickup-points" className="hover:text-white transition-colors">📍 500+ Pickup Points</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/coverage-map" className="hover:text-white transition-colors">🗺️ 64 Districts Coverage</Link>
              <span className="text-cyan-200 mx-2">•</span>
              <Link to="/local-partnerships" className="hover:text-white transition-colors">🤝 Local Partnerships</Link>
            </div>
          </div>

          {/* Section 10: Legal & Compliance - Emerald Gradient */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Legal & Compliance
            </h4>
            <div className="text-xs text-emerald-100 leading-relaxed">
              <Link to="/terms-conditions" className="hover:text-white transition-colors">⚖️ Terms & Conditions</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">🔒 Privacy Policy</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/cookie-policy" className="hover:text-white transition-colors">🍪 Cookie Policy</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/vendor-agreement" className="hover:text-white transition-colors">📝 Vendor Agreement</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/intellectual-property" className="hover:text-white transition-colors">💡 Intellectual Property</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/prohibited-items" className="hover:text-white transition-colors">🚫 Prohibited Items</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/community-guidelines" className="hover:text-white transition-colors">🤝 Community Guidelines</Link>
              <span className="text-emerald-200 mx-2">•</span>
              <Link to="/dispute-resolution" className="hover:text-white transition-colors">⚡ Dispute Resolution</Link>
            </div>
          </div>

          {/* Section 11: Business Partners - Rose Gradient */}
          <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Business Partners
            </h4>
            <div className="text-xs text-rose-100 leading-relaxed">
              <Link to="/business/partnership" className="hover:text-white transition-colors">🤝 Partnership Program</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/wholesale" className="hover:text-white transition-colors">📦 Wholesale Orders</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/corporate" className="hover:text-white transition-colors">🏢 Corporate Sales</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/bulk" className="hover:text-white transition-colors">📊 Bulk Purchase</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/b2b" className="hover:text-white transition-colors">💼 B2B Solutions</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/white-label" className="hover:text-white transition-colors">🏷️ White Label</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/enterprise" className="hover:text-white transition-colors">🌐 Enterprise Sales</Link>
              <span className="text-rose-200 mx-2">•</span>
              <Link to="/business/affiliate" className="hover:text-white transition-colors">💰 Affiliate Program</Link>
            </div>
          </div>

          {/* Section 12: Technology & Innovation - Violet Gradient */}
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              Technology & API
            </h4>
            <div className="text-xs text-violet-100 leading-relaxed">
              <Link to="/api-docs" className="hover:text-white transition-colors">📖 API Documentation</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/sdk-downloads" className="hover:text-white transition-colors">💻 SDK Downloads</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/integration-guides" className="hover:text-white transition-colors">📚 Integration Guides</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/developer-portal" className="hover:text-white transition-colors">👨‍💻 Developer Portal</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/tech-support" className="hover:text-white transition-colors">🛠️ Tech Support</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/sandbox" className="hover:text-white transition-colors">🧪 API Sandbox</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/webhooks" className="hover:text-white transition-colors">🔗 Webhooks</Link>
              <span className="text-violet-200 mx-2">•</span>
              <Link to="/mobile-app" className="hover:text-white transition-colors">📱 Mobile App</Link>
            </div>
          </div>

          {/* Section 13: Special Programs - Amber Gradient */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Special Programs
            </h4>
            <div className="text-xs text-amber-100 leading-relaxed">
              <Link to="/loyalty-program" className="hover:text-white transition-colors">🏆 GetIt Plus Membership</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/rewards" className="hover:text-white transition-colors">💎 Rewards Program</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/student-discount" className="hover:text-white transition-colors">🎓 Student Discount</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/referral-program" className="hover:text-white transition-colors">🤝 Refer & Earn</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/vip-membership" className="hover:text-white transition-colors">👑 VIP Membership</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/birthday-offers" className="hover:text-white transition-colors">🎂 Birthday Offers</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/seasonal-promotions" className="hover:text-white transition-colors">🎄 Seasonal Promotions</Link>
              <span className="text-amber-200 mx-2">•</span>
              <Link to="/early-access" className="hover:text-white transition-colors">⚡ Early Access Deals</Link>
            </div>
          </div>

          {/* Section 14: Social Connect - Slate Gradient */}
          <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Connect With Us
            </h4>
            <div className="text-xs text-slate-100 leading-relaxed">
              <a href="https://facebook.com/getit.bd" className="hover:text-white transition-colors">📘 Facebook Community</a>
              <span className="text-slate-200 mx-2">•</span>
              <a href="https://instagram.com/getit.bd" className="hover:text-white transition-colors">📸 Instagram Stories</a>
              <span className="text-slate-200 mx-2">•</span>
              <a href="https://youtube.com/getitbd" className="hover:text-white transition-colors">📺 YouTube Channel</a>
              <span className="text-slate-200 mx-2">•</span>
              <a href="https://linkedin.com/company/getit-bd" className="hover:text-white transition-colors">💼 LinkedIn Updates</a>
              <span className="text-slate-200 mx-2">•</span>
              <a href="https://twitter.com/getit_bd" className="hover:text-white transition-colors">🐦 Twitter Feed</a>
              <span className="text-slate-200 mx-2">•</span>
              <a href="https://tiktok.com/@getit.bd" className="hover:text-white transition-colors">🎵 TikTok Videos</a>
              <span className="text-slate-200 mx-2">•</span>
              <Link to="/newsletter" className="hover:text-white transition-colors">📧 Newsletter</Link>
            </div>
          </div>

          {/* Section 15: Mobile Apps - Stone Gradient */}
          <div className="bg-gradient-to-br from-stone-600 to-stone-800 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile Apps
            </h4>
            <div className="text-xs text-stone-100 leading-relaxed">
              <button 
                onClick={() => window.open('https://apps.apple.com/app/getit', '_blank')}
                className="hover:text-white transition-colors"
              >
                📱 iOS App Store
              </button>
              <span className="text-stone-200 mx-2">•</span>
              <button 
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.getit', '_blank')}
                className="hover:text-white transition-colors"
              >
                🤖 Google Play Store
              </button>
              <span className="text-stone-200 mx-2">•</span>
              <Link to="/app-features" className="hover:text-white transition-colors">⚡ App Features</Link>
              <span className="text-stone-200 mx-2">•</span>
              <Link to="/app-updates" className="hover:text-white transition-colors">🔄 Latest Updates</Link>
              <span className="text-stone-200 mx-2">•</span>
              <Link to="/app-support" className="hover:text-white transition-colors">🛠️ App Support</Link>
              <span className="text-stone-200 mx-2">•</span>
              <Link to="/app-beta" className="hover:text-white transition-colors">🧪 Beta Testing</Link>
            </div>
          </div>

          {/* Section 16: Emergency Support - Red-Orange Gradient */}
          <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-lg p-4 h-full">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Emergency Support
            </h4>
            <div className="text-xs text-white leading-relaxed">
              <a href="tel:09678123456" className="hover:text-orange-100 transition-colors">📞 Hotline: 09678-123456</a>
              <span className="text-orange-200 mx-2">•</span>
              <a href="https://wa.me/8801700123456" className="hover:text-orange-100 transition-colors">💬 WhatsApp Support</a>
              <span className="text-orange-200 mx-2">•</span>
              <a href="mailto:support@getit.com.bd" className="hover:text-orange-100 transition-colors">✉️ Email Support</a>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/emergency-chat" className="hover:text-orange-100 transition-colors">💭 Emergency Chat</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/urgent-orders" className="hover:text-orange-100 transition-colors">🚨 Urgent Orders</Link>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/payment-issues" className="hover:text-orange-100 transition-colors">💳 Payment Issues</Link>
              <span className="text-orange-200 mx-2">•</span>
              <span>⏰ 24/7 Available</span>
              <span className="text-orange-200 mx-2">•</span>
              <Link to="/callback-request" className="hover:text-orange-100 transition-colors">📲 Callback Request</Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="border-t border-gray-700 pt-4 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Copyright className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-400">
                {new Date().getFullYear()} GetIt Platform. All rights reserved.
              </p>
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">
              <Link to="/about-us" className="hover:text-white transition-colors">🏢 About GetIt</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/careers" className="hover:text-white transition-colors">💼 Careers</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/press" className="hover:text-white transition-colors">📰 Press & Media</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/investors" className="hover:text-white transition-colors">📈 Investors</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/sustainability" className="hover:text-white transition-colors">🌱 Sustainability</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/version-history" className="hover:text-white transition-colors">🔄 Version 2.0</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/site-map" className="hover:text-white transition-colors">🗺️ Site Map</Link>
              <span className="text-gray-500 mx-2">•</span>
              <Link to="/accessibility" className="hover:text-white transition-colors">♿ Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};