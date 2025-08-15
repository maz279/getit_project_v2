
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Package, CreditCard, Truck, Headphones, Star } from 'lucide-react';

export const DailyDealsNavigationMap: React.FC = () => {
  const dailyDealsCategories = [
    {
      title: '📱 Electronics',
      description: 'Up to 50% OFF',
      link: '/categories?category=electronics&deals=daily',
      icon: '📱',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '👕 Fashion',
      description: 'Up to 60% OFF',
      link: '/categories?category=fashion&deals=daily',
      icon: '👕',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '🏠 Home & Garden',
      description: 'Up to 45% OFF',
      link: '/categories?category=home-garden&deals=daily',
      icon: '🏠',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '💄 Beauty',
      description: 'Up to 55% OFF',
      link: '/categories?category=health-beauty&deals=daily',
      icon: '💄',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '🍔 Food & Grocery',
      description: 'Up to 30% OFF',
      link: '/categories?category=food-groceries&deals=daily',
      icon: '🍔',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: '🎮 Gaming',
      description: 'Up to 40% OFF',
      link: '/categories?category=sports-outdoor&deals=daily',
      icon: '🎮',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const quickActions = [
    {
      title: 'Today\'s Highlights',
      icon: <Star className="w-5 h-5" />,
      link: '#todays-highlights',
      description: 'Best picks for today'
    },
    {
      title: 'Track Your Order',
      icon: <Package className="w-5 h-5" />,
      link: '/track-order',
      description: 'Real-time tracking'
    },
    {
      title: 'Payment Options',
      icon: <CreditCard className="w-5 h-5" />,
      link: '#payment-methods',
      description: 'bKash, Nagad & more'
    },
    {
      title: 'Customer Support',
      icon: <Headphones className="w-5 h-5" />,
      link: '/help-center',
      description: '24/7 assistance'
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
          <h3 className="text-xl font-bold text-center mb-6">🌟 Daily Deals by Category 🌟</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dailyDealsCategories.map((item, index) => (
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
            ))}
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

        {/* Daily Deals Specific Navigation */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🌟 Daily Deals Sections 🌟</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button
              onClick={() => handleNavigation('#todays-highlights')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ⭐ Today's Highlights
            </button>
            <button
              onClick={() => handleNavigation('#limited-time-offers')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ⏰ Limited Time Offers
            </button>
            <button
              onClick={() => handleNavigation('#payment-methods')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              💳 Payment Options
            </button>
            <button
              onClick={() => handleNavigation('#delivery-info')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              🚚 Delivery Info
            </button>
            <button
              onClick={() => handleNavigation('#customer-reviews')}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ⭐ Customer Reviews
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
