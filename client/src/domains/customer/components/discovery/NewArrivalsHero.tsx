
import React from 'react';
import { Sparkles, Clock, Package, Zap, Shield, Truck } from 'lucide-react';

export const NewArrivalsHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            নতুন পণ্য | New Arrivals
          </h1>
          
          <h2 className="text-xl md:text-3xl mb-6 font-semibold">
            আবিষ্কার করুন সর্বশেষ পণ্যসামগ্রী
          </h2>
          
          <p className="text-lg md:text-xl mb-8 max-w-4xl mx-auto">
            Discover the Latest Products on Bangladesh's Leading Multi-Vendor Platform
          </p>
          
          <p className="text-md md:text-lg mb-8 max-w-5xl mx-auto opacity-90">
            Welcome to GetIt's New Arrivals section, where innovation meets convenience. Every day, our verified vendors across Bangladesh bring you the freshest products, cutting-edge technology, and trending items that shape the way you live, work, and play.
          </p>
        </div>
        
        {/* Why Choose Section */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            ✨ Why Choose GetIt's New Arrivals?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
              <h4 className="text-lg font-semibold mb-2">🔥 Fresh & Trending</h4>
              <p className="text-sm opacity-90">Stay ahead with products that just hit the market, powered by AI recommendations</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <Package className="w-8 h-8 mx-auto mb-3 text-blue-300" />
              <h4 className="text-lg font-semibold mb-2">🎯 Personalized for You</h4>
              <p className="text-sm opacity-90">Advanced ML algorithms analyze your patterns to show what matters to you</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 text-green-300" />
              <h4 className="text-lg font-semibold mb-2">🛡️ Verified Quality</h4>
              <p className="text-sm opacity-90">Rigorous vendor verification ensures quality standards from trusted sellers</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
              <Truck className="w-8 h-8 mx-auto mb-3 text-orange-300" />
              <h4 className="text-lg font-semibold mb-2">🚚 Fast Delivery Nationwide</h4>
              <p className="text-sm opacity-90">From Dhaka to Chittagong - reliable delivery via Pathao, Paperfly & eCourier</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
