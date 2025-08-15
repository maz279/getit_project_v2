
import React from 'react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🕐 How Daily Deals Work</h2>
          <p className="text-xl text-gray-600">Simple steps to amazing savings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🌅</div>
            <h3 className="text-xl font-bold mb-3">New Deals Every Morning</h3>
            <p className="text-gray-600">Fresh deals launch daily at 6:00 AM Bangladesh time, featuring products across all categories.</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold mb-3">Time-Sensitive Savings</h3>
            <p className="text-gray-600">Most deals run for 24 hours or until stock expires. Popular items sell out quickly.</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-3">Mobile-First Shopping</h3>
            <p className="text-gray-600">Optimized for Bangladesh's mobile-first habits with fast loading on 2G/3G networks.</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Curated Selection</h3>
            <p className="text-gray-600">Each deal is personally selected based on vendor reliability and genuine savings.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
