
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Star, Users, TrendingUp, Shield, Smartphone, Truck, BarChart, MessageCircle, Gift, DollarSign, Globe, Award } from 'lucide-react';

interface WelcomeBenefitsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

const vendorTypes = [
  {
    id: 'individual',
    title: 'Individual Seller',
    description: 'Perfect for personal items and crafts',
    features: ['No trade license required', '3% commission', 'Basic analytics'],
    icon: Users,
    badge: 'Most Popular'
  },
  {
    id: 'small-business',
    title: 'Small Business',
    description: 'Registered business with trade license',
    features: ['Full business features', '2% commission', 'Advanced analytics'],
    icon: TrendingUp,
    badge: 'Recommended'
  },
  {
    id: 'enterprise',
    title: 'Enterprise Vendor',
    description: 'Large-scale business with multiple stores',
    features: ['1.5% commission', 'Dedicated support', 'Custom features'],
    icon: Award,
    badge: 'Premium'
  },
  {
    id: 'digital',
    title: 'Digital Services',
    description: 'Software & digital products',
    features: ['App development', 'Custom commission', 'Special category'],
    icon: Smartphone,
    badge: 'New'
  }
];

const benefits = [
  { icon: DollarSign, title: 'LOW COMMISSION', subtitle: 'Starting from 2%', description: 'Transparent pricing' },
  { icon: BarChart, title: 'GROW SALES', subtitle: 'Reach 2M+ customers', description: 'Marketing support' },
  { icon: Shield, title: 'SECURE', subtitle: 'Bank-level', description: 'security' },
  { icon: Smartphone, title: 'MOBILE BANKING', subtitle: 'bKash, Nagad, Rocket', description: 'Instant payouts' },
  { icon: Truck, title: 'FREE LOGISTICS', subtitle: 'Pathao, Paperfly', description: 'nationwide delivery' },
  { icon: Globe, title: 'LOCAL FOCUS', subtitle: 'Bangladesh', description: 'market experts' },
  { icon: BarChart, title: 'REAL-TIME DATA', subtitle: 'Sales analytics', description: 'Business insights' },
  { icon: MessageCircle, title: '24/7 SUPPORT', subtitle: 'Bengali & English', description: 'Live chat support' },
  { icon: Gift, title: 'FESTIVALS', subtitle: 'Eid, Pohela', description: 'Boishakh sales' }
];

const successStories = [
  {
    name: "Karim's Electronics",
    revenue: "৳2,50,000/month",
    location: "Dhaka",
    image: "👨‍💼",
    quote: "GetIt provided everything I needed to grow my electronics business. The customer support in Bengali is excellent!"
  },
  {
    name: "Fatima's Fashion",
    orders: "1000+ orders/month",
    location: "Chittagong",
    image: "👩‍💼",
    quote: "Amazing platform for fashion sellers. The mobile banking integration made payments so easy."
  },
  {
    name: "Ahmed's Books",
    growth: "300% growth",
    location: "Sylhet",
    image: "👨‍🎓",
    quote: "Best decision for my book business. The festival season sales were incredible!"
  }
];

const stats = [
  { label: "Active Customers", value: "2,000,000+", icon: Users },
  { label: "Successful Vendors", value: "5,000+", icon: Award },
  { label: "Orders Delivered Daily", value: "50,000+", icon: Truck },
  { label: "Average Rating", value: "4.8/5", icon: Star },
  { label: "Districts Covered", value: "All 64", icon: Globe },
  { label: "Total Sales Generated", value: "৳500 Crore+", icon: DollarSign }
];

export const WelcomeBenefitsStep: React.FC<WelcomeBenefitsStepProps> = ({ data, updateData, onNext }) => {
  const handleVendorTypeSelect = (type: string) => {
    updateData({ vendorType: type });
  };

  const handleStartJourney = () => {
    // If no vendor type selected, default to individual and proceed
    if (!data.vendorType) {
      handleVendorTypeSelect('individual');
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">🚀 Become a GetIt Vendor</h2>
        <p className="text-xl text-gray-600 mb-6">Join Bangladesh's Fastest Growing Marketplace</p>
        <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
          <span className="flex items-center gap-1">
            <span className="text-2xl">🇧🇩</span>
            Already 5,000+ successful vendors serving millions of customers across Bangladesh
          </span>
        </div>
        
        <Button 
          size="lg" 
          className="mb-6 text-lg py-3 px-8"
          onClick={handleStartJourney}
        >
          🏪 Start Your Business Journey
        </Button>
        
        <div className="bg-blue-50 p-4 rounded-lg inline-block">
          <p className="text-blue-800 font-medium">⭐ "GetIt changed my business completely" - Rashida Khan</p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Why Choose GetIt?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center p-4">
              <CardContent className="pt-4">
                <benefit.icon className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h4 className="font-bold text-lg text-gray-800">{benefit.title}</h4>
                <p className="font-semibold text-blue-600">{benefit.subtitle}</p>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Vendor Success Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-3">{story.image}</div>
                <h4 className="font-bold text-lg">{story.name}</h4>
                <p className="text-blue-600 font-semibold">{story.revenue || story.orders || story.growth}</p>
                <p className="text-gray-500 text-sm mb-3">{story.location}</p>
                <p className="text-sm text-gray-600 italic">"{story.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Main testimonial */}
        <div className="mt-6 bg-green-50 p-6 rounded-lg">
          <p className="text-center text-green-800 font-medium italic">
            "GetIt provided everything I needed to grow my electronics business. The customer support in Bengali is excellent!"
          </p>
          <p className="text-center text-green-600 font-semibold mt-2">- Md. Karim, TechZone BD</p>
        </div>
      </div>

      {/* Platform Statistics */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">🎯 GetIt Platform Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-4">
              <CardContent className="pt-4">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-green-600 font-semibold">🔒 Certified by Bangladesh Bank</p>
          <p className="text-green-600 font-semibold">✅ Registered with BTRC</p>
          <p className="text-green-600 font-semibold">🛡️ SSL Secured & PCI Compliant</p>
        </div>
      </div>

      {/* Vendor Type Selection */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6">Ready to Get Started?</h3>
        <p className="text-center text-gray-600 mb-6">Choose Your Vendor Type:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendorTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = data.vendorType === type.id;
            
            return (
              <Card 
                key={type.id} 
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`}
                onClick={() => handleVendorTypeSelect(type.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-12 h-12 text-blue-600" />
                    {type.badge && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {type.badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-xl font-bold mb-2">{type.title}</h4>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">💡 Not sure? Start with Individual and upgrade later</p>
          
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => {
                handleVendorTypeSelect('individual');
                onNext();
              }}
              variant="outline"
              className="min-w-[200px]"
            >
              Continue as Individual
            </Button>
            <Button 
              onClick={() => {
                handleVendorTypeSelect('small-business');
                onNext();
              }}
              className="min-w-[200px]"
            >
              Continue as Business
            </Button>
          </div>
        </div>
      </div>

      {data.vendorType && (
        <div className="flex justify-center">
          <Button 
            onClick={onNext} 
            className="min-w-[200px] text-lg py-3"
          >
            Continue with {vendorTypes.find(t => t.id === data.vendorType)?.title}
          </Button>
        </div>
      )}
    </div>
  );
};
