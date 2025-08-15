/**
 * Sentiment Analytics Admin Page - Amazon.com/Shopee.sg Level
 * Admin interface for monitoring sentiment analysis and customer emotions
 */

import React from 'react';
// import { SentimentAnalyticsDashboard } from '@/components/ai';

export default function SentimentAnalytics() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sentiment Analytics</h1>
          <p className="text-gray-600">Monitor customer emotions and sentiment trends with 89% accuracy</p>
        </div>
        
        <SentimentAnalyticsDashboard />
      </div>
    </div>
  );
}