
import React from 'react';
import { Package, Users, Star, Clock } from 'lucide-react';

export const NewArrivalsStats: React.FC = () => {
  const stats = [
    {
      icon: Package,
      value: "1,247+",
      label: "New Products This Month",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      value: "50K+",
      label: "Happy Customers",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Star,
      value: "4.8/5",
      label: "Average Rating",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Clock,
      value: "Daily",
      label: "Fresh Arrivals",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`bg-gradient-to-r ${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
