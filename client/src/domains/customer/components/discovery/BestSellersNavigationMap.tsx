
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TrendingUp, Award, Gift, Zap } from 'lucide-react';

export const BestSellersNavigationMap: React.FC = () => {
  const categories = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Top Rated ⭐",
      description: "Products with highest customer ratings - Excellence recognized by real customers with 4.5+ star ratings",
      features: ["Verified Reviews", "Performance Excellence", "Vendor Reliability", "Value for Money"],
      topCategories: ["Educational Materials", "Kitchen Appliances", "Personal Care", "Traditional Handicrafts"],
      link: "/categories?sort=rating&min_rating=4.5"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Most Sold 📈", 
      description: "Items with highest sales volume - Join millions who made these their preferred choice",
      features: ["Essential Needs", "Competitive Pricing", "Fast Delivery", "Multiple Payment Options"],
      topCategories: ["Mobile Accessories", "Fashion Staples", "Food & Beverages", "Personal Electronics"],
      link: "/categories?sort=sales&order=desc"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Trending Now 🔥",
      description: "Currently viral products creating buzz across social media in Bangladesh",
      features: ["Social Media Buzz", "Seasonal Relevance", "Influencer Recommendations", "Innovation Factor"],
      topCategories: ["Festival Fashion", "Smart Home Solutions", "Fitness & Wellness", "Artisan Products"],
      link: "/categories?sort=trending&period=week"
    }
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">🏆 Best Sellers Categories</h2>
          <p className="text-gray-600 max-w-4xl mx-auto text-sm">
            Experience the perfect blend of quality, affordability, and customer satisfaction with our best-selling products. 
            From traditional Bengali fashion to cutting-edge electronics, these crowd favorites have earned their place through 
            exceptional customer reviews and consistent demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-600">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold">{category.title}</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {category.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Top Categories:</h4>
                <div className="flex flex-wrap gap-1">
                  {category.topCategories.map((cat, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
