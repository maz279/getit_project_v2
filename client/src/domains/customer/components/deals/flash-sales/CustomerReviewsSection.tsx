
import React from 'react';
import { Star } from 'lucide-react';

export const CustomerReviewsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Rashida Khan',
      location: 'Dhaka',
      rating: 5,
      comment: 'Amazing prices and super fast delivery! Got my order in just 2 hours.',
      time: '2 hours ago'
    },
    {
      name: 'Mohammed Rahman', 
      location: 'Chittagong',
      rating: 5,
      comment: 'Best flash sale ever! Saved ৳15,000 on my phone purchase.',
      time: '5 hours ago'
    },
    {
      name: 'Fatima Begum',
      location: 'Sylhet', 
      rating: 5,
      comment: 'Easy bKash payment and excellent product quality. Highly recommended!',
      time: '1 day ago'
    },
    {
      name: 'Karim Ahmed',
      location: 'Rajshahi',
      rating: 5, 
      comment: 'Cash on delivery made it so convenient. Will shop again!',
      time: '2 days ago'
    }
  ];

  const liveActivity = [
    'Someone in Dhaka just bought: Samsung Galaxy A54',
    'Someone in Chittagong just bought: Air Fryer 5L', 
    'Someone in Sylhet just bought: Korean Skincare Set',
    'Someone in Khulna just bought: Cotton T-Shirt Combo'
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            ⭐ WHAT OUR CUSTOMERS SAY ⭐
          </h2>
          <p className="text-gray-600">Join 50,000+ happy customers across Bangladesh</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  👤
                </div>
                <div>
                  <h4 className="font-semibold">{review.name}, {review.location}</h4>
                  <div className="flex items-center">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-2">"{review.comment}"</p>
              <p className="text-sm text-gray-500">🕐 {review.time}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
          <h3 className="font-bold text-xl mb-4">🔴 LIVE ACTIVITY</h3>
          <div className="space-y-2 mb-4">
            {liveActivity.map((activity, index) => (
              <p key={index} className="text-sm">📍 {activity}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>⚡ 234 people are viewing this page right now</span>
            <span>🛒 15 items sold in the last 10 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};
