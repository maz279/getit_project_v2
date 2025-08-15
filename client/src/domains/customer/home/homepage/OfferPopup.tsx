
import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBag, Clock } from 'lucide-react';

export const OfferPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-4 border-yellow-400 animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-6 h-6" />
              <span className="font-bold text-lg">MEGA SALE!</span>
            </div>
            <h2 className="text-2xl font-black mb-1">UP TO 80% OFF</h2>
            <p className="text-purple-100 text-sm">On all categories today only!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          {/* Timer */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4 border border-red-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700">Hurry! Sale ends soon</span>
            </div>
            <div className="flex justify-center gap-2 text-sm">
              <div className="bg-red-600 text-white rounded px-2 py-1 font-bold">
                <div>05</div>
                <div className="text-xs">HRS</div>
              </div>
              <div className="bg-red-600 text-white rounded px-2 py-1 font-bold">
                <div>23</div>
                <div className="text-xs">MIN</div>
              </div>
              <div className="bg-red-600 text-white rounded px-2 py-1 font-bold">
                <div>45</div>
                <div className="text-xs">SEC</div>
              </div>
            </div>
          </div>

          {/* Offers */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>🚚 Free delivery on orders ৳500+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>🎁 Extra 15% off with code: SAVE15</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>💰 Cashback up to ৳200</span>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🛍️ SHOP NOW & SAVE BIG!
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full opacity-80"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-pink-400 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};
