
import React from 'react';
import { TrendingUp, Award, Star } from 'lucide-react';

export const BestSellersHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold mb-2">
          🏆 Best Sellers 🏆
        </h1>
        
        <p className="text-sm md:text-base mb-3 max-w-3xl mx-auto">
          Discover the most popular products loved by millions of customers across Bangladesh. Experience the perfect blend of quality, affordability, and customer satisfaction with our best-selling products.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <Award className="w-5 h-5 mx-auto mb-1" />
            <h3 className="text-sm font-semibold mb-1">⭐ Top Rated</h3>
            <p className="text-xs opacity-90">Products with highest customer ratings - Excellence recognized by real customers with 4.5+ star ratings</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <Star className="w-5 h-5 mx-auto mb-1" />
            <h3 className="text-sm font-semibold mb-1">📈 Most Sold</h3>
            <p className="text-xs opacity-90">Items with highest sales volume - Join millions who made these their preferred choice</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <h3 className="text-sm font-semibold mb-1">🔥 Trending Now</h3>
            <p className="text-xs opacity-90">Currently viral products creating buzz across social media in Bangladesh</p>
          </div>
        </div>
      </div>
    </section>
  );
};
