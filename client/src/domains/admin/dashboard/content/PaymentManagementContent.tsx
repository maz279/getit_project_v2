
import React from 'react';

interface PaymentManagementContentProps {
  selectedSubmenu: string;
}

export const PaymentManagementContent: React.FC<PaymentManagementContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
      <p className="text-gray-600">Payment management content for {selectedSubmenu}</p>
    </div>
  );
};
