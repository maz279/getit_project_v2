import React from 'react';

export const DealsCountdown: React.FC = () => {
  return (
    <div className="bg-red-600 text-white p-4 mb-6">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">⚡ Flash Sale Ending Soon!</h2>
        <div className="text-lg">
          <span className="font-mono bg-red-700 px-2 py-1 rounded mr-2">02:45:32</span>
          <span>Time Remaining</span>
        </div>
      </div>
    </div>
  );
};