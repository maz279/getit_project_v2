
import React, { useState } from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Package, RefreshCw, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ReturnsRefunds: React.FC = () => {
  const [selectedReason, setSelectedReason] = useState('');

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Returns & Refunds</h1>
          <p className="text-gray-600">Easy returns and quick refunds for your peace of mind</p>
        </div>

        {/* Return Policy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">30-Day Returns</h3>
            <p className="text-sm text-gray-600">Return items within 30 days of delivery</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Quick Refunds</h3>
            <p className="text-sm text-gray-600">Get refunds within 5-7 business days</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <Package className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Free Pickup</h3>
            <p className="text-sm text-gray-600">Free pickup service for returns</p>
          </div>
        </div>

        {/* Return Request Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Request Return</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your order number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Defective Product</option>
                  <option value="wrong-item">Wrong Item Received</option>
                  <option value="not-as-described">Not as Described</option>
                  <option value="changed-mind">Changed Mind</option>
                  <option value="damaged">Damaged in Transit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue in detail"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Return Request
              </button>
            </form>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Return Process</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Submit Request</h3>
                  <p className="text-sm text-gray-600">Fill out the return form with order details</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Approval</h3>
                  <p className="text-sm text-gray-600">We'll review and approve your request within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Pickup</h3>
                  <p className="text-sm text-gray-600">Free pickup service will collect the item</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Refund</h3>
                  <p className="text-sm text-gray-600">Refund processed within 5-7 business days</p>
                </div>
              </div>
            </div>
            
            {/* Return Policy Highlights */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Items must be in original condition</li>
                    <li>• Keep original packaging and tags</li>
                    <li>• Some items are non-returnable (perishables, custom items)</li>
                    <li>• Return shipping is free for defective items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ReturnsRefunds;
