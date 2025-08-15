import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
// import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
// Temporary placeholder until LoyaltyDashboard component is available
const LoyaltyDashboard = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Loyalty Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Your Points</h3>
        <p className="text-3xl font-bold text-blue-600">0 Points</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Current Tier</h3>
        <p className="text-xl font-semibold text-green-600">Bronze</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Available Rewards</h3>
        <p className="text-xl font-semibold text-orange-600">Coming Soon</p>
      </div>
    </div>
  </div>
);

/**
 * Loyalty Dashboard Page - Amazon.com/Shopee.sg-Level Rewards Program
 * Complete loyalty program with points, tiers, and rewards management
 */
const LoyaltyDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoyaltyDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default LoyaltyDashboardPage;