
import React from 'react';
import { Flame, Zap, Clock } from 'lucide-react';

interface FlashSaleHeroProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const FlashSaleHero: React.FC<FlashSaleHeroProps> = ({ timeLeft }) => {
  return (
    <section className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-100"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Flame className="w-8 h-8 animate-bounce text-yellow-300" />
            <Zap className="w-10 h-10 text-yellow-300" />
            <Flame className="w-8 h-8 animate-bounce text-yellow-300" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
            Flash Sale
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-yellow-100">
            Up to 80% OFF + Free Shipping on Selected Items
          </p>
          
          {/* Enhanced Countdown */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 inline-block mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Sale Ends In:</span>
            </div>
            <div className="flex gap-3">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-white text-red-600 rounded-xl p-4 min-w-[80px] text-center shadow-lg">
                  <div className="text-2xl md:text-3xl font-bold">{value.toString().padStart(2, '0')}</div>
                  <div className="text-sm uppercase font-medium">{unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-yellow-200">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12K+</div>
              <div className="text-sm text-yellow-200">Sold Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.8★</div>
              <div className="text-sm text-yellow-200">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
