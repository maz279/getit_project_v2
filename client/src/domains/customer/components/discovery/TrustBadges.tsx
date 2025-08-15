
import React from 'react';
import { Shield, Award, Truck, RefreshCw, CreditCard, Headphones } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Shopping',
      description: '256-bit SSL encryption',
      color: 'text-green-600'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Authentic Products',
      description: '100% genuine guarantee',
      color: 'text-blue-600'
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Same day in Dhaka',
      color: 'text-orange-600'
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Easy Returns',
      description: '7-day return policy',
      color: 'text-purple-600'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Flexible Payment',
      description: 'Multiple payment options',
      color: 'text-indigo-600'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Always here to help',
      color: 'text-red-600'
    }
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="text-center">
              <div className={`${badge.color} mb-3 flex justify-center`}>
                {badge.icon}
              </div>
              <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
