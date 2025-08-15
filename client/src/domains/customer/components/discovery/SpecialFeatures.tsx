
import React from 'react';
import { Gift, Store, Calendar, TrendingUp, Star, Users } from 'lucide-react';

export const SpecialFeatures: React.FC = () => {
  const specialFeatures = [
    {
      icon: Gift,
      title: "Early Bird Discounts",
      description: "Be among the first to purchase newly arrived products and enjoy exclusive launch discounts and promotional offers.",
      color: "from-green-500 to-emerald-500",
      badge: "Exclusive"
    },
    {
      icon: Store,
      title: "Vendor Spotlights",
      description: "Discover emerging brands and innovative sellers who are bringing unique products to the Bangladesh market.",
      color: "from-blue-500 to-indigo-500",
      badge: "Featured"
    },
    {
      icon: Calendar,
      title: "Seasonal Collections",
      description: "Find products perfectly timed for upcoming festivals, seasons, and special occasions throughout the year.",
      color: "from-purple-500 to-pink-500",
      badge: "Seasonal"
    },
    {
      icon: TrendingUp,
      title: "Trending Now",
      description: "See what's popular among GetIt customers across Bangladesh with our real-time trending products section.",
      color: "from-orange-500 to-red-500",
      badge: "Hot"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🎉 Special Features for New Arrivals</h2>
          <p className="text-gray-600 text-lg">Unlock exclusive benefits and discover unique shopping experiences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specialFeatures.map((feature, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-xl`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                      <span className={`bg-gradient-to-r ${feature.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>Thousands using this feature</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
