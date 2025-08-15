
import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

export const SeasonalCollections: React.FC = () => {
  const collections = [
    {
      title: 'Winter Collection 2024',
      description: 'Cozy sweaters, warm jackets, and winter essentials',
      image: '/placeholder.svg',
      itemCount: 150,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Festival Special',
      description: 'Traditional wear and festive decorations',
      image: '/placeholder.svg',
      itemCount: 200,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'New Year Tech',
      description: 'Latest gadgets and smart devices',
      image: '/placeholder.svg',
      itemCount: 75,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Seasonal Collections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className={`bg-gradient-to-br ${collection.color} p-8 text-white min-h-[300px] flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm opacity-90">New Collection</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{collection.title}</h3>
                  <p className="text-white/90 mb-6">{collection.description}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">{collection.itemCount} New Items</span>
                  </div>
                  
                  <button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-2 rounded-lg hover:bg-white/30 transition-colors">
                    Explore Collection
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
