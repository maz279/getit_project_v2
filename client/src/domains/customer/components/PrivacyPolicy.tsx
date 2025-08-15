
import React from 'react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { Shield, Eye, Lock, Users, Database, Settings } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 15, 2025</p>
        </div>

        <div className="prose max-w-none">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your Privacy Matters</h2>
                <p className="text-gray-700">
                  At GETIT, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, and safeguard your data.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Database className="w-6 h-6 mr-2 text-green-600" />
              1. Information We Collect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Name and contact details</li>
                  <li>• Email address and phone number</li>
                  <li>• Delivery address</li>
                  <li>• Payment information</li>
                  <li>• Date of birth (for age verification)</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Usage Information</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Browsing history on our platform</li>
                  <li>• Purchase history and preferences</li>
                  <li>• Device and browser information</li>
                  <li>• IP address and location data</li>
                  <li>• Cookies and tracking data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-purple-600" />
              2. How We Use Your Information
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Service Delivery</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Processing and fulfilling your orders</li>
                  <li>• Providing customer support</li>
                  <li>• Sending order confirmations and updates</li>
                  <li>• Managing your account and preferences</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Platform Improvement</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Personalizing your shopping experience</li>
                  <li>• Analyzing usage patterns and trends</li>
                  <li>• Improving our platform and services</li>
                  <li>• Developing new features</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Communication</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Sending promotional offers (with consent)</li>
                  <li>• Providing important updates about our service</li>
                  <li>• Responding to your inquiries</li>
                  <li>• Conducting surveys and feedback collection</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-orange-600" />
              3. Information Sharing
            </h2>
            
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800">With Vendors</h3>
                <p className="text-sm text-gray-700">We share necessary order information with vendors to fulfill your purchases.</p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-800">Service Providers</h3>
                <p className="text-sm text-gray-700">Trusted partners who help us operate our platform (payment processors, delivery services).</p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-800">Legal Requirements</h3>
                <p className="text-sm text-gray-700">When required by law or to protect our rights and users' safety.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-red-600" />
              4. Data Security
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>SSL encryption for all data transmission</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Regular security audits</span>
                  </li>
                </ul>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Access controls and monitoring</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Data backup and recovery systems</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Employee privacy training</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-indigo-600" />
              5. Your Rights
            </h2>
            
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <h3 className="font-semibold text-indigo-800 text-sm">Access</h3>
                  <p className="text-xs text-indigo-700">Request a copy of your personal data</p>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <h3 className="font-semibold text-indigo-800 text-sm">Correction</h3>
                  <p className="text-xs text-indigo-700">Update or correct your information</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <h3 className="font-semibold text-indigo-800 text-sm">Deletion</h3>
                  <p className="text-xs text-indigo-700">Request deletion of your data</p>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <h3 className="font-semibold text-indigo-800 text-sm">Portability</h3>
                  <p className="text-xs text-indigo-700">Export your data in a readable format</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies and Tracking</h2>
            
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your browsing experience and analyze platform usage.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Types of Cookies We Use:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>Essential:</strong> Required for basic platform functionality</li>
                <li>• <strong>Analytics:</strong> Help us understand how you use our platform</li>
                <li>• <strong>Marketing:</strong> Used to personalize ads and content (with consent)</li>
                <li>• <strong>Preferences:</strong> Remember your settings and preferences</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Our Privacy Team</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Privacy Officer:</strong> privacy@getit.com.bd</p>
              <p><strong>Phone:</strong> +880 1700 123456</p>
              <p><strong>Address:</strong> House 123, Road 12, Dhanmondi, Dhaka 1205, Bangladesh</p>
            </div>
            
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> We will respond to your privacy requests within 30 days and may require 
                identity verification for security purposes.
              </p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
