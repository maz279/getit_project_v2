
import React from 'react';

export const FooterCategories: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-green-300 mb-4">Shop by Category</h4>
      <div className="space-y-2">
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Electronics & Gadgets</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Fashion & Beauty</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Home & Garden</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Sports & Outdoor</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Books & Media</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Automotive</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Health & Wellness</a>
        <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors block">Baby & Kids</a>
      </div>
    </div>
  );
};
