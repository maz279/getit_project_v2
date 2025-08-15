
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { BulkOrdersHero } from '../../components/bulkorders/BulkOrdersHero';
import { BulkOrdersNavigationMap } from '../../components/bulkorders/BulkOrdersNavigationMap';
import { BulkCategories } from '../../components/bulkorders/BulkCategories';
import { PricingTiers } from '../../components/bulkorders/PricingTiers';
import { CustomQuotes } from '../../components/bulkorders/CustomQuotes';
import { useSEO } from '@/shared/hooks/useSEO';

const BulkOrders: React.FC = () => {
  useSEO({
    title: 'Bulk Orders | Wholesale Prices | Business Solutions | GetIt Bangladesh',
    description: 'Get wholesale prices for bulk orders. Custom quotes, business solutions, bulk discounts for businesses, retailers, and organizations in Bangladesh.',
    keywords: 'bulk orders bangladesh, wholesale prices, business solutions, bulk discounts, corporate orders, wholesale marketplace, bulk purchasing',
    canonical: 'https://getit-bangladesh.com/bulk-orders',
    ogType: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Bulk Orders & Wholesale Solutions",
      "description": "Wholesale pricing and bulk order solutions for businesses and organizations",
      "provider": {
        "@type": "Organization",
        "name": "GetIt Bangladesh",
        "url": "https://getit-bangladesh.com"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Bangladesh"
      },
      "audience": {
        "@type": "BusinessAudience",
        "audienceType": "Business, Retailer, Organization"
      }
    }
  });

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <BulkOrdersHero />
        <BulkOrdersNavigationMap />
        <BulkCategories />
        <PricingTiers />
        <CustomQuotes />
      </main>
      
      <Footer />
    </div>
  );
};

export default BulkOrders;
