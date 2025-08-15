
import React from 'react';
import { Header } from '../components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 15, 2025</p>
        </div>

        <div className="prose max-w-none">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome to GETIT</h2>
                <p className="text-gray-700">
                  These Terms of Service ("Terms") govern your use of the GETIT platform operated by GETIT Limited. 
                  By accessing or using our service, you agree to be bound by these Terms.
                </p>
              </div>
            </div>
          </div>

          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By creating an account, making a purchase, or using any part of our service, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">You must be at least 18 years old to use our service</span>
              </div>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Account Registration</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of our service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          {/* Use of Platform */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Use of Platform</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Permitted Uses</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Browse and purchase products from verified vendors</li>
                  <li>Create and manage your seller account (if applicable)</li>
                  <li>Leave honest reviews and ratings</li>
                  <li>Contact customer support for assistance</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Prohibited Activities
                </h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  <li>Listing or selling counterfeit, illegal, or prohibited items</li>
                  <li>Manipulating reviews or ratings</li>
                  <li>Using the platform for fraudulent activities</li>
                  <li>Violating intellectual property rights</li>
                  <li>Spamming or sending unsolicited communications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Seller Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Seller Terms</h2>
            <p className="text-gray-700 mb-4">
              If you register as a seller on our platform, you additionally agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide accurate product descriptions and images</li>
              <li>Honor the prices and terms you set for your products</li>
              <li>Process orders promptly and ship items as described</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Pay applicable fees and commissions</li>
            </ul>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Payment Terms</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                All prices are displayed in Bangladeshi Taka (BDT) and include applicable taxes unless otherwise specified.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">For Buyers</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Payment due at time of order</li>
                    <li>• Multiple payment methods accepted</li>
                    <li>• Refunds processed per our policy</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">For Sellers</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Commission fees apply to all sales</li>
                    <li>• Payments processed weekly</li>
                    <li>• Transaction fees may apply</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The GETIT platform, including its design, features, and content, is owned by GETIT Limited and protected by 
              intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Notice:</strong> By uploading content to our platform, you grant us a license to use, 
                display, and distribute that content in connection with our service.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              GETIT Limited provides the platform "as is" and makes no warranties regarding its availability, 
              accuracy, or fitness for any particular purpose. We are not liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Actions or omissions of third-party vendors</li>
              <li>Technical issues or platform downtime</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Termination</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms. 
              You may also terminate your account by contacting our customer support.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these Terms from time to time. We will notify you of any material changes by posting 
              the new Terms on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> legal@getit.com.bd</p>
              <p><strong>Phone:</strong> +880 1700 123456</p>
              <p><strong>Address:</strong> House 123, Road 12, Dhanmondi, Dhaka 1205, Bangladesh</p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
