
import React from 'react';
import { Shield, Award, CheckCircle } from 'lucide-react';

export const TrustIndicatorsSection: React.FC = () => {
  const trustBadges = [
    'SSL Secured Website',
    'PCI DSS Certified', 
    'Bangladesh Bank Approved',
    'Consumer Protection Compliant',
    'ISO 27001 Certified'
  ];

  const awards = [
    'Best E-commerce Platform 2024',
    'Customer Choice Award 2024',
    'Digital Bangladesh Award 2024', 
    'Trusted Brand Award 2024'
  ];

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            🛡️ SHOP WITH CONFIDENCE 🛡️
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-xl font-bold">Security Certifications</h3>
            </div>
            <div className="space-y-3">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Award className="w-8 h-8 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold">Awards & Recognition</h3>
            </div>
            <div className="space-y-3">
              {awards.map((award, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-yellow-500 mr-3">🏆</span>
                  <span>{award}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
