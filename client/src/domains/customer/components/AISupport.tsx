/**
 * AI Support Page - Amazon.com/Shopee.sg Level
 * Main page for AI-powered customer support with Sophie AI capabilities
 */

import React from 'react';
// import { AICustomerSupport } from '@/components/ai';

export default function AISupport() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Customer Support</h1>
          <p className="text-gray-600">Get instant help with Sophie AI - 80% resolution rate, 24/7 availability</p>
        </div>
        
        <AICustomerSupport />
      </div>
    </div>
  );
}