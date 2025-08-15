
import React from 'react';

export const DealCategoriesSection: React.FC = () => {
  const dealCategories = [
    { icon: '📱', title: 'Electronics & Mobile', description: 'Smartphones, accessories, gadgets' },
    { icon: '👗', title: 'Fashion & Lifestyle', description: 'Traditional wear, modern fashion' },
    { icon: '🏠', title: 'Home & Living', description: 'Furniture, appliances, decor' },
    { icon: '📚', title: 'Books & Education', description: 'Academic books, literature' },
    { icon: '🍲', title: 'Food & Groceries', description: 'Premium rice, spices, organics' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🛍️ Deal Categories</h2>
          <p className="text-xl text-gray-600">Discover deals across all your favorite categories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {dealCategories.map((category, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-bold mb-2">{category.title}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
