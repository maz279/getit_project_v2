
import React from 'react';
import { Shield, Truck, Award, TrendingUp } from 'lucide-react';

export const FlashSaleTrustIndicators: React.FC = () => {
  return (
    <section className="bg-white py-8 border-t">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-800">Buyer Protection</h3>
            <p className="text-sm text-gray-600">100% Secure Shopping</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-800">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Same Day Delivery Available</p>
          </div>
          <div className="flex flex-col items-center">
            <Award className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold text-gray-800">Quality Assured</h3>
            <p className="text-sm text-gray-600">Authentic Products Only</p>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-800">Best Prices</h3>
            <p className="text-sm text-gray-600">Lowest Price Guarantee</p>
          </div>
        </div>
      </div>
    </section>
  );
};
