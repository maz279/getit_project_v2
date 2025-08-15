import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Check, Star, Crown, Zap } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  icon: React.ReactNode;
  minimumOrder: number;
  discountRange: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const PricingTiers: React.FC = () => {
  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      nameBn: 'শুরুর প্যাকেজ',
      description: 'Perfect for small businesses and startups',
      icon: <Star className="w-6 h-6" />,
      minimumOrder: 10,
      discountRange: '5-15%',
      features: [
        'Basic wholesale pricing',
        'Standard shipping',
        'Email support',
        'Basic payment terms',
        'Order tracking'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      nameBn: 'ব্যবসায়িক প্যাকেজ',
      description: 'Ideal for growing businesses and retailers',
      icon: <Zap className="w-6 h-6" />,
      minimumOrder: 50,
      discountRange: '15-30%',
      features: [
        'Enhanced wholesale pricing',
        'Priority shipping',
        'Phone & email support',
        'Flexible payment terms',
        'Advanced order tracking',
        'Dedicated account manager',
        'Custom packaging options'
      ],
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      nameBn: 'এন্টারপ্রাইজ প্যাকেজ',
      description: 'For large organizations and distributors',
      icon: <Crown className="w-6 h-6" />,
      minimumOrder: 500,
      discountRange: '30-50%',
      features: [
        'Maximum wholesale pricing',
        'Express shipping',
        '24/7 premium support',
        'Custom payment terms',
        'Real-time order tracking',
        'Dedicated account team',
        'Custom packaging & branding',
        'API integration',
        'White-label solutions'
      ],
      badge: 'Best Value'
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pricing Tiers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the right pricing tier for your business needs. All plans include our standard wholesale benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative ${tier.highlighted ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'} transition-shadow`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    {tier.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${tier.highlighted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {tier.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <p className="text-sm text-gray-500 mb-2">{tier.nameBn}</p>
                <CardDescription className="text-gray-600">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {tier.discountRange}
                  </div>
                  <p className="text-sm text-gray-500">
                    Discount Range
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum Order: {tier.minimumOrder} pieces
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Features Included:</h4>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className={`w-full ${tier.highlighted ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={tier.highlighted ? 'default' : 'outline'}
                  size="lg"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need a custom solution? We offer tailored packages for specific business requirements.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales Team
          </Button>
        </div>
      </div>
    </div>
  );
};