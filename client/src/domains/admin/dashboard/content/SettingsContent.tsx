
import React from 'react';

interface SettingsContentProps {
  selectedSubmenu: string;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings & Configuration</h1>
      <p className="text-gray-600">Settings content for {selectedSubmenu}</p>
    </div>
  );
};
