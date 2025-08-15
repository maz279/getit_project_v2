
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Gift, Clock, Star, Zap } from 'lucide-react';

const Offers: React.FC = () => {
  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">All Offers</h1>
            <p className="text-xl mb-8">Discover amazing deals and exclusive offers</p>
          </div>
        </section>

        {/* Offer Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white text-center">
                <Zap className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Flash Sales</h3>
                <p className="text-sm opacity-90">Limited time offers</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
                <Gift className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Festival Offers</h3>
                <p className="text-sm opacity-90">Special occasion deals</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white text-center">
                <Star className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">New User</h3>
                <p className="text-sm opacity-90">Welcome bonuses</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white text-center">
                <Clock className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Daily Deals</h3>
                <p className="text-sm opacity-90">Fresh offers everyday</p>
              </div>
            </div>

            {/* Current Offers */}
            <h2 className="text-3xl font-bold text-center mb-12">Current Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Eid Sale */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200">
                <div className="h-48 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Eid Mubarak Sale</h3>
                  <p className="text-gray-600 mb-4">Up to 70% off on Eid collection</p>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-500 font-semibold">Ends in 5 days</span>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* New User Offer */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-purple-200">
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">New User Special</h3>
                  <p className="text-gray-600 mb-4">৳200 off on your first purchase</p>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-500 font-semibold">For new users</span>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all">
                      Claim Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Banking */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-emerald-200">
                <div className="h-48 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Mobile Banking Bonus</h3>
                  <p className="text-gray-600 mb-4">5% cashback with bKash/Nagad</p>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-500 font-semibold">Ongoing</span>
                    <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all">
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Flash Sale */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200">
                <div className="h-48 bg-gradient-to-r from-red-500 to-yellow-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Flash Sale</h3>
                  <p className="text-gray-600 mb-4">Up to 80% off selected items</p>
                  <div className="flex justify-between items-center">
                    <span className="text-red-500 font-semibold">Ends in 2 hours</span>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Electronics Sale */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-200">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Electronics Mega Sale</h3>
                  <p className="text-gray-600 mb-4">Latest gadgets at best prices</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-500 font-semibold">Limited stock</span>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
                      Explore
                    </button>
                  </div>
                </div>
              </div>

              {/* Fashion Week */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-pink-200">
                <div className="h-48 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Fashion Week Sale</h3>
                  <p className="text-gray-600 mb-4">Trending styles for everyone</p>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500 font-semibold">New arrivals</span>
                    <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-all">
                      Browse
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
