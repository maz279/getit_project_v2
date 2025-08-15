/**
 * Subscription Page - Amazon.com/Shopee.sg-Level Subscription Management Page
 * Complete subscription management interface for customers
 * 
 * @fileoverview Enterprise-grade subscription page with Bangladesh cultural integration
 * @author GetIt Platform Team
 * @version 3.0.0
 */

import React from 'react';
import { SubscriptionCenter } from './subscription/SubscriptionCenter';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionCenter />
    </div>
  );
}