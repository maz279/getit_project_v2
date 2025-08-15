
import React from 'react';
import { ArrowRight, Phone, MessageCircle, CheckCircle } from 'lucide-react';

export const GetStartedSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6">🌟 Get Started Today</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Ready to explore the latest products from Bangladesh's most trusted vendors? 
            Browse our new arrivals now and discover your next favorite purchase.
          </p>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of satisfied customers who trust GetIt for their online shopping needs.
          </p>
          
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
            Start Shopping New Arrivals
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Verified Vendors</h3>
            <p className="text-sm opacity-90">All sellers go through our strict verification process</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm opacity-90">Multiple payment options with buyer protection</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm opacity-90">Nationwide delivery through trusted courier partners</p>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-6">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
              <Phone className="w-6 h-6" />
              <span className="font-medium">📞 Contact our support team</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 rounded-lg p-4">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">🤖 Use our AI-powered chatbot</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white/10 rounded-lg">
            <p className="font-medium mb-2">🔔 Stay Updated</p>
            <p className="text-sm opacity-90">Enable notifications to be the first to know about exciting new arrivals in your favorite categories.</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12 border-t border-white/20 pt-8">
          <p className="text-lg font-medium mb-2">GetIt - Bangladesh's trusted multi-vendor ecommerce platform</p>
          <p className="text-sm opacity-90">Connecting customers with quality products and reliable vendors across the nation.</p>
        </div>
      </div>
    </section>
  );
};
