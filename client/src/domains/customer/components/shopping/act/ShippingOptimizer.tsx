/**
 * Phase 3: Act Stage - Shipping Optimizer
 * Amazon.com 5 A's Framework Implementation
 * Smart Delivery Options with Bangladesh Logistics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Star,
  Zap,
  Package,
  Calendar,
  Phone,
  CheckCircle,
  AlertCircle,
  Navigation,
  Globe,
  ShoppingBag,
  Home,
  Building,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShippingOptimizerProps {
  items: ShippingItem[];
  destination?: Address;
  className?: string;
}

interface ShippingItem {
  id: string;
  name: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  category: string;
  fragile: boolean;
}

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'home' | 'office' | 'pickup';
}

interface ShippingOption {
  id: string;
  name: string;
  provider: string;
  logo: string;
  type: 'express' | 'standard' | 'economy' | 'same-day' | 'pickup';
  price: number;
  originalPrice?: number;
  estimatedDays: string;
  features: string[];
  rating: number;
  tracking: boolean;
  insurance: boolean;
  recommended: boolean;
  eco: boolean;
  details: {
    pickupTime: string;
    deliveryWindow: string;
    restrictions: string[];
    specialServices: string[];
  };
}

interface OptimizationResult {
  totalWeight: number;
  totalValue: number;
  suggestedPackaging: string;
  estimatedCost: number;
  carbonFootprint: number;
  recommendations: string[];
}

const ShippingOptimizer: React.FC<ShippingOptimizerProps> = ({
  items,
  destination,
  className,
}) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(destination || null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [alternativeAddresses, setAlternativeAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load shipping data and optimize
    const loadShippingData = () => {
      const mockDestination: Address = deliveryAddress || {
        id: 'addr1',
        name: 'Ahmed Rahman',
        address: 'House 123, Road 45, Gulshan-2',
        city: 'Dhaka',
        area: 'Gulshan',
        postalCode: '1212',
        coordinates: { lat: 23.7941, lng: 90.4152 },
        type: 'home'
      };

      const mockItems: ShippingItem[] = items.length > 0 ? items : [
        {
          id: 'item1',
          name: 'Wireless Gaming Headset',
          weight: 0.5,
          dimensions: { length: 25, width: 20, height: 15 },
          value: 12500,
          category: 'Electronics',
          fragile: true
        }
      ];

      const mockShippingOptions: ShippingOption[] = [
        {
          id: 'express-same-day',
          name: 'Same Day Express',
          provider: 'GetIt Express',
          logo: '⚡',
          type: 'same-day',
          price: 150,
          originalPrice: 200,
          estimatedDays: 'Today (6-8 PM)',
          features: ['Same day delivery', 'GPS tracking', 'SMS updates', 'Call before delivery'],
          rating: 4.9,
          tracking: true,
          insurance: true,
          recommended: true,
          eco: false,
          details: {
            pickupTime: 'Within 2 hours',
            deliveryWindow: '6-8 PM today',
            restrictions: ['Dhaka city only', 'Before 3 PM orders'],
            specialServices: ['Fragile handling', 'Photo proof delivery']
          }
        },
        {
          id: 'express-next-day',
          name: 'Express Delivery',
          provider: 'Pathao Courier',
          logo: '🏍️',
          type: 'express',
          price: 100,
          estimatedDays: 'Tomorrow',
          features: ['Next day delivery', 'Real-time tracking', 'Insurance included', '24/7 support'],
          rating: 4.8,
          tracking: true,
          insurance: true,
          recommended: false,
          eco: false,
          details: {
            pickupTime: 'Within 4 hours',
            deliveryWindow: '10 AM - 8 PM',
            restrictions: ['Major cities only'],
            specialServices: ['Signature required', 'Age verification']
          }
        },
        {
          id: 'standard',
          name: 'Standard Delivery',
          provider: 'Sundarban Courier',
          logo: '📦',
          type: 'standard',
          price: 80,
          estimatedDays: '2-3 days',
          features: ['Reliable delivery', 'Basic tracking', 'Nationwide coverage', 'Insurance available'],
          rating: 4.6,
          tracking: true,
          insurance: false,
          recommended: false,
          eco: true,
          details: {
            pickupTime: 'Next business day',
            deliveryWindow: '9 AM - 6 PM',
            restrictions: ['Excluding remote areas'],
            specialServices: ['SMS notifications', 'Multiple delivery attempts']
          }
        },
        {
          id: 'economy',
          name: 'Economy Shipping',
          provider: 'Bangladesh Post',
          logo: '📮',
          type: 'economy',
          price: 50,
          estimatedDays: '5-7 days',
          features: ['Lowest cost', 'Basic service', 'Government backed', 'All areas covered'],
          rating: 4.2,
          tracking: false,
          insurance: false,
          recommended: false,
          eco: true,
          details: {
            pickupTime: '2-3 business days',
            deliveryWindow: '9 AM - 5 PM',
            restrictions: ['No fragile items'],
            specialServices: ['Registered post', 'Acknowledgement']
          }
        },
        {
          id: 'pickup',
          name: 'Store Pickup',
          provider: 'GetIt Store',
          logo: '🏪',
          type: 'pickup',
          price: 0,
          estimatedDays: 'Ready in 2 hours',
          features: ['Free pickup', 'No shipping fee', 'Instant availability', 'Quality check'],
          rating: 4.7,
          tracking: false,
          insurance: false,
          recommended: false,
          eco: true,
          details: {
            pickupTime: 'Ready in 2 hours',
            deliveryWindow: 'Store hours: 9 AM - 9 PM',
            restrictions: ['Valid ID required'],
            specialServices: ['Product demo', 'Immediate exchange']
          }
        }
      ];

      const mockOptimization: OptimizationResult = {
        totalWeight: mockItems.reduce((sum, item) => sum + item.weight, 0),
        totalValue: mockItems.reduce((sum, item) => sum + item.value, 0),
        suggestedPackaging: 'Medium box with fragile handling',
        estimatedCost: 120,
        carbonFootprint: 2.5,
        recommendations: [
          'Use bubble wrap for fragile electronics',
          'Same-day delivery recommended for high-value items',
          'Consider store pickup to save ৳150',
          'Express delivery offers best value for money'
        ]
      };

      const mockAlternatives: Address[] = [
        {
          id: 'office',
          name: 'Ahmed Rahman (Office)',
          address: 'Office 567, Building ABC, Motijheel',
          city: 'Dhaka',
          area: 'Motijheel',
          postalCode: '1000',
          coordinates: { lat: 23.7331, lng: 90.4075 },
          type: 'office'
        },
        {
          id: 'pickup-center',
          name: 'GetIt Pickup Center - Gulshan',
          address: 'Plot 15, Road 103, Gulshan-2',
          city: 'Dhaka',
          area: 'Gulshan',
          postalCode: '1212',
          coordinates: { lat: 23.7925, lng: 90.4078 },
          type: 'pickup'
        }
      ];

      setTimeout(() => {
        setShippingOptions(mockShippingOptions);
        setOptimization(mockOptimization);
        setDeliveryAddress(mockDestination);
        setAlternativeAddresses(mockAlternatives);
        setLoading(false);
      }, 1000);
    };

    loadShippingData();
  }, [items, destination]);

  const calculateSavings = (option: ShippingOption) => {
    if (!option.originalPrice) return 0;
    return option.originalPrice - option.price;
  };

  const ShippingOptionCard = ({ option }: { option: ShippingOption }) => (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        selectedOption === option.id && 'ring-2 ring-primary',
        option.recommended && 'border-orange-200 bg-orange-50'
      )}
      onClick={() => setSelectedOption(option.id)}
    >
      {option.recommended && (
        <Badge className="absolute -top-2 left-4 bg-orange-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          Recommended
        </Badge>
      )}
      
      <CardContent className="p-4 pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{option.logo}</div>
            <div>
              <h3 className="font-semibold">{option.name}</h3>
              <p className="text-sm text-muted-foreground">{option.provider}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-sm">{option.rating}</span>
            </div>
            {option.eco && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Eco-friendly
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-2xl font-bold text-primary">
              {option.price === 0 ? 'FREE' : `৳${option.price}`}
            </div>
            {option.originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                ৳{option.originalPrice}
              </div>
            )}
            {calculateSavings(option) > 0 && (
              <div className="text-sm text-green-600">
                Save ৳{calculateSavings(option)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold">{option.estimatedDays}</div>
            <div className="text-sm text-muted-foreground">Delivery time</div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span>Pickup:</span>
            <span className="font-medium">{option.details.pickupTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Delivery:</span>
            <span className="font-medium">{option.details.deliveryWindow}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {option.features.slice(0, 3).map((feature) => (
            <Badge key={feature} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {option.tracking && (
            <div className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              <span>Tracking</span>
            </div>
          )}
          {option.insurance && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Insured</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-500" />
          Smart Shipping Optimizer
        </h1>
        <p className="text-muted-foreground">
          AI-powered delivery optimization for Bangladesh logistics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Shipping Options */}
        <div className="lg:col-span-3">
          {/* Delivery Address */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deliveryAddress && (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {deliveryAddress.type === 'home' && <Home className="h-6 w-6 text-blue-600" />}
                      {deliveryAddress.type === 'office' && <Building className="h-6 w-6 text-blue-600" />}
                      {deliveryAddress.type === 'pickup' && <Package className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-semibold">{deliveryAddress.name}</p>
                      <p className="text-sm text-muted-foreground">{deliveryAddress.address}</p>
                      <p className="text-sm text-muted-foreground">{deliveryAddress.city}, {deliveryAddress.area} - {deliveryAddress.postalCode}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimization Results */}
          {optimization && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Shipping Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{optimization.totalWeight}kg</div>
                    <div className="text-sm text-muted-foreground">Total Weight</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">৳{optimization.totalValue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Order Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">৳{optimization.estimatedCost}</div>
                    <div className="text-sm text-muted-foreground">Est. Shipping</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{optimization.carbonFootprint}kg</div>
                    <div className="text-sm text-muted-foreground">CO₂ Footprint</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="font-medium mb-2">AI Recommendations:</p>
                  <ul className="space-y-1">
                    {optimization.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <strong>Suggested Packaging:</strong> {optimization.suggestedPackaging}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Options */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Choose Shipping Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shippingOptions.map((option) => (
                <ShippingOptionCard key={option.id} option={option} />
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Delivery Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Add special delivery instructions (optional)..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-3 border rounded-lg min-h-20 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                e.g., "Call before delivery", "Leave with security", "Ring doorbell twice"
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Option Summary */}
          {selectedOption && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Option</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const option = shippingOptions.find(o => o.id === selectedOption);
                  if (!option) return null;
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.logo}</span>
                        <div>
                          <p className="font-semibold">{option.name}</p>
                          <p className="text-sm text-muted-foreground">{option.provider}</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {option.price === 0 ? 'FREE' : `৳${option.price}`}
                      </div>
                      <div className="text-sm">
                        <strong>Delivery:</strong> {option.estimatedDays}
                      </div>
                      <div className="space-y-1">
                        {option.details.specialServices.map((service) => (
                          <div key={service} className="flex items-center gap-1 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Alternative Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Alternative Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alternativeAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    onClick={() => setDeliveryAddress(addr)}
                  >
                    <div className="flex items-start gap-2">
                      {addr.type === 'office' && <Building className="h-4 w-4 mt-1" />}
                      {addr.type === 'pickup' && <Package className="h-4 w-4 mt-1" />}
                      <div>
                        <p className="font-medium text-sm">{addr.name}</p>
                        <p className="text-xs text-muted-foreground">{addr.address}</p>
                        <p className="text-xs text-muted-foreground">{addr.area}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Facts */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle>Shipping Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Nationwide delivery coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>99.2% on-time delivery rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Average delivery: 1.2 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-500" />
                  <span>24/7 tracking support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button 
            className="w-full" 
            size="lg"
            disabled={!selectedOption}
          >
            <Package className="h-4 w-4 mr-2" />
            Confirm Shipping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShippingOptimizer;