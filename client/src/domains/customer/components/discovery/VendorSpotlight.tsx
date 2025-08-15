
import React from 'react';
import { Star, Award, Truck, Shield } from 'lucide-react';

export const VendorSpotlight: React.FC = () => {
  const vendors = [
    {
      name: 'TechBD Solutions',
      rating: 4.9,
      products: 1250,
      sales: '50K+',
      speciality: 'Electronics & Gadgets',
      badge: 'Top Vendor',
      logo: '/placeholder.svg',
      features: ['Fast Shipping', 'Authentic Products', '24/7 Support']
    },
    {
      name: 'Bengal Fashion House',
      rating: 4.8,
      products: 850,
      sales: '35K+',
      speciality: 'Traditional Clothing',
      badge: 'Premium Seller',
      logo: '/placeholder.svg',
      features: ['Handcrafted', 'Quality Assured', 'Custom Sizes']
    },
    {
      name: 'Dhaka Home Essentials',
      rating: 4.7,
      products: 680,
      sales: '28K+',
      speciality: 'Home & Kitchen',
      badge: 'Trusted Partner',
      logo: '/placeholder.svg',
      features: ['Local Made', 'Eco-Friendly', 'Warranty']
    }
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">🏪 Featured Vendor Spotlight</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Meet our top-performing vendors who consistently deliver exceptional products and customer service. 
            These trusted partners have earned their reputation through quality, reliability, and customer satisfaction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vendors.map((vendor, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h3 className="font-bold text-lg">{vendor.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {vendor.badge}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{vendor.rating}</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-green-600 font-medium">{vendor.sales} sales</span>
              </div>
              
              <p className="text-gray-600 mb-3">{vendor.speciality}</p>
              <p className="text-sm text-gray-500 mb-4">{vendor.products} products available</p>
              
              <div className="space-y-2">
                {vendor.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Visit Store
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
