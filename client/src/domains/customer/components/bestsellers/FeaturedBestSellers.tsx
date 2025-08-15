import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
}

export const FeaturedBestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthenticProducts();
  }, []);

  const fetchAuthenticProducts = async () => {
    try {
      const response = await fetch('/api/search/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: 'bestseller', 
          page: 1, 
          limit: 3,
          dataIntegrity: 'authentic_only' 
        })
      });
      const data = await response.json();
      if (data.success && data.data.results) {
        setProducts(data.data.results);
      }
    } catch (error) {
      console.error('Error fetching authentic products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">✨ Featured Best Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
              <div className="bg-gray-200 h-48"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">✨ Featured Best Sellers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              <span className="text-gray-500">Authentic Product</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">{product.price}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Authentic</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-600">🔍 Loading authentic Bangladesh products...</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-200 h-48 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Smart Fitness Tracker</h3>
            <p className="text-sm text-gray-600 mb-2">Track your health and fitness</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">₹3,499</span>
              <span className="text-sm text-yellow-500">4.6★ (187)</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-200 h-48 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2">Portable Power Bank</h3>
            <p className="text-sm text-gray-600 mb-2">20,000mAh capacity</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">₹1,299</span>
              <span className="text-sm text-yellow-500">4.7★ (156)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};