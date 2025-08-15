import React from 'react';

export const BrandSpotlight: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Brand Spotlight</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              T
            </div>
            <h3 className="text-xl font-semibold mb-2">TechMaster</h3>
            <p className="text-sm opacity-90 mb-4">Premium electronics and gadgets</p>
            <div className="text-sm text-blue-400">50+ New Products</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              F
            </div>
            <h3 className="text-xl font-semibold mb-2">FashionHub</h3>
            <p className="text-sm opacity-90 mb-4">Trendy fashion and lifestyle</p>
            <div className="text-sm text-pink-400">35+ New Products</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              H
            </div>
            <h3 className="text-xl font-semibold mb-2">HomeComfort</h3>
            <p className="text-sm opacity-90 mb-4">Home and garden essentials</p>
            <div className="text-sm text-green-400">28+ New Products</div>
          </div>
        </div>
      </div>
    </div>
  );
};