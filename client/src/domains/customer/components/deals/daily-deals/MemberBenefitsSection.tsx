
import React from 'react';
import { Star, Gift, Award, Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const MemberBenefitsSection: React.FC = () => {
  const memberBenefits = [
    { icon: <Star className="w-6 h-6 text-yellow-500" />, title: 'Early Access', description: 'GetIt members get 1-hour early access to new deals, starting at 5:00 AM daily.' },
    { icon: <Gift className="w-6 h-6 text-purple-500" />, title: 'Exclusive Discounts', description: 'Additional 5-10% member-only discounts on selected daily deals.' },
    { icon: <Award className="w-6 h-6 text-green-500" />, title: 'Loyalty Rewards', description: 'Earn points on every purchase, redeemable for future discounts and special offers.' },
    { icon: <Bell className="w-6 h-6 text-blue-500" />, title: 'Deal Alerts', description: 'Personalized notifications for deals matching your shopping preferences and wishlist items.' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🌟 Member Benefits</h2>
          <p className="text-xl text-gray-600">Unlock exclusive perks and save even more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {memberBenefits.map((benefit, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-bold mb-3">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-full">
            🎯 Join as Member - It's Free!
          </Button>
        </div>
      </div>
    </section>
  );
};
