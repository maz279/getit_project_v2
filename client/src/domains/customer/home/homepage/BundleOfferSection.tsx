
import React from 'react';
import { ShoppingBag, Gift, ArrowRight } from 'lucide-react';

export const BundleOfferSection: React.FC = () => {
  const bundles = [
    {
      title: "Electronics Bundle",
      items: ["Smartphone", "Wireless Earbuds", "Power Bank"],
      originalPrice: 899,
      bundlePrice: 649,
      savings: 250,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
    },
    {
      title: "Home & Kitchen Bundle",
      items: ["Coffee Maker", "Blender", "Toaster"],
      originalPrice: 599,
      bundlePrice: 399,
      savings: 200,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
    },
    {
      title: "Fashion Bundle",
      items: ["Jacket", "Jeans", "Sneakers"],
      originalPrice: 299,
      bundlePrice: 199,
      savings: 100,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Bundle Offers</h2>
          </div>
          <p className="text-gray-600 text-lg">Save more when you buy together</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bundles.map((bundle, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="relative">
                <img 
                  src={bundle.image} 
                  alt={bundle.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Save ${bundle.savings}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{bundle.title}</h3>
                
                <div className="mb-4">
                  {bundle.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 text-gray-600 mb-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-gray-400 line-through text-lg">${bundle.originalPrice}</span>
                    <span className="text-2xl font-bold text-green-600 ml-2">${bundle.bundlePrice}</span>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {Math.round((bundle.savings / bundle.originalPrice) * 100)}% OFF
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
                  Add Bundle to Cart <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
