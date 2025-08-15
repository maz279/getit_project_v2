import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { User, Heart, Star, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

interface PersonalizationSectionProps {
  className?: string;
}

export const PersonalizationSection: React.FC<PersonalizationSectionProps> = ({ className }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    'Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports', 'Beauty',
    'Automotive', 'Health', 'Jewelry', 'Toys', 'Food', 'Travel'
  ];

  const personalizedSections = [
    {
      title: 'Based on Your Browsing',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      items: ['Smartphones', 'Laptops', 'Headphones']
    },
    {
      title: 'Your Favorites',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      items: ['Saved Items', 'Wishlist', 'Liked Products']
    },
    {
      title: 'Trending for You',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: ['Popular Picks', 'Rising Stars', 'Hot Deals']
    }
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className={`py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Personalized Just for You
          </h2>
          <p className="text-gray-600">
            Your shopping experience, tailored to your preferences
          </p>
        </div>

        {/* Personalization Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {personalizedSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 50) + 10}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interest Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Tell us your interests
            </CardTitle>
            <p className="text-sm text-gray-600">
              Select categories you're interested in to get better recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <Button className="w-full sm:w-auto">
              Update Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
            <ShoppingBag className="w-5 h-5" />
            <span>Continue Shopping</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
            <Heart className="w-5 h-5" />
            <span>My Wishlist</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
            <Star className="w-5 h-5" />
            <span>My Reviews</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 p-4 h-auto">
            <TrendingUp className="w-5 h-5" />
            <span>Trending</span>
          </Button>
        </div>
      </div>
    </div>
  );
};