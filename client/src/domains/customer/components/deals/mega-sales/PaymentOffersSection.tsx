
import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { CreditCard, Smartphone, Banknote, Gift } from 'lucide-react';

export const PaymentOffersSection: React.FC = () => {
  const paymentOffers = [
    {
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      method: "Credit/Debit Cards",
      offer: "Extra 10% Cashback",
      details: "Up to ৳2,000 cashback on min purchase ৳10,000",
      code: "CARD10"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
      method: "Mobile Banking",
      offer: "Instant 5% Discount",
      details: "bKash, Rocket, Nagad - No minimum purchase",
      code: "MOBILE5"
    },
    {
      icon: <Banknote className="w-8 h-8 text-purple-600" />,
      method: "Bank Transfer",
      offer: "12% Extra Savings",
      details: "Direct bank transfer for orders above ৳15,000",
      code: "BANK12"
    },
    {
      icon: <Gift className="w-8 h-8 text-pink-600" />,
      method: "EMI Options",
      offer: "0% Interest EMI",
      details: "6-12 months EMI on electronics & home appliances",
      code: "EMI0"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">💳 Exclusive Payment Offers</h2>
          <p className="text-xl text-gray-600">Save more with our payment partner offers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentOffers.map((offer, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {offer.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{offer.method}</h3>
                <Badge className="bg-green-100 text-green-800 mb-3 text-sm">
                  {offer.offer}
                </Badge>
                <p className="text-sm text-gray-600 mb-4">{offer.details}</p>
                <div className="bg-gray-100 rounded-lg p-2">
                  <span className="text-xs font-mono font-bold">Code: {offer.code}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
