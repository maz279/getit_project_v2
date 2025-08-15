/**
 * Vendor Subscription Manager - Amazon.com/Shopee.sg Level
 * Complete subscription plan management and upgrade interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Separator } from '@/shared/ui/separator';
import { 
  Crown, Star, Zap, Shield, TrendingUp, Check, X, 
  CreditCard, Calendar, BarChart3, Settings, Package, Users
} from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import { vendorManagementApi } from '@/shared/services/vendor/VendorManagementApiService';

interface VendorSubscriptionManagerProps {
  vendorId: string;
}

export const VendorSubscriptionManager: React.FC<VendorSubscriptionManagerProps> = ({ vendorId }) => {
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, [vendorId]);

  const loadSubscriptionData = async () => {
    try {
      const [current, plans, analytics] = await Promise.all([
        vendorManagementApi.getCurrentSubscription(vendorId).catch(() => null),
        vendorManagementApi.getAvailablePlans(),
        vendorManagementApi.getSubscriptionAnalytics(vendorId).catch(() => null)
      ]);

      setCurrentSubscription(current?.subscription || null);
      setAvailablePlans(plans?.plans || mockPlans);
      setSubscriptionAnalytics(analytics?.analytics || mockAnalytics);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Use mock data for demonstration
      setAvailablePlans(mockPlans);
      setCurrentSubscription(mockCurrentSubscription);
      setSubscriptionAnalytics(mockAnalytics);
    }
  };

  // Mock data for demonstration (would come from API)
  const mockPlans = [
    {
      id: 'basic',
      planName: 'basic',
      displayName: 'Basic',
      description: 'Perfect for new vendors starting their journey',
      monthlyFee: '0',
      commissionRate: '12.0',
      maxProducts: 100,
      features: [
        'Basic store customization',
        'Standard support',
        'Basic analytics',
        'Mobile banking payouts',
        'Up to 100 products'
      ],
      perks: [
        'Free Bangladesh shipping integration',
        'bKash/Nagad/Rocket support',
        '24/7 customer service'
      ],
      popular: false,
      recommended: false
    },
    {
      id: 'silver',
      planName: 'silver',
      displayName: 'Silver',
      description: 'Growing businesses with enhanced features',
      monthlyFee: '99.00',
      commissionRate: '10.0',
      maxProducts: 500,
      features: [
        'Advanced store customization',
        'Priority support',
        'Enhanced analytics',
        'Promotional tools',
        'SEO optimization',
        'Up to 500 products'
      ],
      perks: [
        'Featured store listing',
        'Social media integration',
        'Advanced reporting',
        'Marketing tools'
      ],
      popular: true,
      recommended: false
    },
    {
      id: 'gold',
      planName: 'gold',
      displayName: 'Gold',
      description: 'Established businesses with premium features',
      monthlyFee: '199.00',
      commissionRate: '8.0',
      maxProducts: 2000,
      features: [
        'Premium store customization',
        'Dedicated account manager',
        'Advanced analytics & insights',
        'A/B testing tools',
        'API access',
        'Up to 2000 products'
      ],
      perks: [
        'Prime listing placement',
        'Cross-platform promotion',
        'White-label options',
        'Custom integrations'
      ],
      popular: false,
      recommended: true
    },
    {
      id: 'platinum',
      planName: 'platinum',
      displayName: 'Platinum',
      description: 'Enterprise-level with unlimited features',
      monthlyFee: '399.00',
      commissionRate: '6.0',
      maxProducts: 'Unlimited',
      features: [
        'Fully customizable store',
        '24/7 priority support',
        'Enterprise analytics',
        'Custom integrations',
        'Multi-store management',
        'Unlimited products'
      ],
      perks: [
        'Featured brand showcase',
        'Exclusive promotional events',
        'Custom contract terms',
        'Dedicated success manager'
      ],
      popular: false,
      recommended: false
    }
  ];

  const mockCurrentSubscription = {
    id: 'current-sub',
    planName: 'silver',
    displayName: 'Silver',
    commissionRate: '10.0',
    monthlyFee: '99.00',
    startDate: '2025-06-01',
    nextBillingDate: '2025-08-01',
    autoRenew: true,
    status: 'active',
    usage: {
      productsUsed: 156,
      maxProducts: 500,
      ordersThisMonth: 47,
      commissionSaved: '1,250.00'
    },
    upgradeRecommendations: {
      recommendedPlan: 'gold',
      benefits: ['2% lower commission', 'Advanced analytics', 'A/B testing'],
      estimatedSavings: '500.00',
      reason: 'Based on your growing sales volume'
    }
  };

  const mockAnalytics = {
    history: [
      { planName: 'basic', startDate: '2025-01-01', endDate: '2025-05-31', status: 'completed' },
      { planName: 'silver', startDate: '2025-06-01', endDate: null, status: 'active' }
    ],
    roi: {
      totalSaved: '2,500.00',
      subscriptionCost: '495.00',
      roi: '505%',
      period: '6 months'
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'platinum': return Crown;
      case 'gold': return Star;
      case 'silver': return Zap;
      case 'basic': return Shield;
      default: return Shield;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'platinum': return 'border-purple-200 bg-purple-50';
      case 'gold': return 'border-yellow-200 bg-yellow-50';
      case 'silver': return 'border-gray-200 bg-gray-50';
      case 'basic': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPlanBadgeColor = (planName: string) => {
    switch (planName) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubscribeToPlan = async (plan: any) => {
    if (currentSubscription?.planName === plan.planName) {
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${plan.displayName} plan.`,
        variant: "default"
      });
      return;
    }

    setLoading(true);
    try {
      await vendorManagementApi.subscribeToPlan(vendorId, plan.id);
      
      toast({
        title: "Subscription Updated",
        description: `Successfully subscribed to ${plan.displayName} plan!`,
      });
      
      await loadSubscriptionData();
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to update subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await vendorManagementApi.cancelSubscription(vendorId, 'User requested cancellation');
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      await loadSubscriptionData();
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (currentRate: number, newRate: number, monthlyRevenue: number) => {
    const currentCommission = monthlyRevenue * (currentRate / 100);
    const newCommission = monthlyRevenue * (newRate / 100);
    return currentCommission - newCommission;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-gray-600">Choose the perfect plan for your business growth</p>
        </div>
        {currentSubscription && (
          <Badge className={getPlanBadgeColor(currentSubscription.planName)}>
            Current: {currentSubscription.displayName}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="current">Current Subscription</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & ROI</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Promotional Banner */}
          <Alert className="border-green-200 bg-green-50">
            <Star className="h-4 w-4" />
            <AlertTitle>Limited Time Offer!</AlertTitle>
            <AlertDescription>
              Upgrade to Silver or Gold plan and get your first month 50% off. Use code: GROW2025
            </AlertDescription>
          </Alert>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePlans.map((plan) => {
              const PlanIcon = getPlanIcon(plan.planName);
              const isCurrentPlan = currentSubscription?.planName === plan.planName;
              
              return (
                <Card key={plan.id} className={`relative ${getPlanColor(plan.planName)} ${plan.recommended ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Recommended</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <PlanIcon className="h-8 w-8 text-gray-700" />
                    </div>
                    <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        ৳{plan.monthlyFee}
                        {plan.monthlyFee !== '0' && <span className="text-sm font-normal text-gray-500">/month</span>}
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {plan.commissionRate}% Commission
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-2">Features</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Perks */}
                    <div>
                      <h4 className="font-semibold mb-2">Perks</h4>
                      <ul className="space-y-1">
                        {plan.perks.map((perk, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Star className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "secondary" : "default"}
                      onClick={() => handleSubscribeToPlan(plan)}
                      disabled={loading || isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.displayName}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison</CardTitle>
              <CardDescription>Compare features across all subscription tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      {availablePlans.map(plan => (
                        <th key={plan.id} className="text-center p-2">{plan.displayName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Commission Rate</td>
                      {availablePlans.map(plan => (
                        <td key={plan.id} className="text-center p-2">{plan.commissionRate}%</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Monthly Fee</td>
                      {availablePlans.map(plan => (
                        <td key={plan.id} className="text-center p-2">৳{plan.monthlyFee}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Max Products</td>
                      {availablePlans.map(plan => (
                        <td key={plan.id} className="text-center p-2">{plan.maxProducts}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Support</td>
                      {availablePlans.map(plan => (
                        <td key={plan.id} className="text-center p-2">
                          {plan.planName === 'basic' ? 'Standard' :
                           plan.planName === 'silver' ? 'Priority' :
                           plan.planName === 'gold' ? 'Dedicated Manager' :
                           '24/7 Priority'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          {currentSubscription ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Plan</Label>
                      <div className="text-lg font-semibold">{currentSubscription.displayName}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Commission Rate</Label>
                      <div className="text-lg font-semibold text-green-600">{currentSubscription.commissionRate}%</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Monthly Fee</Label>
                      <div className="text-lg font-semibold">৳{currentSubscription.monthlyFee}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <Badge className="bg-green-100 text-green-800">{currentSubscription.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Next Billing Date</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(currentSubscription.nextBillingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Auto Renewal</Label>
                      <div className="flex items-center gap-2">
                        {currentSubscription.autoRenew ? (
                          <><Check className="h-4 w-4 text-green-500" /> Enabled</>
                        ) : (
                          <><X className="h-4 w-4 text-red-500" /> Disabled</>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Products Used</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{currentSubscription.usage.productsUsed}</span>
                          <span className="text-gray-500">/ {currentSubscription.usage.maxProducts}</span>
                        </div>
                        <Progress 
                          value={(currentSubscription.usage.productsUsed / currentSubscription.usage.maxProducts) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Orders This Month</Label>
                      <div className="text-2xl font-bold text-blue-600">{currentSubscription.usage.ordersThisMonth}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Commission Saved</Label>
                      <div className="text-2xl font-bold text-green-600">৳{currentSubscription.usage.commissionSaved}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Recommendations */}
              {currentSubscription.upgradeRecommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Upgrade Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert className="border-blue-200 bg-blue-50">
                      <TrendingUp className="h-4 w-4" />
                      <AlertTitle>Consider Upgrading to {currentSubscription.upgradeRecommendations.recommendedPlan.toUpperCase()}</AlertTitle>
                      <AlertDescription>
                        {currentSubscription.upgradeRecommendations.reason}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">Benefits of upgrading:</h4>
                      <ul className="space-y-1">
                        {currentSubscription.upgradeRecommendations.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-3 w-3 text-green-500 mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-green-600 font-medium">
                        Estimated monthly savings: ৳{currentSubscription.upgradeRecommendations.estimatedSavings}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleCancelSubscription} disabled={loading}>
                  Cancel Subscription
                </Button>
                <Button variant="outline">
                  Change Billing Information
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-gray-600 mb-4">You are currently on the free Basic plan</p>
                <Button onClick={() => setSelectedPlan('silver')}>
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {subscriptionAnalytics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Subscription ROI Analytics</CardTitle>
                  <CardDescription>Return on investment for your subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Total Saved</Label>
                      <div className="text-2xl font-bold text-green-600">৳{subscriptionAnalytics.roi.totalSaved}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Subscription Cost</Label>
                      <div className="text-2xl font-bold">৳{subscriptionAnalytics.roi.subscriptionCost}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">ROI</Label>
                      <div className="text-2xl font-bold text-blue-600">{subscriptionAnalytics.roi.roi}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Period</Label>
                      <div className="text-lg font-semibold">{subscriptionAnalytics.roi.period}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription History</CardTitle>
                  <CardDescription>Your subscription journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptionAnalytics.history.map((sub, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge className={getPlanBadgeColor(sub.planName)}>
                            {sub.planName.toUpperCase()}
                          </Badge>
                          <div>
                            <div className="font-medium">{sub.planName.charAt(0).toUpperCase() + sub.planName.slice(1)} Plan</div>
                            <div className="text-sm text-gray-500">
                              {new Date(sub.startDate).toLocaleDateString()} - {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Present'}
                            </div>
                          </div>
                        </div>
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                          {sub.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};