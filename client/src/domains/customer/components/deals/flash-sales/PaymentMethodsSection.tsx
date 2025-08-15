
import React from 'react';
import { Button } from '@/shared/ui/button';
import { CreditCard } from 'lucide-react';

export const PaymentMethodsSection: React.FC = () => {
  const paymentMethods = [
    {
      name: 'bKash',
      icon: '📱',
      features: ['Instant payment', '0% extra charge', 'Mobile wallet'],
      color: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Nagad',
      icon: '💰',
      features: ['Quick & secure', 'Special discounts', 'Government trusted'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Rocket',
      icon: '🚀',
      features: ['Fast processing', 'Safe transactions', 'Wide acceptance'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Credit/Debit Cards',
      icon: '💳',
      features: ['Visa, Mastercard', 'Secure encryption', 'International cards'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Cash on Delivery',
      icon: '📦',
      features: ['Pay when you receive', 'Available nationwide', 'No advance payment'],
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Bank Transfer',
      icon: '💵',
      features: ['Direct bank payment', 'All major banks', 'Secure processing'],
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            💳 PAY YOUR WAY - SAFE & SECURE 💳
          </h2>
          <p className="text-gray-600">Choose from Bangladesh's most trusted payment methods</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center text-white text-xl mb-4`}>
                {method.icon}
              </div>
              <h3 className="font-bold text-lg mb-3">{method.name}</h3>
              <ul className="space-y-2 mb-4">
                {method.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center">
                    <span className="text-green-500 mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className={`w-full bg-gradient-to-r ${method.color} text-white`}>
                Choose {method.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
