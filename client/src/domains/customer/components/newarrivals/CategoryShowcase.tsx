import React from 'react';

export const CategoryShowcase: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Electronics', icon: '📱', count: '45 new' },
            { name: 'Fashion', icon: '👕', count: '32 new' },
            { name: 'Home & Garden', icon: '🏠', count: '28 new' },
            { name: 'Sports', icon: '⚽', count: '15 new' },
            { name: 'Beauty', icon: '💄', count: '22 new' },
            { name: 'Books', icon: '📚', count: '18 new' }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center hover:shadow-md transition cursor-pointer">
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-blue-600">{category.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};