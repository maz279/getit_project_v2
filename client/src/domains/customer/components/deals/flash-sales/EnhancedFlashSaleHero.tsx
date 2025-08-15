
import React from 'react';
import { Flame, Zap, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface EnhancedFlashSaleHeroProps {
  timeLeft: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export const EnhancedFlashSaleHero: React.FC<EnhancedFlashSaleHeroProps> = ({ timeLeft }) => {
  return (
    <section className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-5 left-5 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-100"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-3">
            <Flame className="w-6 h-6 animate-bounce text-yellow-300" />
            <Zap className="w-8 h-8 text-yellow-300" />
            <Flame className="w-6 h-6 animate-bounce text-yellow-300" />
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
            🔥 BANGLADESH'S BIGGEST FLASH SALE 🔥
          </h1>
          <h2 className="text-lg md:text-2xl font-bold mb-1 text-yellow-200">
            UP TO 90% OFF + FREE DELIVERY
          </h2>
          <p className="text-sm md:text-lg mb-4 text-yellow-100">
            Limited Time Only - Don't Miss Out!
          </p>
          
          {/* Compact Countdown */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 inline-block mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-bold">⏰ Sale Ends In: ⏰</span>
            </div>
            <div className="flex gap-2 justify-center">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-white text-red-600 rounded-lg p-3 min-w-[60px] text-center shadow-xl">
                  <div className="text-xl md:text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                  <div className="text-xs uppercase font-medium">{unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold">🔥 67%</div>
              <div className="text-xs text-yellow-200">Items Claimed!</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold">⚡ 12,847</div>
              <div className="text-xs text-yellow-200">Sold Today!</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold">156</div>
              <div className="text-xs text-yellow-200">Available</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold">4.8★</div>
              <div className="text-xs text-yellow-200">Rating</div>
            </div>
          </div>

          <Button className="bg-white text-red-600 hover:bg-gray-100 text-lg font-bold px-8 py-3 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300">
            🛒 SHOP NOW - HURRY UP! 🚀
          </Button>
        </div>
      </div>
    </section>
  );
};
