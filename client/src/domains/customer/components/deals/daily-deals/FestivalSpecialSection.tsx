
import React from 'react';

export const FestivalSpecialSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">🎊 Festival Special Deals</h2>
          <p className="text-xl mb-8">Celebrate Bangladesh's rich culture with special festival offers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🌙</div>
            <h3 className="text-xl font-bold mb-3">Eid Collections</h3>
            <p>Spectacular savings during Eid-ul-Fitr and Eid-ul-Adha with extended deal periods and cultural product focus.</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎊</div>
            <h3 className="text-xl font-bold mb-3">Pohela Boishakh</h3>
            <p>Bengali New Year special deals featuring traditional handicrafts, clothing, and cultural items.</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎆</div>
            <h3 className="text-xl font-bold mb-3">Victory & Independence Day</h3>
            <p>Patriotic product collections and nationwide shipping promotions honoring Bangladesh's heritage.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
