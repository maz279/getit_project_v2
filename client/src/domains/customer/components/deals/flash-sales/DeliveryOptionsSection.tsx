
import React from 'react';
import { Truck, MapPin, Clock, DollarSign } from 'lucide-react';

export const DeliveryOptionsSection: React.FC = () => {
  const deliveryOptions = [
    {
      title: 'SAME DAY DELIVERY',
      location: 'Dhaka Metro Area', 
      time: 'Order by 2 PM',
      price: 'Only ৳60',
      icon: '🏃‍♂️',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'NEXT DAY DELIVERY',
      location: 'Major Cities',
      time: '24-48 hours', 
      price: 'Only ৳80',
      icon: '📅',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'PICKUP POINTS',
      location: '500+ locations',
      time: '2-3 days',
      price: 'FREE pickup', 
      icon: '🏪',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'NATIONWIDE DELIVERY',
      location: 'All 64 districts',
      time: '3-7 days',
      price: 'Only ৳120',
      icon: '🌍', 
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const partners = ['Pathao', 'Paperfly', 'Sundarban', 'RedX', 'eCourier'];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            🚚 FAST & RELIABLE DELIVERY 🚚
          </h2>
          <p className="text-gray-600">Get your orders delivered quickly and safely</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {deliveryOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                {option.icon}
              </div>
              <h3 className="font-bold text-center mb-4">{option.title}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {option.location}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {option.time}
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                  {option.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Powered by:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner, index) => (
              <span key={index} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
