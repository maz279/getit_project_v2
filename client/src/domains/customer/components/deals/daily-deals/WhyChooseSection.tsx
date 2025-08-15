
import React from 'react';
import { CheckCircle, Zap, Shield } from 'lucide-react';

export const WhyChooseSection: React.FC = () => {
  const whyChooseFeatures = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: 'Verified Quality Products',
      description: 'Every deal features products from our rigorously vetted vendor network, ensuring authentic items and reliable service across Dhaka, Chittagong, Sylhet, and nationwide.'
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      title: 'Lightning-Fast Delivery',
      description: 'Same-day delivery available in major cities through our partnerships with Pathao, Paperfly, and Sundarban courier services.'
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: 'Transparent Pricing',
      description: 'No hidden fees. All prices include applicable VAT and are displayed in Bangladeshi Taka (BDT) with clear savings calculations.'
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-500" />,
      title: 'Secure Payment Options',
      description: 'Pay your way with bKash, Nagad, Rocket, bank transfer, or cash on delivery (COD) - all transactions protected by advanced security protocols.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">✨ Why Choose GetIt Daily Deals?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the best in quality, service, and value with every purchase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseFeatures.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
