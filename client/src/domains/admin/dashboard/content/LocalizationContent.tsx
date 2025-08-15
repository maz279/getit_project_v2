import React from 'react';
import LocalizationDashboard from '../../localization/LocalizationDashboard';

interface LocalizationContentProps {
  activeTab: string;
}

export default function LocalizationContent({ activeTab }: LocalizationContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'localization-dashboard':
      case 'translations':
      case 'languages':
      case 'cultural-settings':
      case 'bangla-support':
        return <LocalizationDashboard />;
      default:
        return <LocalizationDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}