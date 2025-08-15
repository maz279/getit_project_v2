
import React, { useState } from 'react';

export const FooterNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribed with email:', email);
    setEmail('');
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-purple-300 mb-4">Stay Updated</h4>
      <form onSubmit={handleSubscribe} className="space-y-2">
        <p className="text-sm text-gray-300">Subscribe to get exclusive deals, new product alerts, and insider updates</p>
        <div className="flex">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-l-md text-sm focus:outline-none focus:border-blue-500"
            required
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-r-md text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Subscribe
          </button>
        </div>
        <p className="text-xs text-gray-400">By subscribing, you agree to our Privacy Policy and Terms of Service</p>
      </form>
    </div>
  );
};
