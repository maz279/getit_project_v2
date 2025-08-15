import React from 'react';
import { Header } from '@/components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import OrderHistory from '@/components/customer/OrderHistory';

/**
 * Order History Page - Amazon.com/Shopee.sg-Level Order Management
 * Complete order history page with tracking, filtering, and management
 */
const OrderHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderHistory userId="current-user" />
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;