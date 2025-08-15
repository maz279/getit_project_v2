
import React, { useState } from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { WishlistManager } from '../../components/account/WishlistManager';

const Wishlist: React.FC = () => {
  const [showAnalytics, setShowAnalytics] = useState(false);



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            আমার পছন্দের তালিকা
          </h1>
          <p className="text-gray-600">
            আপনার পছন্দের পণ্যগুলি এখানে সংরক্ষণ করুন এবং সহজেই খুঁজে নিন
          </p>
        </div>

        <WishlistManager />
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist;
