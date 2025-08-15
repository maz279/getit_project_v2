
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowLeft, ArrowRight, Truck, Clock, MapPin, CheckCircle } from 'lucide-react';

interface ShippingConfigStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ShippingConfigStep: React.FC<ShippingConfigStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}) => {
  return (
    <div className="space-y-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-8 shadow-xl border border-orange-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">🚚 Shipping Configuration</h2>
        <p className="text-gray-600 text-lg">We'll handle shipping and logistics for you</p>
      </div>

      {/* Enhanced Shipping Partners */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-200">
        <h3 className="text-xl font-semibold mb-4 text-orange-800">📦 Our Logistics Partners</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <CardContent className="pt-6 text-center">
              <Truck className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h4 className="font-semibold mb-2">Pathao Courier</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>✅ Dhaka: Same day delivery</p>
                <p>✅ Major cities: 1-2 days</p>
                <p>✅ All districts covered</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <CardContent className="pt-6 text-center">
              <Truck className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h4 className="font-semibold mb-2">Paperfly</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>✅ Express delivery: 24 hours</p>
                <p>✅ Regular: 2-3 days</p>
                <p>✅ Cash on delivery</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <CardContent className="pt-6 text-center">
              <Truck className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h4 className="font-semibold mb-2">SA Paribahan</h4>
              <div className="space-y-1 text-sm text-purple-700">
                <p>✅ Nationwide coverage</p>
                <p>✅ Bulk deliveries</p>
                <p>✅ Affordable rates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pickup Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            📍 Pickup Configuration
          </CardTitle>
          <CardDescription>
            Your products will be picked up from your business address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Pickup Address Confirmed</h4>
            <div className="text-sm text-green-700">
              <p className="font-medium">{data.businessName}</p>
              <p>{data.streetAddress}</p>
              <p>{data.area}, {data.upazila}, {data.district}</p>
              <p>{data.division} - {data.postalCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🕐 Pickup Schedule</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Daily pickup: 10 AM - 6 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Same-day pickup for orders before 2 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Saturday pickup available</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Friday: Limited pickup (12 PM - 4 PM)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📋 Pickup Requirements</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Proper packaging required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Product labels provided</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Order confirmation needed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Contact person available</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Delivery Coverage</CardTitle>
          <CardDescription>
            We deliver to all 64 districts of Bangladesh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🏙️ Major Cities</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Dhaka: Same day / Next day</li>
                <li>• Chittagong: 1-2 days</li>
                <li>• Sylhet: 1-2 days</li>
                <li>• Rajshahi: 1-2 days</li>
                <li>• Khulna: 1-2 days</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🏘️ District Towns</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• All 64 districts covered</li>
                <li>• Standard: 2-3 days</li>
                <li>• Express: 1-2 days</li>
                <li>• Cash on delivery available</li>
                <li>• Real-time tracking</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🏔️ Remote Areas</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Upazila level delivery</li>
                <li>• 3-5 business days</li>
                <li>• Additional handling fee may apply</li>
                <li>• Customer notification provided</li>
                <li>• Return policy applicable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-yellow-800 mb-3">💰 Shipping Rates & Policies</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-yellow-700 mb-2">🚚 Delivery Charges</h5>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• Inside Dhaka: ৳60-80</li>
                <li>• Outside Dhaka: ৳100-120</li>
                <li>• Express delivery: +৳50</li>
                <li>• Free shipping on orders ৳1000+</li>
                <li>• Bulk orders: Special rates</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-yellow-700 mb-2">📋 Important Policies</h5>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• Customer pays delivery charges</li>
                <li>• Returns: Free reverse pickup</li>
                <li>• Damaged items: Vendor responsibility</li>
                <li>• Cash collection: Direct to vendor</li>
                <li>• Insurance available for high-value items</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onPrev} variant="outline" className="min-w-[120px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} className="min-w-[120px]">
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
