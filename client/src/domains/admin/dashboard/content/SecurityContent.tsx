
import React from 'react';

interface SecurityContentProps {
  selectedSubmenu: string;
}

export const SecurityContent: React.FC<SecurityContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Security & Compliance</h1>
      <p className="text-gray-600">Security content for {selectedSubmenu}</p>
    </div>
  );
};
