
import React from 'react';

interface OrderSubmenuContentProps {
  submenu: string;
}

export const OrderSubmenuContent: React.FC<OrderSubmenuContentProps> = ({ submenu }) => {
  const getSubmenuContent = () => {
    switch (submenu) {
      case 'new-orders':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">New Orders Management</h1>
            <p className="text-gray-600">Manage and process new incoming orders...</p>
          </div>
        );
      case 'returns-refunds':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Returns & Refunds</h1>
            <p className="text-gray-600">Handle customer returns and refund requests...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return getSubmenuContent();
};
