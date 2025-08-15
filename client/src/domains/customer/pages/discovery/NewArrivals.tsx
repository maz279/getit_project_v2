
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { NewArrivalsHero } from '../../components/newarrivals/NewArrivalsHero';
import { NewArrivalsNavigationMap } from '../../components/newarrivals/NewArrivalsNavigationMap';
import { NewArrivalsStats } from '../../components/newarrivals/NewArrivalsStats';
import { TodaysArrivals } from '../../components/newarrivals/TodaysArrivals';
import { CategoryShowcase } from '../../components/newarrivals/CategoryShowcase';
import { SmartShoppingFeatures } from '../../components/newarrivals/SmartShoppingFeatures';
import { SpecialFeatures } from '../../components/newarrivals/SpecialFeatures';
import { LimitedTimeOffers } from '../../components/newarrivals/LimitedTimeOffers';
import { TrendingNow } from '../../components/newarrivals/TrendingNow';
import { LatestProducts } from '../../components/newarrivals/LatestProducts';
import { CustomerFavorites } from '../../components/newarrivals/CustomerFavorites';
import { BrandSpotlight } from '../../components/newarrivals/BrandSpotlight';
import { RecentlyLaunched } from '../../components/newarrivals/RecentlyLaunched';
import { PreOrderSection } from '../../components/newarrivals/PreOrderSection';
import { SeasonalCollections } from '../../components/newarrivals/SeasonalCollections';
import { GetStartedSection } from '../../components/newarrivals/GetStartedSection';

const NewArrivals: React.FC = () => {
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <NewArrivalsHero />
        <NewArrivalsNavigationMap />
        <NewArrivalsStats />
        <CategoryShowcase />
        <SmartShoppingFeatures />
        <SpecialFeatures />
        <TodaysArrivals />
        <LimitedTimeOffers />
        <TrendingNow />
        <LatestProducts />
        <CustomerFavorites />
        <BrandSpotlight />
        <RecentlyLaunched />
        <PreOrderSection />
        <SeasonalCollections />
        <GetStartedSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default NewArrivals;
