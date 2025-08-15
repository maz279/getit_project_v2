
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Clock, Zap } from 'lucide-react';

export const LimitedTimeOffersSection: React.FC = () => {
  const offers = [
    {
      title: "Buy 2 Get 1 Free",
      subtitle: "On all fashion items",
      timeLeft: "6 hours left",
      bgColor: "from-pink-500 to-purple-600"
    },
    {
      title: "Extra 20% OFF",
      subtitle: "On electronics above ৳25,000",
      timeLeft: "12 hours left",
      bgColor: "from-blue-500 to-cyan-600"
    },
    {
      title: "Free Shipping",
      subtitle: "On all orders today",
      timeLeft: "24 hours left",
      bgColor: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-orange-500" />
            <h2 className="text-4xl font-bold">⏰ Limited Time Offers</h2>
          </div>
          <p className="text-xl text-gray-600">Hurry! These deals won't last long</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${offer.bgColor} text-white p-8 text-center relative`}>
                  <Badge className="absolute top-4 right-4 bg-white/20 text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {offer.timeLeft}
                  </Badge>
                  
                  <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-lg opacity-90">{offer.subtitle}</p>
                </div>
                
                <div className="p-6 text-center">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Claim Offer Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
