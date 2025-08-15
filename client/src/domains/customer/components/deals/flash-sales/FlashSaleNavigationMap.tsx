
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Package, CreditCard, Truck, Headphones, Gift } from 'lucide-react';

export const FlashSaleNavigationMap: React.FC = () => {
  const navigationItems = [
    {
      title: '⚡ Lightning Deals',
      description: 'Hourly flash deals',
      link: '#lightning-deals',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: '📱 Electronics',
      description: 'Up to 60% OFF',
      link: '/categories?category=electronics',
      icon: '📱',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '👕 Fashion',
      description: 'Up to 75% OFF',
      link: '/categories?category=fashion',
      icon: '👕',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '🏠 Home & Living',
      description: 'Up to 55% OFF',
      link: '/categories?category=home-garden',
      icon: '🏠',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '💄 Beauty',
      description: 'Up to 70% OFF',
      link: '/categories?category=health-beauty',
      icon: '💄',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '🎮 Gaming',
      description: 'Up to 65% OFF',
      link: '/categories?category=sports-outdoor',
      icon: '🎮',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const quickActions = [
    {
      title: 'Track Your Order',
      icon: <Package className="w-5 h-5" />,
      link: '/track-order',
      description: 'Real-time tracking'
    },
    {
      title: 'Payment Methods',
      icon: <CreditCard className="w-5 h-5" />,
      link: '#payment-methods',
      description: 'bKash, Nagad & more'
    },
    {
      title: 'Delivery Info',
      icon: <Truck className="w-5 h-5" />,
      link: '#delivery-options',
      description: 'Fast & reliable'
    },
    {
      title: 'Help Center',
      icon: <Headphones className="w-5 h-5" />,
      link: '/help-center',
      description: '24/7 support'
    }
  ];

  const handleNavigation = (link: string) => {
    if (link.startsWith('#')) {
      // Smooth scroll to section
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Categories Navigation */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-6">🔥 Shop by Category 🔥</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {navigationItems.map((item, index) => {
              if (item.link.startsWith('#')) {
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.link)}
                    className={`bg-gradient-to-r ${item.color} rounded-lg p-4 text-white text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs opacity-90">{item.description}</p>
                    <ArrowRight className="w-4 h-4 mx-auto mt-2" />
                  </button>
                );
              }
              
              return (
                <Link
                  key={index}
                  to={item.link}
                  className={`bg-gradient-to-r ${item.color} rounded-lg p-4 text-white text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs opacity-90">{item.description}</p>
                  <ArrowRight className="w-4 h-4 mx-auto mt-2" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              if (action.link.startsWith('#')) {
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(action.link)}
                    className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                  >
                    <div className="text-blue-600 mb-2 flex justify-center">{action.icon}</div>
                    <h4 className="font-semibold text-sm mb-1 text-gray-800">{action.title}</h4>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </button>
                );
              }
              
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                >
                  <div className="text-blue-600 mb-2 flex justify-center">{action.icon}</div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-800">{action.title}</h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Flash Sale Specific Navigation */}
        <div className="mt-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🔥 Flash Sale Sections 🔥</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button
              onClick={() => handleNavigation('#lightning-deals')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ⚡ Lightning Deals
            </button>
            <button
              onClick={() => handleNavigation('#payment-methods')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              💳 Payment Options
            </button>
            <button
              onClick={() => handleNavigation('#delivery-options')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              🚚 Delivery Info
            </button>
            <button
              onClick={() => handleNavigation('#customer-reviews')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ⭐ Reviews
            </button>
            <button
              onClick={() => handleNavigation('#trust-indicators')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              🛡️ Trust & Security
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
