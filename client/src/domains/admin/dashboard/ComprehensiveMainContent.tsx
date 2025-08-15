
import React from 'react';
import { ContentRouter } from './content/routing/ContentRouter';

interface ComprehensiveMainContentProps {
  selectedMenu: string;
  selectedSubmenu: string;
}

export const ComprehensiveMainContent: React.FC<ComprehensiveMainContentProps> = ({
  selectedMenu,
  selectedSubmenu
}) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <ContentRouter selectedMenu={selectedMenu} selectedSubmenu={selectedSubmenu} />
    </div>
  );
};
