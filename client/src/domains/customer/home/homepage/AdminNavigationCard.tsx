
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LayoutDashboard, TrendingUp, Users, Package, Settings, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/domains/customer/auth/components/AuthProvider';

export const AdminNavigationCard: React.FC = () => {
  const { user, userProfile } = useAuth();

  // Only show for admin users
  if (!user || userProfile?.role !== 'admin') {
    return null;
  }

  const adminFeatures = [
    {
      title: 'Dashboard Overview',
      description: 'View key metrics and analytics',
      icon: LayoutDashboard,
      link: '/admin/dashboard',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Vendor Management',
      description: 'Manage vendors and approvals',
      icon: Users,
      link: '/admin/dashboard?tab=vendors',
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Product Management',
      description: 'Oversee product listings',
      icon: Package,
      link: '/admin/dashboard?tab=products',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Order Management',
      description: 'Track and manage orders',
      icon: ShoppingCart,
      link: '/admin/dashboard?tab=orders',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'Financial Reports',
      description: 'Revenue and analytics',
      icon: TrendingUp,
      link: '/admin/dashboard?tab=financials',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      link: '/admin/dashboard?tab=settings',
      color: 'text-gray-600 bg-gray-50'
    }
  ];

  return (
    <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          <LayoutDashboard className="mr-2 text-blue-600" />
          Admin Control Panel
        </CardTitle>
        <p className="text-gray-600">
          Welcome, {userProfile?.full_name}! Access your admin dashboard and management tools.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {adminFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="group block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h4 className="font-semibold text-sm text-gray-800 text-center mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-600 text-center">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LayoutDashboard className="mr-2" size={20} />
            Go to Admin Dashboard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
