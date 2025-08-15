
import React from 'react';
import { Header } from '../components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Store, BarChart3, DollarSign, Users, Package, TrendingUp, Settings, HeadphonesIcon } from 'lucide-react';

const SellerCenter: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Seller Center</h1>
          <p className="text-gray-600">Manage your business and grow your sales on GETIT</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">৳15,420</h3>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">156</h3>
            <p className="text-sm text-gray-600">Products Listed</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">1,234</h3>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg text-center">
            <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">4.8</h3>
            <p className="text-sm text-gray-600">Seller Rating</p>
          </div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Store className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Store Management</h3>
            <p className="text-gray-600 text-sm mb-4">Manage your store profile, branding, and settings</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Store →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Package className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Catalog</h3>
            <p className="text-gray-600 text-sm mb-4">Add, edit, and manage your product listings</p>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Manage Products →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <BarChart3 className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600 text-sm mb-4">Track sales, views, and performance metrics</p>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View Analytics →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Users className="w-10 h-10 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Management</h3>
            <p className="text-gray-600 text-sm mb-4">Process orders, track shipments, handle returns</p>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Manage Orders →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <DollarSign className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Gateway</h3>
            <p className="text-gray-600 text-sm mb-4">Setup payment methods and view transactions</p>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Setup Payments →
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Settings className="w-10 h-10 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Marketing Tools</h3>
            <p className="text-gray-600 text-sm mb-4">Promote your products with ads and campaigns</p>
            <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
              Start Marketing →
            </button>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Getting Started as a Seller</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Setup</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">1</div>
                  <span className="text-gray-700">Complete your seller profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">2</div>
                  <span className="text-gray-700">Verify your business documents</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">3</div>
                  <span className="text-gray-700">Add your first products</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">4</div>
                  <span className="text-gray-700">Start selling!</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller Benefits</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Access to millions of customers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Advanced analytics and insights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Marketing and promotion tools</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Dedicated seller support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Start Selling Today
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">Our seller support team is here to help you succeed</p>
          
          <div className="flex justify-center space-x-4">
            <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              <HeadphonesIcon className="w-5 h-5" />
              <span>Contact Support</span>
            </button>
            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50">
              <span>Seller University</span>
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SellerCenter;
