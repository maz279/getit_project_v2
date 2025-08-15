
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Truck, Clock, MapPin, Package, Zap, Globe, DollarSign, Shield } from 'lucide-react';

const DeliveryInfo: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Delivery Information</h1>
          <p className="text-gray-600">Fast, reliable delivery across Bangladesh</p>
        </div>

        {/* Delivery Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Same Day Delivery</h3>
            <p className="text-sm text-gray-600 mb-3">Get your order within 6 hours</p>
            <p className="text-lg font-bold text-green-600">৳100</p>
            <p className="text-xs text-gray-500">Available in Dhaka city</p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Express Delivery</h3>
            <p className="text-sm text-gray-600 mb-3">Next day delivery</p>
            <p className="text-lg font-bold text-blue-600">৳60</p>
            <p className="text-xs text-gray-500">Major cities</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <Package className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Standard Delivery</h3>
            <p className="text-sm text-gray-600 mb-3">2-5 business days</p>
            <p className="text-lg font-bold text-purple-600">৳40</p>
            <p className="text-xs text-gray-500">Nationwide</p>
          </div>
        </div>

        {/* Delivery Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Areas</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Dhaka Division</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Same day & Express delivery available</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Dhaka</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Narayanganj</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Gazipur</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Manikganj</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Major Cities</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Express delivery available</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Chittagong</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Sylhet</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Rajshahi</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Khulna</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Globe className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">All Districts</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Standard delivery to all 64 districts</p>
                <p className="text-xs text-gray-500">2-5 business days delivery time</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Features</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600">Track your order in real-time with SMS updates</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Secure Packaging</h3>
                  <p className="text-sm text-gray-600">Items are securely packaged to prevent damage</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Cash on Delivery</h3>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <Package className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Schedule Delivery</h3>
                  <p className="text-sm text-gray-600">Choose your preferred delivery time slot</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Calculator */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Shipping Calculator</h2>
          
          <div className="max-w-md mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From (Vendor Location)
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To (Your Location)
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Select your district</option>
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                  <option>Rajshahi</option>
                  <option>Khulna</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="Enter weight"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Calculate Shipping Cost
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DeliveryInfo;
