
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Calendar, 
  Gift, 
  Percent, 
  Users, 
  Award,
  ShoppingCart,
  Heart,
  Star,
  Package,
  Truck,
  CreditCard,
  Headphones,
  Shield,
  RefreshCw,
  Bell,
  Settings,
  Home,
  Search,
  Tag,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export const QuickAccessIcons: React.FC = () => {
  const quickAccessItems = [
    {
      icon: <Zap className="w-4 h-4" />,
      title: 'Flash Sales',
      color: 'text-red-500 hover:text-red-600',
      link: '/flash-sale'
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      title: 'Daily Deals',
      color: 'text-green-500 hover:text-green-600',
      link: '/daily-deals'
    },
    {
      icon: <Gift className="w-4 h-4" />,
      title: 'Gift Cards',
      color: 'text-purple-500 hover:text-purple-600',
      link: '/gift-cards'
    },
    {
      icon: <Percent className="w-4 h-4" />,
      title: 'Mega Sale',
      color: 'text-blue-500 hover:text-blue-600',
      link: '/mega-sale'
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: 'Group Buy',
      color: 'text-teal-500 hover:text-teal-600',
      link: '/group-buy'
    },
    {
      icon: <Award className="w-4 h-4" />,
      title: 'Premium',
      color: 'text-yellow-500 hover:text-yellow-600',
      link: '/premium'
    },
    {
      icon: <ShoppingCart className="w-4 h-4" />,
      title: 'Best Sellers',
      color: 'text-emerald-500 hover:text-emerald-600',
      link: '/best-sellers'
    },
    {
      icon: <Heart className="w-4 h-4" />,
      title: 'Wishlist',
      color: 'text-pink-500 hover:text-pink-600',
      link: '/wishlist'
    },
    {
      icon: <Star className="w-4 h-4" />,
      title: 'New Arrivals',
      color: 'text-violet-500 hover:text-violet-600',
      link: '/new-arrivals'
    },
    {
      icon: <Package className="w-4 h-4" />,
      title: 'Bulk Orders',
      color: 'text-indigo-500 hover:text-indigo-600',
      link: '/bulk-orders'
    },
    {
      icon: <Truck className="w-4 h-4" />,
      title: 'Track Order',
      color: 'text-orange-500 hover:text-orange-600',
      link: '/track-order'
    },
    {
      icon: <CreditCard className="w-4 h-4" />,
      title: 'Payment',
      color: 'text-blue-600 hover:text-blue-700',
      link: '/payment-methods'
    },
    {
      icon: <Headphones className="w-4 h-4" />,
      title: 'Help Center',
      color: 'text-gray-500 hover:text-gray-600',
      link: '/help'
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: 'Security',
      color: 'text-red-600 hover:text-red-700',
      link: '/security'
    },
    {
      icon: <RefreshCw className="w-4 h-4" />,
      title: 'Returns',
      color: 'text-cyan-500 hover:text-cyan-600',
      link: '/returns-refunds'
    },
    {
      icon: <Bell className="w-4 h-4" />,
      title: 'Notifications',
      color: 'text-amber-500 hover:text-amber-600',
      link: '/notifications'
    },
    {
      icon: <Settings className="w-4 h-4" />,
      title: 'My Account',
      color: 'text-slate-500 hover:text-slate-600',
      link: '/my-account'
    },
    {
      icon: <Home className="w-4 h-4" />,
      title: 'Seller Center',
      color: 'text-green-600 hover:text-green-700',
      link: '/seller-center'
    },
    {
      icon: <Search className="w-4 h-4" />,
      title: 'Categories',
      color: 'text-purple-600 hover:text-purple-700',
      link: '/categories'
    },
    {
      icon: <Tag className="w-4 h-4" />,
      title: 'Offers',
      color: 'text-rose-500 hover:text-rose-600',
      link: '/offers'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: 'Order History',
      color: 'text-blue-500 hover:text-blue-600',
      link: '/orders'
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      title: 'Store Locator',
      color: 'text-green-500 hover:text-green-600',
      link: '/stores'
    },
    {
      icon: <Phone className="w-4 h-4" />,
      title: 'Contact Us',
      color: 'text-purple-500 hover:text-purple-600',
      link: '/contact'
    },
    {
      icon: <Mail className="w-4 h-4" />,
      title: 'Newsletter',
      color: 'text-teal-500 hover:text-teal-600',
      link: '/newsletter'
    }
  ];

  return (
    <section className="py-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-24 gap-3 justify-items-center">
          {quickAccessItems.map((item, index) => (
            <Link 
              key={index}
              to={item.link}
              className="flex flex-col items-center group"
            >
              <div className={`${item.color} transition-all duration-300 transform group-hover:scale-110 mb-1 p-2 rounded-full hover:shadow-md bg-gray-50 hover:bg-gray-100`}>
                {item.icon}
              </div>
              <h3 className="text-xs font-medium text-gray-700 text-center group-hover:text-gray-900 transition-colors duration-300 leading-tight">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
