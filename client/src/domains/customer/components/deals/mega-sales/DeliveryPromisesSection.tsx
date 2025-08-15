
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Truck, Clock, Shield, RotateCcw } from 'lucide-react';

export const DeliveryPromisesSection: React.FC = () => {
  const promises = [
    {
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: "Free Express Delivery",
      subtitle: "On orders above ৳1,500",
      description: "Same day delivery within Dhaka, next day for other cities"
    },
    {
      icon: <Clock className="w-12 h-12 text-green-600" />,
      title: "24-Hour Delivery",
      subtitle: "Lightning fast shipping",
      description: "Most items delivered within 24 hours in major cities"
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-600" />,
      title: "Secure Packaging",
      subtitle: "100% safe delivery",
      description: "Bubble wrap, protective boxes, and careful handling"
    },
    {
      icon: <RotateCcw className="w-12 h-12 text-orange-600" />,
      title: "Easy Returns",
      subtitle: "30-day return policy",
      description: "Free returns and exchanges, no questions asked"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🚚 Our Delivery Promise</h2>
          <p className="text-xl text-gray-600">Fast, secure, and reliable delivery nationwide</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promises.map((promise, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  {promise.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{promise.title}</h3>
                <p className="text-blue-600 font-semibold mb-3">{promise.subtitle}</p>
                <p className="text-gray-600 text-sm">{promise.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
