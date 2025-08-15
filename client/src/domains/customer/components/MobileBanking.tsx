
import React, { useState } from 'react';
import { Header } from '../components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { CreditCard, Shield, Zap, Gift, CheckCircle, Smartphone, Lock, Clock } from 'lucide-react';

const MobileBanking: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState('bkash');

  const mobileProviders = [
    {
      id: 'bkash',
      name: 'bKash',
      logo: '🔴',
      color: 'from-pink-500 to-red-500',
      cashback: '5%',
      features: ['Instant payment', 'No hidden fees', '24/7 support', 'Secure transactions']
    },
    {
      id: 'nagad',
      name: 'Nagad',
      logo: '🟠',
      color: 'from-orange-500 to-red-500',
      cashback: '5%',
      features: ['Quick processing', 'Low transaction fees', 'Wide acceptance', 'Digital receipts']
    },
    {
      id: 'rocket',
      name: 'Rocket',
      logo: '🟣',
      color: 'from-purple-500 to-blue-500',
      cashback: '5%',
      features: ['Easy setup', 'Reliable service', 'Mobile top-up', 'Bill payments']
    }
  ];

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <CreditCard className="w-20 h-20 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Mobile Banking Bonus</h1>
            <p className="text-2xl mb-8">💰 Get 5% cashback with bKash, Nagad & Rocket payments 💰</p>
            <p className="text-lg opacity-90 mb-8">The fastest, safest, and most rewarding way to pay online in Bangladesh</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
              {mobileProviders.map((provider) => (
                <div 
                  key={provider.id}
                  className={`bg-gradient-to-br ${provider.color} bg-opacity-20 backdrop-blur-sm rounded-xl p-6 cursor-pointer transition-all hover:scale-105 ${
                    selectedProvider === provider.id ? 'ring-4 ring-white' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <div className="text-6xl mb-4">{provider.logo}</div>
                  <h3 className="font-bold text-2xl mb-2">{provider.name}</h3>
                  <div className="text-3xl font-bold text-yellow-300 mb-2">{provider.cashback}</div>
                  <p className="text-sm opacity-90">Cashback on all payments</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cashback Calculator */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Calculate Your Cashback</h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-lg font-semibold mb-3">Purchase Amount (৳)</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-3">Payment Method</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg">
                    <option value="bkash">bKash (5% cashback)</option>
                    <option value="nagad">Nagad (5% cashback)</option>
                    <option value="rocket">Rocket (5% cashback)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg text-gray-600">Your Cashback</p>
                  <p className="text-4xl font-bold text-emerald-600">৳0</p>
                  <p className="text-sm text-gray-500 mt-2">Enter amount to calculate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Mobile Banking on GetIt?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
                <Zap className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Process payments in under 10 seconds with instant confirmation</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
                <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Bank-Level Security</h3>
                <p className="text-gray-600">256-bit encryption and multi-factor authentication protect your money</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
                <Gift className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Instant Cashback</h3>
                <p className="text-gray-600">Earn 5% cashback immediately credited to your account</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-emerald-100">
                <CreditCard className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Zero Hidden Fees</h3>
                <p className="text-gray-600">What you see is what you pay - completely transparent pricing</p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Pay Steps */}
        <section className="py-16 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How to Pay with Mobile Banking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">1</div>
                <h3 className="font-bold text-xl mb-3">Shop & Add to Cart</h3>
                <p className="text-gray-600 leading-relaxed">Browse our extensive collection and add your favorite products to cart. Enjoy shopping from millions of items!</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">2</div>
                <h3 className="font-bold text-xl mb-3">Choose Mobile Banking</h3>
                <p className="text-gray-600 leading-relaxed">At checkout, select your preferred mobile banking option: bKash, Nagad, or Rocket for instant 5% cashback.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">3</div>
                <h3 className="font-bold text-xl mb-3">Get Instant Cashback</h3>
                <p className="text-gray-600 leading-relaxed">Complete the payment and receive 5% cashback instantly. Your order will be processed immediately!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 md:p-12 text-white">
              <div className="text-center mb-12">
                <Lock className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                <h2 className="text-3xl font-bold mb-4">Your Security is Our Priority</h2>
                <p className="text-xl opacity-90">Advanced security measures protect every transaction</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">SSL Encryption</h3>
                  <p className="text-gray-300">All data encrypted with 256-bit SSL technology</p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">OTP Verification</h3>
                  <p className="text-gray-300">Two-factor authentication for added security</p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">24/7 Monitoring</h3>
                  <p className="text-gray-300">Round-the-clock fraud detection and prevention</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  question: "How does the 5% cashback work?",
                  answer: "You get 5% of your total purchase amount back instantly when you pay using bKash, Nagad, or Rocket. The cashback is credited to your GetIt wallet immediately after payment."
                },
                {
                  question: "Is there a minimum order amount for cashback?",
                  answer: "No, there's no minimum order amount. You earn 5% cashback on any purchase, regardless of the amount."
                },
                {
                  question: "How secure are mobile banking payments?",
                  answer: "Very secure! We use bank-level encryption and work directly with official APIs from bKash, Nagad, and Rocket. Your financial information is never stored on our servers."
                },
                {
                  question: "Can I use cashback for future purchases?",
                  answer: "Yes! Cashback earned is stored in your GetIt wallet and can be used for future purchases or withdrawn to your mobile banking account."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-2 text-emerald-600">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Start Earning Cashback Today!</h2>
            <p className="text-xl mb-8">Join millions of satisfied customers who save money with every purchase</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Shop Now & Earn Cashback
              </button>
              <button className="border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-emerald-600 transition-all">
                Learn More About Security
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default MobileBanking;
