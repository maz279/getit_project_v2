
import React, { useState } from 'react';
import { Header } from '../components/customer/home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { Gift, CheckCircle, Clock, Users, Star, Shield, Truck, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewUserOffer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSignUp = () => {
    console.log('Sign up with email:', email);
  };

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-8">
              <Gift className="w-20 h-20 mx-auto mb-4 text-yellow-300 animate-bounce" />
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to GetIt!</h1>
              <p className="text-2xl mb-4">🎉 Get ৳200 off on your first purchase 🎉</p>
              <p className="text-lg opacity-90">Join thousands of happy customers and start saving today!</p>
            </div>
            
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto mb-8">
              <h2 className="text-3xl font-bold mb-6">✨ New User Special Benefits ✨</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">৳200 instant discount</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">Free delivery on first order</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">Priority customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">Access to member-only sales</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">Exclusive welcome deals</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-lg">Monthly special offers</span>
                </div>
              </div>
            </div>
            
            {/* Quick Sign Up Form */}
            <div className="bg-white rounded-2xl p-6 max-w-md mx-auto mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Claim Your Offer Now!</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800"
                />
                <button
                  onClick={handleSignUp}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  Sign Up & Get ৳200 Off
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                By signing up, you agree to our Terms & Conditions and Privacy Policy
              </p>
            </div>
            
            <div className="mt-8">
              <Link 
                to="/auth/register"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 rounded-full text-lg hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg inline-block"
              >
                Complete Registration →
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How to Claim Your ৳200 Discount</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">1</div>
                <h3 className="font-bold text-xl mb-3">Create Account</h3>
                <p className="text-gray-600 leading-relaxed">Sign up with your email or phone number. It's quick and easy - takes less than 2 minutes!</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">2</div>
                <h3 className="font-bold text-xl mb-3">Shop & Add to Cart</h3>
                <p className="text-gray-600 leading-relaxed">Browse millions of products and add items worth ৳500 or more to your cart to qualify for the discount.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">3</div>
                <h3 className="font-bold text-xl mb-3">Automatic Discount</h3>
                <p className="text-gray-600 leading-relaxed">৳200 discount will be automatically applied at checkout. No coupon code needed!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose GetIt */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose GetIt?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">100% Secure</h3>
                <p className="text-gray-600">Your data and payments are completely secure with bank-level encryption.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Truck className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick delivery across Bangladesh with real-time tracking.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <CreditCard className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Easy Payments</h3>
                <p className="text-gray-600">Multiple payment options including bKash, Nagad, and Cash on Delivery.</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Quality Products</h3>
                <p className="text-gray-600">Only authentic products from verified vendors with quality guarantee.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Testimonials */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
              <div>
                <div className="text-5xl font-bold text-purple-600 mb-2">50K+</div>
                <p className="text-gray-600 text-lg">Happy New Users This Month</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-purple-600 mb-2">৳2Cr+</div>
                <p className="text-gray-600 text-lg">Total Savings Generated</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-purple-600 mb-2">4.8★</div>
                <p className="text-gray-600 text-lg">Average User Rating</p>
              </div>
            </div>

            {/* Testimonials */}
            <h3 className="text-2xl font-bold text-center mb-8">What Our New Users Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Fatima Rahman",
                  comment: "The ৳200 discount was amazing! Got my first order delivered super fast. Highly recommend!",
                  rating: 5
                },
                {
                  name: "Karim Ahmed",
                  comment: "Easy signup process and genuine products. The welcome offer made it even better!",
                  rating: 5
                },
                {
                  name: "Rashida Begum",
                  comment: "Great customer service and the discount really helped. Will definitely shop again!",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-3 italic">"{testimonial.comment}"</p>
                  <p className="font-semibold text-purple-600">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Don't Miss Out!</h2>
            <p className="text-xl mb-8">Join GetIt today and start your shopping journey with ৳200 off</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/auth/register"
                className="bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Sign Up Now - It's Free!
              </Link>
              <Link 
                to="/products"
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-white hover:text-purple-600 transition-all"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewUserOffer;
