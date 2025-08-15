
import React from 'react';
import { VendorManagementRouter } from './forms/vendorManagement/VendorManagementRouter';

interface VendorManagementContentProps {
  selectedSubmenu: string;
}

export const VendorManagementContent: React.FC<VendorManagementContentProps> = ({ selectedSubmenu }) => {
  console.log('🔍 VendorManagementContent - selectedSubmenu received:', selectedSubmenu);
  
  return (
    <div className="p-6">
      <VendorManagementRouter selectedSubmenu={selectedSubmenu} />
    </div>
  );
};
