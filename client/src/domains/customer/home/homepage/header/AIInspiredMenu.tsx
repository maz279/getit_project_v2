
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Zap, Star, Gift, Crown, ShoppingBag, Heart } from 'lucide-react';

export const AIInspiredMenu: React.FC = () => {
  const menuItems = [
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: 'AI Picks',
      href: '/ai-picks',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Hot Products',
      href: '/hot-products',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Best Deals',
      href: '/best-deals',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'Top Rated',
      href: '/top-rated',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Gift className="w-4 h-4" />,
      label: 'Daily Surprise',
      href: '/daily-deals',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Crown className="w-4 h-4" />,
      label: 'Premium',
      href: '/premium',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <ShoppingBag className="w-4 h-4" />,
      label: 'Smart Cart',
      href: '/cart',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: 'For You',
      href: '/recommendations',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm border-t border-white/20 py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-1 overflow-x-auto scrollbar-hide">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="group flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 min-w-fit"
            >
              <div className={`p-1.5 rounded-full bg-gradient-to-r ${item.gradient} text-white group-hover:shadow-md transition-all duration-300`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
