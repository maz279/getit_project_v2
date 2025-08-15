
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { VendorHeroSection } from './VendorHeroSection';
import { VendorRegistrationSection } from './VendorRegistrationSection';

export const VendorRegistrationPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <VendorHeroSection />
        <VendorRegistrationSection />
      </main>
      
      <Footer />
    </div>
  );
};
