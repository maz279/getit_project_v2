
import React from 'react';
import { Star, Package } from 'lucide-react';

export const BrandSpotlight: React.FC = () => {
  const brands = [
    {
      name: 'Apple',
      logo: '/placeholder.svg',
      newProducts: 5,
      rating: 4.9,
      description: 'Latest iPhone and MacBook releases'
    },
    {
      name: 'Samsung',
      logo: '/placeholder.svg',
      newProducts: 8,
      rating: 4.8,
      description: 'New Galaxy series and home appliances'
    },
    {
      name: 'Nike',
      logo: '/placeholder.svg',
      newProducts: 12,
      rating: 4.7,
      description: 'Fresh sneaker drops and sportswear'
    },
    {
      name: 'Sony',
      logo: '/placeholder.svg',
      newProducts: 6,
      rating: 4.8,
      description: 'Audio equipment and gaming gear'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Brand Spotlight</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brands.map((brand, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-16 h-16 mx-auto mb-4 object-contain"
              />
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{brand.name}</h3>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <Package className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">{brand.newProducts} New Items</span>
              </div>
              
              <div className="flex items-center justify-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{brand.rating} Rating</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{brand.description}</p>
              
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                View New Items
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
