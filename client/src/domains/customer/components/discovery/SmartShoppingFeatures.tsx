
import React from 'react';
import { Bell, Globe, CreditCard, Search, Mic, Camera, Zap } from 'lucide-react';

export const SmartShoppingFeatures: React.FC = () => {
  const features = [
    {
      icon: Bell,
      title: "Price Alerts & Notifications",
      description: "Get notified when new products arrive in your favorite categories or when prices drop on items you're watching.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Globe,
      title: "Local Language Support",
      description: "Shop comfortably in your preferred language with full Bangla and English support, including product descriptions and customer service.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Options",
      description: "Pay your way with bKash, Nagad, Rocket, bank transfers, or cash on delivery - whatever works best for you.",
      color: "from-blue-500 to-purple-500"
    }
  ];

  const discoveryTools = [
    {
      icon: Search,
      title: "Advanced Search & Filters",
      description: "Use our intuitive search with support for both English and Bangla keywords. Filter by price, location, brand, ratings, and delivery options.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Camera,
      title: "Visual Search",
      description: "Upload a photo to find similar products - perfect for discovering new arrivals that match your style preferences.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Mic,
      title: "Voice Search",
      description: "Search for new products using voice commands in Bangla or English for hands-free shopping convenience.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Zap,
      title: "Real-time Trends",
      description: "See what's popular among GetIt customers across Bangladesh with our live trending products section.",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Smart Shopping Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🤖 Smart Shopping Features</h2>
            <p className="text-gray-600 text-lg">Experience the future of online shopping with our AI-powered tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discovery Tools */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🔍 Easy Discovery Tools</h2>
            <p className="text-gray-600 text-lg">Find exactly what you're looking for with our advanced search capabilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {discoveryTools.map((tool, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className={`bg-gradient-to-r ${tool.color} p-3 rounded-lg`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{tool.title}</h3>
                    <p className="text-gray-600">{tool.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
