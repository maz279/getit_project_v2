
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';
import { DailyOffers } from './deals/DailyOffers';

const DailyDeals: React.FC = () => {
  useSEO({
    title: 'Daily Deals - GetIt Bangladesh | Today\'s Best Offers',
    description: 'Discover today\'s best deals and discounts. New offers added daily on top products.',
    keywords: 'daily deals, today offers, discounts, bangladesh deals'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <DailyOffers />
      </main>
      
      <Footer />
    </div>
  );
};

export default DailyDeals;
