
import React from 'react';

interface MarketingContentProps {
  selectedSubmenu: string;
}

export const MarketingContent: React.FC<MarketingContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketing & Promotions</h1>
      <p className="text-gray-600">Marketing content for {selectedSubmenu}</p>
    </div>
  );
};
