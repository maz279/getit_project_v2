
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { DealsCountdown } from '../../components/bestsellers/DealsCountdown';
import { BestSellerOffers } from '../../components/bestsellers/BestSellerOffers';
import { BestSellersNavigationMap } from '../../components/bestsellers/BestSellersNavigationMap';
import { ProductRankings } from '../../components/bestsellers/ProductRankings';
import { TopSellingCategories } from '../../components/bestsellers/TopSellingCategories';
import { FeaturedBestSellers } from '../../components/bestsellers/FeaturedBestSellers';
import { CustomerReviews } from '../../components/bestsellers/CustomerReviews';
import { VendorSpotlight } from '../../components/bestsellers/VendorSpotlight';
import { TrustBadges } from '../../components/bestsellers/TrustBadges';
import { TrendingAnalytics } from '../../components/bestsellers/TrendingAnalytics';
import { useSEO } from '@/shared/hooks/useSEO';

const BestSellers: React.FC = () => {
  useSEO({
    title: 'Best Sellers | Top Rated Products in Bangladesh | GetIt',
    description: 'Discover Bangladesh\'s most popular products. Top-rated electronics, fashion, home essentials from verified vendors. Best prices, customer reviews, fast delivery.',
    keywords: 'best sellers bangladesh, top products, popular items, trending products, customer favorites, top rated, electronics bestsellers, fashion bestsellers',
    canonical: 'https://getit-bangladesh.com/best-sellers',
    ogType: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Best Sellers - Top Rated Products",
      "description": "Discover Bangladesh's most popular and top-rated products from verified vendors",
      "url": "https://getit-bangladesh.com/best-sellers",
      "isPartOf": {
        "@type": "WebSite",
        "name": "GetIt Bangladesh",
        "url": "https://getit-bangladesh.com"
      }
    }
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main>
        <DealsCountdown />
        <BestSellerOffers />
        <BestSellersNavigationMap />
        <ProductRankings />
        <TopSellingCategories />
        <FeaturedBestSellers />
        <CustomerReviews />
        <TrustBadges />
        <VendorSpotlight />
        <TrendingAnalytics />
      </main>
      
      <Footer />
    </div>
  );
};

export default BestSellers;
