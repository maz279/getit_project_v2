
import React from 'react';
import { OrderContentRouter } from './OrderManagement/OrderContentRouter';

interface OrderManagementContentProps {
  selectedSubmenu: string;
}

export const OrderManagementContent: React.FC<OrderManagementContentProps> = ({ selectedSubmenu }) => {
  return (
    <div className="p-6">
      <OrderContentRouter selectedSubmenu={selectedSubmenu} />
    </div>
  );
};
