// SubscriptionCenter.tsx - Amazon.com/Shopee.sg-Level Subscription Management
import React, { useState, useEffect } from 'react';
import { Crown, Star, Check, X, CreditCard, Gift, TrendingUp, Calendar, Package, Truck, Shield, Zap } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: 'monthly' | 'yearly';
  features: string[];
  color: string;
  popular?: boolean;
  savings?: number;
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  benefits: {
    freeShipping: boolean;
    prioritySupport: boolean;
    exclusiveDeals: boolean;
    extendedReturns: boolean;
  };
}

const SubscriptionCenter: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Premium Subscription - Unlock Exclusive Benefits | GetIt Bangladesh',
    description: 'Join GetIt Premium for free shipping, exclusive deals, priority support, and extended returns. Choose from flexible subscription plans.',
    keywords: 'premium subscription, free shipping, exclusive deals, Bangladesh premium membership'
  });

  useEffect(() => {
    // Mock subscription data
    setTimeout(() => {
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'basic',
          name: 'GetIt Basic',
          price: 299,
          period: selectedPeriod,
          features: [
            'Free shipping on orders over ৳1000',
            'Basic customer support',
            '7-day return policy',
            'Standard delivery priority'
          ],
          color: 'blue'
        },
        {
          id: 'premium',
          name: 'GetIt Premium',
          price: selectedPeriod === 'monthly' ? 599 : 5990,
          originalPrice: selectedPeriod === 'yearly' ? 7188 : undefined,
          period: selectedPeriod,
          features: [
            'FREE shipping on ALL orders',
            '24/7 priority customer support',
            '30-day extended return policy',
            'Same-day delivery in Dhaka',
            'Exclusive flash sale access',
            'Premium member discounts',
            'Birthday & anniversary offers'
          ],
          color: 'purple',
          popular: true,
          savings: selectedPeriod === 'yearly' ? 17 : undefined
        },
        {
          id: 'elite',
          name: 'GetIt Elite',
          price: selectedPeriod === 'monthly' ? 999 : 9990,
          originalPrice: selectedPeriod === 'yearly' ? 11988 : undefined,
          period: selectedPeriod,
          features: [
            'All Premium benefits included',
            'Personal shopping assistant',
            'VIP customer service hotline',
            '60-day extended return policy',
            'Express delivery guarantee',
            'Elite-only product previews',
            'Concierge shopping service',
            'Annual gift vouchers worth ৳2000'
          ],
          color: 'gold',
          savings: selectedPeriod === 'yearly' ? 17 : undefined
        }
      ];

      const mockUserSubscription: UserSubscription = {
        id: 'sub-123',
        planId: 'premium',
        planName: 'GetIt Premium',
        status: 'active',
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        paymentMethod: 'bKash ****5678',
        benefits: {
          freeShipping: true,
          prioritySupport: true,
          exclusiveDeals: true,
          extendedReturns: true
        }
      };

      setPlans(mockPlans);
      setUserSubscription(mockUserSubscription);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-500 bg-blue-50';
      case 'purple': return 'border-purple-500 bg-purple-50';
      case 'gold': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPlanButtonColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700';
      case 'gold': return 'bg-yellow-600 hover:bg-yellow-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading subscription plans...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="h-12 w-12" />
            <h1 className="text-4xl md:text-6xl font-bold">GetIt Premium</h1>
          </div>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Unlock exclusive benefits, free shipping, and premium experiences with our subscription plans
          </p>
          
          {/* Period Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`font-medium ${selectedPeriod === 'monthly' ? 'text-white' : 'text-white/70'}`}>
              Monthly
            </span>
            <button
              onClick={() => setSelectedPeriod(selectedPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex items-center w-16 h-8 bg-white/20 rounded-full transition-colors"
            >
              <div className={`absolute w-6 h-6 bg-white rounded-full transition-transform ${
                selectedPeriod === 'yearly' ? 'translate-x-9' : 'translate-x-1'
              }`}></div>
            </button>
            <span className={`font-medium ${selectedPeriod === 'yearly' ? 'text-white' : 'text-white/70'}`}>
              Yearly
            </span>
            {selectedPeriod === 'yearly' && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Save 17%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Current Subscription */}
      {userSubscription && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Current Subscription</h2>
            
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{userSubscription.planName}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userSubscription.status)}`}>
                        {userSubscription.status.charAt(0).toUpperCase() + userSubscription.status.slice(1)}
                      </span>
                      <span className="text-gray-600">
                        Renews on {formatDate(userSubscription.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors mb-2">
                    Manage Subscription
                  </button>
                  <p className="text-sm text-gray-600">
                    Payment: {userSubscription.paymentMethod}
                  </p>
                </div>
              </div>
              
              {/* Active Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`flex items-center gap-3 p-4 rounded-lg ${userSubscription.benefits.freeShipping ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <Truck className={`h-6 w-6 ${userSubscription.benefits.freeShipping ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On all orders</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-4 rounded-lg ${userSubscription.benefits.prioritySupport ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <Shield className={`h-6 w-6 ${userSubscription.benefits.prioritySupport ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Priority Support</p>
                    <p className="text-sm text-gray-600">24/7 assistance</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-4 rounded-lg ${userSubscription.benefits.exclusiveDeals ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <Star className={`h-6 w-6 ${userSubscription.benefits.exclusiveDeals ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Exclusive Deals</p>
                    <p className="text-sm text-gray-600">Member-only offers</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-3 p-4 rounded-lg ${userSubscription.benefits.extendedReturns ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <Package className={`h-6 w-6 ${userSubscription.benefits.extendedReturns ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Extended Returns</p>
                    <p className="text-sm text-gray-600">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subscription Plans */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Choose Your Perfect Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className={`relative bg-white rounded-lg border-2 p-8 ${
                plan.popular ? 'border-purple-500 shadow-lg scale-105' : getPlanColor(plan.color)
              }`}>
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {/* Savings Badge */}
                {plan.savings && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Save {plan.savings}%
                    </span>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-4xl font-bold text-gray-900">৳{plan.price}</span>
                    <div className="text-left">
                      {plan.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">৳{plan.originalPrice}</div>
                      )}
                      <div className="text-sm text-gray-600">/{plan.period}</div>
                    </div>
                  </div>
                  
                  {selectedPeriod === 'yearly' && (
                    <p className="text-sm text-gray-600">
                      ৳{Math.round(plan.price / 12)} per month
                    </p>
                  )}
                </div>
                
                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Action Button */}
                <button className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${getPlanButtonColor(plan.color)}`}>
                  {userSubscription?.planId === plan.id ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Showcase */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Premium Member Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                Enjoy free shipping on all orders, no minimum purchase required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Priority Delivery</h3>
              <p className="text-gray-600">
                Get your orders delivered faster with priority processing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Exclusive Deals</h3>
              <p className="text-gray-600">
                Access member-only sales and early bird discounts.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Support</h3>
              <p className="text-gray-600">
                Get 24/7 priority customer support from our expert team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-700">
                Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your current billing period.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-700">
                We accept bKash, Nagad, Rocket, credit/debit cards, and bank transfers for subscription payments.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Is there a free trial available?
              </h3>
              <p className="text-gray-700">
                Yes! New members can enjoy a 7-day free trial of GetIt Premium with no commitment required.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Can I change my subscription plan?
              </h3>
              <p className="text-gray-700">
                Absolutely! You can upgrade or downgrade your plan at any time from your account settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export { SubscriptionCenter };
export default SubscriptionCenter;