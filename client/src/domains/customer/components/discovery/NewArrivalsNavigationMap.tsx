
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Sparkles, Calendar, Package, Star } from 'lucide-react';

export const NewArrivalsNavigationMap: React.FC = () => {
  const navigationItems = [
    {
      title: '✨ Today\'s New Arrivals',
      description: 'Just arrived today',
      link: '/new-arrivals?filter=today',
      icon: '✨',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '📱 Latest Electronics',
      description: 'New tech products',
      link: '/categories?category=electronics&sort=newest',
      icon: '📱',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '👕 Fashion Trends',
      description: 'Latest fashion',
      link: '/categories?category=fashion&sort=newest',
      icon: '👕',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '🏠 Home Collections',
      description: 'New home items',
      link: '/categories?category=home-garden&sort=newest',
      icon: '🏠',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '💄 Beauty Launches',
      description: 'New beauty products',
      link: '/categories?category=health-beauty&sort=newest',
      icon: '💄',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '🎮 Gaming Releases',
      description: 'Latest gaming gear',
      link: '/categories?category=sports-outdoor&sort=newest',
      icon: '🎮',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const timeFilters = [
    {
      title: 'Last 24 Hours',
      icon: <Clock className="w-5 h-5" />,
      link: '/new-arrivals?period=24h',
      description: 'Brand new items'
    },
    {
      title: 'This Week',
      icon: <Calendar className="w-5 h-5" />,
      link: '/new-arrivals?period=week',
      description: 'Weekly arrivals'
    },
    {
      title: 'This Month',
      icon: <Sparkles className="w-5 h-5" />,
      link: '/new-arrivals?period=month',
      description: 'Monthly launches'
    },
    {
      title: 'Pre-Orders',
      icon: <Package className="w-5 h-5" />,
      link: '/new-arrivals?status=pre-order',
      description: 'Coming soon'
    }
  ];

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Categories Navigation */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-6">🆕 New Arrivals by Category 🆕</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {navigationItems.map((item, index) => (
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

        {/* Time-based Filters */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">⏰ Filter by Time</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeFilters.map((filter, index) => (
              <Link
                key={index}
                to={filter.link}
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
              >
                <div className="text-blue-600 mb-2 flex justify-center">{filter.icon}</div>
                <h4 className="font-semibold text-sm mb-1 text-gray-800">{filter.title}</h4>
                <p className="text-xs text-gray-600">{filter.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* New Arrivals Specific Navigation */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🆕 New Arrivals Hub 🆕</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link
              to="/new-arrivals?filter=today"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ✨ Today's Arrivals
            </Link>
            <Link
              to="/new-arrivals?filter=brand-launches"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              🏷️ Brand Launches
            </Link>
            <Link
              to="/new-arrivals?filter=seasonal"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              🌟 Seasonal Items
            </Link>
            <Link
              to="/new-arrivals?status=pre-order"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              📦 Pre-Orders
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
