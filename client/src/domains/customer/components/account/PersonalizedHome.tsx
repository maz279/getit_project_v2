import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Star, 
  TrendingUp, 
  Clock, 
  Gift,
  Package,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  Eye,
  Zap,
  Target,
  Calendar
} from 'lucide-react';

interface PersonalizedData {
  recommendations: Array<{
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    category: string;
  }>;
  recentlyViewed: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
    viewedAt: string;
  }>;
  tailoredDeals: Array<{
    id: string;
    title: string;
    discount: number;
    validUntil: string;
    category: string;
  }>;
  shoppingGoals: Array<{
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }>;
}

export const PersonalizedHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recommendations');

  // Mock personalized data - in real app, this would come from API
  const personalizedData: PersonalizedData = {
    recommendations: [
      {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        price: 2500,
        originalPrice: 3200,
        image: '/api/placeholder/200/200',
        rating: 4.5,
        reviews: 124,
        category: 'Electronics'
      },
      {
        id: '2',
        title: 'Premium Cotton T-Shirt',
        price: 800,
        originalPrice: 1200,
        image: '/api/placeholder/200/200',
        rating: 4.2,
        reviews: 89,
        category: 'Fashion'
      },
      {
        id: '3',
        title: 'Stainless Steel Water Bottle',
        price: 650,
        image: '/api/placeholder/200/200',
        rating: 4.8,
        reviews: 203,
        category: 'Lifestyle'
      }
    ],
    recentlyViewed: [
      {
        id: '1',
        title: 'Gaming Keyboard',
        price: 4500,
        image: '/api/placeholder/150/150',
        viewedAt: '2 hours ago'
      },
      {
        id: '2',
        title: 'Office Chair',
        price: 8500,
        image: '/api/placeholder/150/150',
        viewedAt: '1 day ago'
      },
      {
        id: '3',
        title: 'Smart Watch',
        price: 12000,
        image: '/api/placeholder/150/150',
        viewedAt: '3 days ago'
      }
    ],
    tailoredDeals: [
      {
        id: '1',
        title: 'Electronics Flash Sale',
        discount: 30,
        validUntil: '2024-07-20',
        category: 'Electronics'
      },
      {
        id: '2',
        title: 'Fashion Week Special',
        discount: 25,
        validUntil: '2024-07-25',
        category: 'Fashion'
      },
      {
        id: '3',
        title: 'Home & Kitchen Deals',
        discount: 40,
        validUntil: '2024-07-18',
        category: 'Home'
      }
    ],
    shoppingGoals: [
      {
        id: '1',
        title: 'New Laptop Setup',
        targetAmount: 50000,
        currentAmount: 32000,
        deadline: '2024-08-15'
      },
      {
        id: '2',
        title: 'Home Office Upgrade',
        targetAmount: 25000,
        currentAmount: 18500,
        deadline: '2024-09-30'
      }
    ]
  };

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Your Personalized Shopping Experience</h1>
            <p className="text-purple-100">Discover products tailored just for you</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      {/* Personalized Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Recommended for You
              </CardTitle>
              <CardDescription>
                Based on your shopping history and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedData.recommendations.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{product.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-green-600">৳{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ৳{product.originalPrice}
                            </span>
                          )}
                        </div>
                        {product.originalPrice && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            {getDiscountPercentage(product.price, product.originalPrice)}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {product.rating} ({product.reviews})
                        </div>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                      <Button className="w-full" size="sm">
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recently Viewed
              </CardTitle>
              <CardDescription>
                Continue shopping from where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalizedData.recentlyViewed.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-600">Viewed {item.viewedAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">৳{item.price}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-500" />
                Tailored Deals
              </CardTitle>
              <CardDescription>
                Special offers based on your interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalizedData.tailoredDeals.map((deal) => (
                  <Card key={deal.id} className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-100 text-purple-700">
                          {deal.discount}% OFF
                        </Badge>
                        <Badge variant="outline">{deal.category}</Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{deal.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        Valid until {deal.validUntil}
                      </div>
                      <Button className="w-full" size="sm">
                        Explore Deal
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Shopping Goals
              </CardTitle>
              <CardDescription>
                Track your progress towards your shopping targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedData.shoppingGoals.map((goal) => (
                  <Card key={goal.id} className="border-2 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Badge variant="outline" className="text-green-700">
                          {Math.round(getProgressPercentage(goal.currentAmount, goal.targetAmount))}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>৳{goal.currentAmount} / ৳{goal.targetAmount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Deadline: {goal.deadline}</span>
                          <span>৳{goal.targetAmount - goal.currentAmount} remaining</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-3" size="sm">
                        View Related Products
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};