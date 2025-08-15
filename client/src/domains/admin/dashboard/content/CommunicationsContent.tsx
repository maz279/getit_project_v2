
import React from 'react';

interface CommunicationsContentProps {
  selectedSubmenu: string;
}

export const CommunicationsContent: React.FC<CommunicationsContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Communications</h1>
      <p className="text-gray-600">Communications content for {selectedSubmenu}</p>
    </div>
  );
};
