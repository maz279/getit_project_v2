
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Star } from 'lucide-react';

export const SideBanners: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-xl p-6 text-white h-60 flex flex-col justify-between">
        <div>
          <Zap className="w-8 h-8 mb-2" />
          <h3 className="font-bold text-lg">Flash Sale</h3>
          <p className="text-sm opacity-90">Up to 70% off</p>
        </div>
        <Link 
          to="/flash-sale"
          className="bg-white text-green-600 font-semibold px-4 py-2 rounded-full text-sm hover:bg-gray-100 transition-all text-center"
        >
          Shop Now
        </Link>
      </div>
      
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white h-60 flex flex-col justify-between">
        <div>
          <Star className="w-8 h-8 mb-2" />
          <h3 className="font-bold text-lg">AI Picks</h3>
          <p className="text-sm opacity-90">Just for you</p>
        </div>
        <Link 
          to="/recommendations"
          className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-full text-sm hover:bg-gray-100 transition-all text-center"
        >
          Explore
        </Link>
      </div>
    </div>
  );
};
