
import React from 'react';
import { Clock, Zap, Gift, Truck, Shield, CreditCard, Headphones, Award, RefreshCw, Users } from 'lucide-react';

export const BestSellerOffers: React.FC = () => {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Flash Sale</h3>
            <p className="text-xs text-gray-600">Up to 70% OFF</p>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Free Shipping</h3>
            <p className="text-xs text-gray-600">Orders over ৳1000</p>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Gift Vouchers</h3>
            <p className="text-xs text-gray-600">Extra 5% OFF</p>
          </div>
          
          <div className="text-center group">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Lightning Deals</h3>
            <p className="text-xs text-gray-600">Limited Time</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Secure Payment</h3>
            <p className="text-xs text-gray-600">100% Protected</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Easy EMI</h3>
            <p className="text-xs text-gray-600">0% Interest</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Headphones className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">24/7 Support</h3>
            <p className="text-xs text-gray-600">Always Here</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Quality Assured</h3>
            <p className="text-xs text-gray-600">Verified Products</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <RefreshCw className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Easy Returns</h3>
            <p className="text-xs text-gray-600">7 Day Policy</p>
          </div>

          <div className="text-center group">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="font-bold text-xs text-gray-800">Community</h3>
            <p className="text-xs text-gray-600">Join 1M+ Users</p>
          </div>
        </div>
      </div>
    </section>
  );
};
