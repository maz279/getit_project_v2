
import React from 'react';

interface AnalyticsContentProps {
  selectedSubmenu: string;
}

export const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>
      <p className="text-gray-600">Analytics content for {selectedSubmenu}</p>
    </div>
  );
};
