
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Star, Share2, ShoppingCart, Filter, Trash2 } from 'lucide-react';

export const WishlistNavigationMap: React.FC = () => {
  const navigationItems = [
    {
      title: '❤️ All Wishlist Items',
      description: 'View all saved items',
      link: '/wishlist',
      icon: '❤️',
      color: 'from-pink-500 to-red-500'
    },
    {
      title: '📱 Electronics',
      description: 'Saved electronics',
      link: '/wishlist?category=electronics',
      icon: '📱',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: '👕 Fashion',
      description: 'Saved fashion items',
      link: '/wishlist?category=fashion',
      icon: '👕',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '🏠 Home & Garden',
      description: 'Saved home items',
      link: '/wishlist?category=home-garden',
      icon: '🏠',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '💄 Beauty',
      description: 'Saved beauty products',
      link: '/wishlist?category=beauty',
      icon: '💄',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '🎁 Gifts',
      description: 'Gift ideas saved',
      link: '/wishlist?category=gifts',
      icon: '🎁',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const wishlistActions = [
    {
      title: 'Price Alerts',
      icon: <Star className="w-5 h-5" />,
      link: '/wishlist?tab=price-alerts',
      description: 'Set price notifications'
    },
    {
      title: 'Share Wishlist',
      icon: <Share2 className="w-5 h-5" />,
      link: '/wishlist?tab=share',
      description: 'Share with friends'
    },
    {
      title: 'Move to Cart',
      icon: <ShoppingCart className="w-5 h-5" />,
      link: '/wishlist?tab=move-to-cart',
      description: 'Add to cart'
    },
    {
      title: 'Manage Lists',
      icon: <Filter className="w-5 h-5" />,
      link: '/wishlist?tab=manage',
      description: 'Organize wishlists'
    }
  ];

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Categories Navigation */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-6">💖 Wishlist Categories 💖</h3>
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

        {/* Wishlist Actions */}
        <div>
          <h3 className="text-lg font-bold text-center mb-4">⚡ Wishlist Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlistActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
              >
                <div className="text-blue-600 mb-2 flex justify-center">{action.icon}</div>
                <h4 className="font-semibold text-sm mb-1 text-gray-800">{action.title}</h4>
                <p className="text-xs text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Wishlist Specific Navigation */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">💖 Wishlist Management 💖</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link
              to="/wishlist"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              ❤️ All Items
            </Link>
            <Link
              to="/wishlist?tab=price-alerts"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              🔔 Price Alerts
            </Link>
            <Link
              to="/wishlist?tab=share"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              📤 Share Lists
            </Link>
            <Link
              to="/wishlist?tab=recently-viewed"
              className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm hover:bg-white/30 transition-colors"
            >
              👁️ Recently Viewed
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
